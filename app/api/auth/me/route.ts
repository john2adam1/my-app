// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/services/authService";

export async function GET(req: Request) {
  await connectDB();

  // Get token from cookie
  const { getTokenFromCookie } = await import("@/utils/cookies");
  const token = getTokenFromCookie(req.headers.get("cookie"));

  if (!token) return NextResponse.json({ user: null }, { status: 200 });

  const payload: any = verifyToken(token);
  if (!payload) return NextResponse.json({ user: null }, { status: 200 });

  const user = await User.findById(payload.userId)
    .select("-passwordHash")
    .lean();
  if (!user) return NextResponse.json({ user: null }, { status: 200 });

  return NextResponse.json({ user });
}
