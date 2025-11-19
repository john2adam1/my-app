import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ message: "MongoDB ulandi!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Databasega ulanishda xatolik" },
      { status: 500 }
    );
  }
}
