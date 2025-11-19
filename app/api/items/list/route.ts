import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Item from "@/models/Item";

export async function GET(req: Request) {
  try {
    await connectDB();

    const items = await Item.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("Items list error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

