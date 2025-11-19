import Post from "@/models/Post";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import mongoose from "mongoose";

/**
 * Toggle like on a post
 */
export async function toggleLike(
  postId: string,
  userId: string
): Promise<{ liked: boolean; likesCount: number }> {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error("Post not found");
  }

  const userIdObj = new mongoose.Types.ObjectId(userId);
  const isLiked = post.likes.some((id) => id.toString() === userId);

  if (isLiked) {
    post.likes = post.likes.filter((id) => id.toString() !== userId);
  } else {
    if (!post.likes.includes(userIdObj)) {
      post.likes.push(userIdObj);
    }
  }

  await post.save();
  return { liked: !isLiked, likesCount: post.likes.length };
}

/**
 * Add comment with optional star donation
 * Handles star transfer atomically
 */
export async function addCommentWithDonation(
  postId: string,
  userId: string,
  text: string,
  donatedStars: number = 0
): Promise<{ post: any; transaction?: any }> {
  const post = await Post.findById(postId).populate("author");
  if (!post) {
    throw new Error("Post not found");
  }

  const donor = await User.findById(userId);
  if (!donor) {
    throw new Error("User not found");
  }

  // If donating stars, check balance and transfer
  if (donatedStars > 0) {
    if (donor.stars < donatedStars) {
      throw new Error("Insufficient stars");
    }

    const author = post.author as any;
    if (!author) {
      throw new Error("Post author not found");
    }

    // Atomic operations: decrement donor, increment author, create transaction, add comment
    donor.stars -= donatedStars;
    author.stars += donatedStars;

    await donor.save();
    await author.save();

    // Create transaction record
    const transaction = await Transaction.create({
      fromUser: userId,
      toUser: author._id,
      post: postId,
      amountStars: donatedStars,
      type: "donation",
    });

    // Add comment
    post.comments.push({
      user: userId,
      text,
      donatedStars,
      createdAt: new Date(),
    });

    await post.save();

    return { post, transaction };
  } else {
    // Just add comment without donation
    post.comments.push({
      user: userId,
      text,
      donatedStars: 0,
      createdAt: new Date(),
    });

    await post.save();
    return { post };
  }
}

