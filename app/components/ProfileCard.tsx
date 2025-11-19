"use client";

import { useState } from "react";

interface User {
  _id: string;
  username: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  stars: number;
  followers: string[];
  following: string[];
  categories: string[];
  isPremium: boolean;
}

interface ProfileCardProps {
  user: User;
  currentUserId?: string;
  isFollowing?: boolean;
  onFollow?: (userId: string) => void;
}

export default function ProfileCard({
  user,
  currentUserId,
  isFollowing: initialFollowing,
  onFollow,
}: ProfileCardProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing || false);
  const isOwnProfile = currentUserId === user._id;

  const handleFollow = async () => {
    if (!onFollow) return;
    try {
      await onFollow(user._id);
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-md">
      <div className="flex items-start gap-6 mb-6">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-sm"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {user.username[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{user.name || user.username}</h2>
            {user.isPremium && (
              <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-semibold rounded-full shadow-sm">
                ⭐ Premium
              </span>
            )}
          </div>
          <p className="text-gray-500 text-lg mb-2">@{user.username}</p>
          {user.bio && (
            <p className="text-gray-700 leading-relaxed mt-3">{user.bio}</p>
          )}
        </div>
        {!isOwnProfile && onFollow && (
          <button
            onClick={handleFollow}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all shadow-sm ${
              isFollowing
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                : "bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg"
            }`}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>

      <div className="flex gap-8 mb-6 pb-6 border-b border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{user.followers.length}</div>
          <div className="text-sm text-gray-500">Followers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{user.following.length}</div>
          <div className="text-sm text-gray-500">Following</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-500">⭐ {user.stars}</div>
          <div className="text-sm text-gray-500">Stars</div>
        </div>
      </div>

      {user.categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {user.categories.map((cat, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100"
            >
              {cat}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

