import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
          data: null,
        },
        { status: 401 }
      );
    }

    const data = await prisma.image.findMany({
      where: {
        clerkId: user.id,
      },
      include: {
        user: {
          select: {
            imageUrl: true,
            name: true,
            id: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "User creations fetched successfully",
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        data: null,
      },
      { status: 500 }
    );
  }
}
