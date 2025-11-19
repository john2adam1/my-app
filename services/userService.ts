import User from "@/models/User";
import mongoose from "mongoose";

/**
 * Follow or unfollow a user
 * @param currentUserId - The user performing the action
 * @param targetUserId - The user to follow/unfollow
 * @returns { following: boolean } - Whether now following
 */
export async function toggleFollow(
  currentUserId: string,
  targetUserId: string
): Promise<{ following: boolean }> {
  if (currentUserId === targetUserId) {
    throw new Error("Cannot follow yourself");
  }

  const currentUser = await User.findById(currentUserId);
  const targetUser = await User.findById(targetUserId);

  if (!currentUser || !targetUser) {
    throw new Error("User not found");
  }

  const currentUserIdObj = new mongoose.Types.ObjectId(currentUserId);
  const targetUserIdObj = new mongoose.Types.ObjectId(targetUserId);

  const isFollowing = currentUser.following.some(
    (id) => id.toString() === targetUserId
  );

  if (isFollowing) {
    // Unfollow
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUserId
    );
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== currentUserId
    );
  } else {
    // Follow
    if (!currentUser.following.includes(targetUserIdObj)) {
      currentUser.following.push(targetUserIdObj);
    }
    if (!targetUser.followers.includes(currentUserIdObj)) {
      targetUser.followers.push(currentUserIdObj);
    }
  }

  await currentUser.save();
  await targetUser.save();

  return { following: !isFollowing };
}

