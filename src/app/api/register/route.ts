import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password || password.length < 8) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const existingUser = await prisma.users.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json({ message: "Username already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        username,
        password: hashedPassword,
        role: "user"
      }
    });

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
