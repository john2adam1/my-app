import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/services/authService";

export async function GET(req: Request) {
  try {
    await connectDB();

    // Get token from cookie
    const { getTokenFromCookie } = await import("@/utils/cookies");
    const token = getTokenFromCookie(req.headers.get("cookie"));

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload: any = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await User.findById(payload.userId)
      .select("-passwordHash")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("User fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

