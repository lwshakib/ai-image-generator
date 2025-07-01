import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await prisma?.image.findMany({
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
  return NextResponse.json({ success: true, data });
}
