import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function checkUser() {
  const user = await currentUser();
  if (!user) return null;
  try {
    const existUser = await prisma.user.findUnique({
      where: {
        clerkId: user.id,
      },
    });

    if (existUser) {
      return existUser;
    }

    const name = `${user.firstName} ${
      user.lastName != null ? user.lastName : ""
    }`;

    const newUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        name,
        imageUrl: user.imageUrl as string,
        email: user.emailAddresses[0].emailAddress,
      },
    });

    return newUser;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    }
  }
}
