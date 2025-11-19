// app/api/posts/recommended/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";

export async function GET() {
  await connectDB();

  const allPosts = await Post.find({})
    .populate("author", "username avatarUrl name")
    .lean();

  const posts = allPosts.sort((a: any, b: any) => {
    const likesDiff = (b.likes?.length || 0) - (a.likes?.length || 0);
    if (likesDiff !== 0) return likesDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return NextResponse.json({ posts });
}
