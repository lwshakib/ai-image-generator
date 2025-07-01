import { generateImageV1 } from "@/actions/ai-related-tasks";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      negativePrompt,
      width,
      height,
      seed,
      responseExt,
      numInferenceSteps,
    } = await req.json();

    const newImage = await generateImageV1(
      prompt,
      negativePrompt,
      width,
      height,
      seed,
      responseExt,
      numInferenceSteps
    );

    if (newImage?.code === 403) {
      return NextResponse.json(
        {
          success: false,
          message: "Upgrade Plan To get Unlimited Image generation",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Prompt Enhanced Successfully",
        data: newImage,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.log(error?.message);
      return NextResponse.json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }
}
