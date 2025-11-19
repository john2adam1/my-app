import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
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

    const transactions = await Transaction.find({
      $or: [{ fromUser: payload.userId }, { toUser: payload.userId }],
    })
      .populate("fromUser", "username")
      .populate("toUser", "username")
      .populate("post", "text")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ transactions });
  } catch (error: any) {
    console.error("Transactions list error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

