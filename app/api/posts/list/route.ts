// app/api/posts/list/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";

export async function GET() {
  await connectDB();

  const posts = await Post.find({})
    .populate("author", "username avatarUrl name")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ posts });
}
