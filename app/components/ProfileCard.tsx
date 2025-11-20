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
    <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl p-8 shadow-2xl border-2 border-blue-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-3xl opacity-30 -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-30 -ml-32 -mb-32"></div>
      
      <div className="relative z-10">
        <div className="flex items-start gap-6 mb-6">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-2xl ring-4 ring-purple-200"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-black shadow-2xl ring-4 ring-purple-200">
              {user.username[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-black text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {user.name || user.username}
              </h2>
              {user.isPremium && (
                <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white text-xs font-black rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                  ⭐ PREMIUM
                </span>
              )}
            </div>
            <p className="text-gray-600 text-lg mb-3 flex items-center gap-2">
              <span className="text-purple-500">@</span>
              <span className="font-semibold">{user.username}</span>
            </p>
            {user.bio && (
              <p className="text-gray-700 leading-relaxed mt-4 bg-white/60 p-4 rounded-xl backdrop-blur-sm">
                {user.bio}
              </p>
            )}
          </div>
          {!isOwnProfile && onFollow && (
            <button
              onClick={handleFollow}
              className={`px-8 py-3 rounded-xl font-black transition-all shadow-lg hover:shadow-2xl transform hover:scale-105 ${
                isFollowing
                  ? "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 border-2 border-gray-300"
                  : "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:from-blue-600 hover:via-purple-600 hover:to-pink-600"
              }`}
            >
              {isFollowing ? "✓ Following" : "+ Follow"}
            </button>
          )}
        </div>

        <div className="flex gap-8 mb-6 pb-6 border-b-2 border-purple-200">
          <div className="text-center bg-white/60 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <div className="text-3xl font-black text-blue-600 mb-1">{user.followers.length}</div>
            <div className="text-sm text-gray-600 font-semibold">Followers</div>
          </div>
          <div className="text-center bg-white/60 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <div className="text-3xl font-black text-purple-600 mb-1">{user.following.length}</div>
            <div className="text-sm text-gray-600 font-semibold">Following</div>
          </div>
          <div className="text-center bg-gradient-to-br from-yellow-100 to-orange-100 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border-2 border-yellow-300">
            <div className="text-3xl font-black text-yellow-600 mb-1 flex items-center justify-center gap-1">
              <span>⭐</span> {user.stars}
            </div>
            <div className="text-sm text-yellow-700 font-semibold">Stars</div>
          </div>
          <div className="text-center bg-white/60 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <div className="text-3xl font-black text-purple-600 mb-1">Yes or not</div>
            <div className="text-sm text-gray-600 font-semibold">Premium</div>
          </div>
        </div>

        {user.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {user.categories.map((cat, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-bold border-2 border-blue-200 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
              >
                #{cat}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}