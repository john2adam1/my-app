// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { comparePassword } from "@/utils/hash";
import { createAuthResponse } from "@/services/authService";

export async function POST(req: Request) {
  const body = await req.json();
  const { emailOrUsername, password } = body;

  if (!emailOrUsername || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await connectDB();

  const user = await User.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
  });

  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const ok = comparePassword(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  return createAuthResponse({ userId: user._id.toString(), username: user.username });
}
