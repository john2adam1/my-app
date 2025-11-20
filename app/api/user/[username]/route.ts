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

    // Track if we found the user by email (for redirect purposes)
    let foundByEmail = false;
    
    // If still not found and it looks like an email, try searching by email
    if (!user && username.includes('@')) {
      user = await User.findOne({ email: username })
        .select("-passwordHash")
        .lean();
      
      if (user) {
        foundByEmail = true;
      } else {
        // Also try case-insensitive email match
        user = await User.findOne({ 
          email: { $regex: new RegExp(`^${username}$`, 'i') }
        })
          .select("-passwordHash")
          .lean();
        
        if (user) {
          foundByEmail = true;
        }
      }
    }

    if (!user) {
      console.log(`User not found: "${username}" (decoded from "${params.username}")`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If user was found by email, include a flag to indicate they should use username
    // Only redirect if the username is different from the email used to find them
    const shouldRedirect = foundByEmail && user.username && 
                          user.username.toLowerCase() !== username.toLowerCase();
    
    return NextResponse.json({ 
      user,
      ...(shouldRedirect && { shouldRedirect: true, correctUsername: user.username })
    });
  } catch (error: any) {
    console.error("User fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

