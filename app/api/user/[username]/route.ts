import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  try {
    await connectDB();

    // Decode URL-encoded username
    const username = decodeURIComponent(params.username);
    
    // Try exact match first
    let user = await User.findOne({ username })
      .select("-passwordHash")
      .lean();

    // If not found, try case-insensitive match
    if (!user) {
      user = await User.findOne({ 
        username: { $regex: new RegExp(`^${username}$`, 'i') }
      })
        .select("-passwordHash")
        .lean();
    }

    if (!user) {
      console.log(`User not found: "${username}" (decoded from "${params.username}")`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("User fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

