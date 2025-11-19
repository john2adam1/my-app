// app/api/posts/create/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";
import User from "@/models/User";
import { verifyToken } from "@/services/authService";

export async function POST(req: Request) {
  await connectDB();

  const { getTokenFromCookie } = await import("@/utils/cookies");
  const token = getTokenFromCookie(req.headers.get("cookie"));

  if (!token)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const payload: any = verifyToken(token);
  if (!payload)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const body = await req.json();
  const { text, imageUrl } = body;

  if (!text && !imageUrl)
    return NextResponse.json(
      { error: "Text or imageUrl required" },
      { status: 400 }
    );

  const post = await Post.create({
    author: payload.userId,
    text,
    imageUrl,
  });

  return NextResponse.json({ ok: true, post });
}
