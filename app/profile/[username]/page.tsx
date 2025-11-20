"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProfileCard from "@/app/components/ProfileCard";
import PostCard from "@/app/components/PostCard";

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

interface Post {
  _id: string;
  author: {
    _id: string;
    username: string;
    avatarUrl?: string;
    name?: string;
  };
  text?: string;
  imageUrl?: string;
  likes: string[];
  comments: any[];
  createdAt: string;
}

export default function ProfilePage() {
  const params = useParams();
  const username = decodeURIComponent(params.username as string);
  
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  useEffect(() => {
    if (currentUser && user) {
      setIsFollowing(user.followers.some((id: string) => id.toString() === currentUser._id));
    }
  }, [currentUser, user]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      setCurrentUser(data.user);
    } catch (err) {
      console.error("Failed to fetch current user:", err);
    }
  };

  const fetchProfile = async () => {
    if (!username) return;
    
    setLoading(true);
    try {
      // Fetch user profile
      const encodedUsername = encodeURIComponent(username);
      const userRes = await fetch(`/api/user/${encodedUsername}`, { credentials: "include" });
      const userData = await userRes.json();
      
      if (userRes.ok && userData.user) {
        // If user was found by email, redirect to username-based URL
        // Only redirect if the username is different from the current parameter
        if (userData.shouldRedirect && userData.correctUsername && 
            userData.correctUsername.toLowerCase() !== username.toLowerCase()) {
          window.location.href = `/profile/${encodeURIComponent(userData.correctUsername)}`;
          return;
        }
        
        setUser(userData.user);
      } else {
        console.warn("User not found:", username);
        setUser(null);
      }

      // Fetch all posts and filter by this user
      const postsRes = await fetch("/api/posts/list", { credentials: "include" });
      const postsData = await postsRes.json();
      
      if (postsRes.ok && userData.user) {
        const userPosts = postsData.posts.filter((p: Post) => 
          p.author.username.toLowerCase() === userData.user.username.toLowerCase()
        );
        setPosts(userPosts);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      const res = await fetch("/api/user/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetId: userId }),
      });

      if (!res.ok) throw new Error("Follow failed");
      
      const data = await res.json();
      setIsFollowing(data.following);
      
      // Refresh user data to update follower count
      fetchProfile();
    } catch (err) {
      console.error("Follow error:", err);
      throw err;
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch("/api/posts/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ postId }),
      });
      if (!res.ok) throw new Error("Like failed");
      fetchProfile();
    } catch (err) {
      console.error("Like error:", err);
      throw err;
    }
  };

  const handleComment = async (postId: string, text: string, donatedStars: number) => {
    try {
      const res = await fetch("/api/posts/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ postId, text, donatedStars }),
      });
      if (!res.ok) throw new Error("Comment failed");
      fetchProfile();
    } catch (err) {
      console.error("Comment error:", err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-8 shadow-lg">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-red-600 text-2xl font-bold mb-2">User not found</p>
          <p className="text-red-500 text-lg mb-6">The user "@{username}" does not exist.</p>
          <a 
            href="/community" 
            className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Back to Community
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ProfileCard
        user={user}
        currentUserId={currentUser?._id}
        isFollowing={isFollowing}
        onFollow={handleFollow}
      />

      <div className="mt-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 flex items-center gap-3">
          <span className="text-4xl">📝</span>
          Posts
        </h2>
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-200 shadow-inner">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-xl font-medium">No posts yet.</p>
            <p className="text-gray-500 mt-2">Check back later for updates!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={currentUser?._id}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}