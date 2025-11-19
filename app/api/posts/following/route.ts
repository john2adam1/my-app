// app/api/posts/following/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";
import User from "@/models/User";
import { verifyToken } from "@/services/authService";
import { getTokenFromCookie } from "@/utils/cookies";

export async function GET(req: Request) {
  try {
    await connectDB();

    const token = getTokenFromCookie(req.headers.get("cookie"));
    if (!token)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const payload: any = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get posts from users being followed
    const posts = await Post.find({
      author: { $in: user.following },
    })
      .populate("author", "username avatarUrl name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error("Following feed error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
