// app/api/posts/like/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/services/authService";
import { getTokenFromCookie } from "@/utils/cookies";
import { toggleLike } from "@/services/postService";

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

    const { postId } = await req.json();
    if (!postId) {
      return NextResponse.json({ error: "postId required" }, { status: 400 });
    }

    const result = await toggleLike(postId, payload.userId);
    return NextResponse.json({ ok: true, ...result });
  } catch (error: any) {
    console.error("Like error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
    