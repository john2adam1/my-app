import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword } from "@/utils/hash";
import { createAuthResponse } from "@/services/authService";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { name, username, email, password } = await req.json();

    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const exist = await User.findOne({ $or: [{ email }, { username }] });
    if (exist) {
      return NextResponse.json(
        { error: "Email or username already taken" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = hashPassword(password);

    const newUser = await User.create({
      name,
      username,
      email,
      passwordHash,
    });

    // Set auth cookie and return response
    return createAuthResponse({
      userId: newUser._id.toString(),
      username: newUser.username,
    });
  } catch (error: any) {
    console.error(error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Email or username already taken" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
