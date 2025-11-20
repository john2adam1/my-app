"use client";

import { useState, useEffect } from "react";
import PostCard from "@/app/components/PostCard";
import CreatePost from "@/app/components/CreatePost";

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

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<"following" | "foryou">("foryou");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (activeTab === "following") {
      fetchFollowingPosts();
    } else {
      fetchForYouPosts();
    }
  }, [activeTab]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      setCurrentUser(data.user);
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  const fetchFollowingPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/posts/following", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Failed to fetch following posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchForYouPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/posts/list", { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
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
      // Refresh posts
      if (activeTab === "following") {
        fetchFollowingPosts();
      } else {
        fetchForYouPosts();
      }
    } catch (err) {
      console.error("Comment error:", err);
      throw err;
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center mt-8">
        <p>Please <a href="/login" className="text-blue-500">login</a> to view community posts.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Community (Jamiyat)</h1>
      
      <CreatePost onPostCreated={() => {
        if (activeTab === "following") {
          fetchFollowingPosts();
        } else {
          fetchForYouPosts();
        }
      }} />
      
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("following")}
          className={`pb-3 px-6 font-semibold transition-colors ${
            activeTab === "following"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Following
        </button>
        <button
          onClick={() => setActiveTab("foryou")}
          className={`pb-3 px-6 font-semibold transition-colors ${
            activeTab === "foryou"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          For You
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-500">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-gray-500 text-lg">
            No posts found. {activeTab === "following" && "Follow users to see their posts!"}
          </p>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={currentUser._id}
              onLike={handleLike}
              onComment={handleComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}

