"use server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const client = new OpenAI({
  baseURL: "https://api.studio.nebius.com/v1/",
  apiKey: process.env.NEBIUS_API_KEY,
});

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export async function generateImageV1(
  prompt: string,
  negativePrompt: string = "",
  width: number,
  height: number,
  seed: number = -1,
  responseExt: string = "png",
  numInferenceSteps: number = 4
): Promise<any | null> {
  try {
    const user = await currentUser();

    if (!user) return null;

    const result = await checkImageGenerationEligibility(user);
    if (!result)
      return {
        code: 403,
        message:
          "You have no free Credits. Upgrade Plan To get Unlimited Image generation",
      };

    // Input validation
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      throw new Error("Prompt must be a non-empty string.");
    }

    const validExts = ["png", "jpg"];
    if (!validExts.includes(responseExt)) {
      responseExt = "png"; // fallback
    }

    // Clamp values to acceptable ranges
    const safeWidth = clamp(width, 64, 2048);
    const safeHeight = clamp(height, 64, 2048);
    const safeSteps = clamp(numInferenceSteps, 1, 100);
    const safeSeed = seed < 0 ? Math.floor(Math.random() * 1000000) : seed;
    const response = await client.images.generate({
      model: "black-forest-labs/flux-schnell",
      response_format: "url",
      // @ts-expect-error
      response_extension: responseExt,
      width: safeWidth,
      height: safeHeight,
      num_inference_steps: safeSteps,
      negative_prompt: negativePrompt || "",
      seed: safeSeed,
      prompt: prompt.trim(),
    });

    // Assuming response format includes image URL(s)
    if (response?.data?.[0]?.url) {
      const newImage = await prisma.image.create({
        data: {
          clerkId: user.id,
          fileFormat: responseExt,
          imageUrl: response.data[0].url,
          width: safeWidth,
          height: safeHeight,
          prompt,
          negativePrompt,
          seed,
          inferenceSteps: numInferenceSteps,
        },
      });
      return newImage;
    } else {
      console.warn(
        "Image generation response was empty or malformed:",
        response
      );
      return null;
    }
  } catch (error) {
    console.error("Error during image generation:", error);
    return null;
  }
}

export async function enhancePrompt(prompt: string): Promise<string | null> {
  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return null;
  }

  try {
    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are an AI prompt enhancement agent specialized in optimizing textual prompts to achieve high-quality, photorealistic, or stylistically rich image generation outputs. Improve the given prompt by adding precise visual details, artistic elements, composition guidance, and descriptive adjectives. Your response must contain only the enhanced prompt as plain text, with no explanations or extra text.",
      },
    });

    const enhancedPrompt = result.text;

    return enhancedPrompt?.trim() || null;
  } catch (error) {
    console.error("Prompt enhancement failed:", error);
    return null;
  }
}

async function checkImageGenerationEligibility(user: any) {
  const { has } = await auth();
  const response = await prisma.user.findUnique({
    where: {
      clerkId: user.id,
    },
  });

  if (!response) return false;

  if (response.credits > 0) {
    await prisma.user.update({
      where: {
        clerkId: user.id,
      },
      data: {
        credits: {
          decrement: 1,
        },
      },
    });
    return true;
  } else {
    const hasPremiumAccess = await has({ plan: "pro" });
    if (hasPremiumAccess) return true;
    return false;
  }
}
