import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { IUser } from "@/types/User";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    await connectDB();

    // Await params in Next.js 16
    const { username } = await params;
    const decodedUsername = decodeURIComponent(username);

    let user: IUser | null = await User.findOne({ username: decodedUsername })
      .select("-passwordHash")
      .lean<IUser>();

    if (!user) {
      const escaped = decodedUsername.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      user = await User.findOne({
        username: { $regex: new RegExp(`^${escaped}$`, "i") },
      })
        .select("-passwordHash")
        .lean<IUser>();
    }

    let foundByEmail = false;

    if (!user && decodedUsername.includes("@")) {
      user = await User.findOne({ email: decodedUsername })
        .select("-passwordHash")
        .lean<IUser>();

      if (user) foundByEmail = true;

      if (!user) {
        const escapedEmail = decodedUsername.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

        user = await User.findOne({
          email: { $regex: new RegExp(`^${escapedEmail}$`, "i") },
        })
          .select("-passwordHash")
          .lean<IUser>();

        if (user) foundByEmail = true;
      }
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const shouldRedirect =
      foundByEmail &&
      user.username.toLowerCase() !== decodedUsername.toLowerCase();

    return NextResponse.json({
      user,
      ...(shouldRedirect && {
        shouldRedirect: true,
        correctUsername: user.username,
      }),
    });
  } catch (error: any) {
    console.error("User fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}