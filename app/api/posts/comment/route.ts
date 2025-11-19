// app/api/posts/comment/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/services/authService";
import { getTokenFromCookie } from "@/utils/cookies";
import { addCommentWithDonation } from "@/services/postService";

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

    const { postId, text, donatedStars } = await req.json();

    if (!postId || !text) {
      return NextResponse.json(
        { error: "postId and text are required" },
        { status: 400 }
      );
    }

    const donatedStarsNum = Number(donatedStars) || 0;
    if (donatedStarsNum < 0) {
      return NextResponse.json(
        { error: "donatedStars must be non-negative" },
        { status: 400 }
      );
    }

    const result = await addCommentWithDonation(
      postId,
      payload.userId,
      text,
      donatedStarsNum
    );

    // Populate the post with author and comment user details
    const populatedPost = await result.post.populate([
      { path: "author", select: "username avatarUrl name" },
      { path: "comments.user", select: "username avatarUrl" },
    ]);

    return NextResponse.json({ ok: true, post: populatedPost });
  } catch (error: any) {
    console.error("Comment error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: error.message === "Insufficient stars" ? 400 : 500 }
    );
  }
}
