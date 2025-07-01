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

    const data = await prisma.favorite.findMany({
      where: {
        clerkId: user.id,
      },
      include: {
        image: {
          include: {
            user: {
              select: {
                imageUrl: true,
                name: true,
                id: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "User Favorites fetched successfully",
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

export async function POST(req: NextRequest) {
  try {
    const { imageId } = await req.json();
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

    const data = await prisma.favorite.create({
      data: {
        clerkId: user.id,
        imageId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Added To favorites",
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

export async function DELETE(req: NextRequest) {
  try {
    const { favoriteId } = await req.json();
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

    const data = await prisma.favorite.delete({
      where: {
        id: favoriteId,
        clerkId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Added To favorites",
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
