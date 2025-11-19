import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
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

    const notifications = await Notification.find({ user: payload.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error("Notifications list error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();

    const token = getTokenFromCookie(req.headers.get("cookie"));
    if (!token)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const payload: any = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { notificationId, read } = await req.json();

    if (!notificationId) {
      return NextResponse.json(
        { error: "notificationId required" },
        { status: 400 }
      );
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: payload.userId },
      { read: read !== undefined ? read : true },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, notification });
  } catch (error: any) {
    console.error("Notification update error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

