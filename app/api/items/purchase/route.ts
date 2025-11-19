import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Item from "@/models/Item";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
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

    const { itemId } = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: "itemId required" }, { status: 400 });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Check stock
    if (item.stock !== -1 && item.stock <= 0) {
      return NextResponse.json({ error: "Item out of stock" }, { status: 400 });
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check balance
    if (user.stars < item.priceStars) {
      return NextResponse.json({ error: "Insufficient stars" }, { status: 400 });
    }

    // Deduct stars
    user.stars -= item.priceStars;
    await user.save();

    // Decrement stock if not unlimited
    if (item.stock !== -1) {
      item.stock -= 1;
      await item.save();
    }

    // Create transaction
    const transaction = await Transaction.create({
      fromUser: payload.userId,
      amountStars: item.priceStars,
      type: "purchase",
    });

    return NextResponse.json({ ok: true, transaction, remainingStars: user.stars });
  } catch (error: any) {
    console.error("Purchase error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

