// app/api/user/follow/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/services/authService";
import { getTokenFromCookie } from "@/utils/cookies";
import { toggleFollow } from "@/services/userService";

export async function POST(req: Request) {
  try {
    await connectDB();

    const token = getTokenFromCookie(req.headers.get("cookie"));
    if (!token)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const payload: any = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { targetId } = await req.json();
    if (!targetId) {
      return NextResponse.json({ error: "targetId required" }, { status: 400 });
    }

    const result = await toggleFollow(payload.userId, targetId);
    return NextResponse.json({ ok: true, ...result });
  } catch (error: any) {
    console.error("Follow error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: error.message === "Cannot follow yourself" ? 400 : 500 }
    );
  }
}
