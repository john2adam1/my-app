import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Process from "@/models/Process";
import { verifyToken } from "@/services/authService";
import { getTokenFromCookie } from "@/utils/cookies";

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

    const { title, startDate } = await req.json();

    if (!title || !startDate) {
      return NextResponse.json(
        { error: "title and startDate are required" },
        { status: 400 }
      );
    }

    const process = await Process.create({
      owner: payload.userId,
      title,
      startDate: new Date(startDate),
      status: "active",
    });

    return NextResponse.json({ ok: true, process }, { status: 201 });
  } catch (error: any) {
    console.error("Process create error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

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

    const processes = await Process.find({ owner: payload.userId })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate daysPassed for each
    const processesWithDays = processes.map((p: any) => ({
      ...p,
      daysPassed: Math.floor(
        (Date.now() - new Date(p.startDate).getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));

    return NextResponse.json({ processes: processesWithDays });
  } catch (error: any) {
    console.error("Process list error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

