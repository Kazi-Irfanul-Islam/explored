import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ available: false }, { status: 400 });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { username },
      select: { id: true }
    });

    return NextResponse.json({ available: !user });
  } catch (error) {
    console.error("Error checking username:", error);
    return NextResponse.json({ available: false }, { status: 500 });
  }
}
