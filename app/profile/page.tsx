"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfileCard from "@/app/components/ProfileCard";
import PostCard from "@/app/components/PostCard";
import CreatePost from "@/app/components/CreatePost";

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

export default function MyProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch current user's full profile
      const userRes = await fetch("/api/user/me", { credentials: "include" });
      const userData = await userRes.json();
      
      if (!userRes.ok) {
        if (userRes.status === 401) {
          router.push("/login");
          return;
        }
        setError(userData.error || "Failed to load profile");
        setUser(null);
        setPosts([]);
        setLoading(false);
        return;
      }
      
      if (userData.user) {
        setUser(userData.user);
        
        // Fetch all posts and filter by this user's username
        const postsRes = await fetch("/api/posts/list", { credentials: "include" });
        const postsData = await postsRes.json();
        
        if (postsRes.ok) {
          // Filter posts by user ID (more reliable than username)
          const userPosts = postsData.posts.filter((p: Post) => 
            p.author._id === userData.user._id
          );
          setPosts(userPosts);
        }
      } else {
        setError("User not found");
        setUser(null);
        setPosts([]);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load profile");
      setUser(null);
      setPosts([]);
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
      fetchProfile();
    } catch (err) {
      console.error("Like error:", err);
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
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600 text-lg font-semibold">
            {error || "Failed to load profile"}
          </p>
          <a 
            href="/community" 
            className="mt-4 inline-block text-blue-500 hover:text-blue-600"
          >
            ← Back to Community
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <ProfileCard
        user={user}
        currentUserId={user._id}
        isFollowing={false}
      />

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">My Posts</h2>
        
        <CreatePost onPostCreated={fetchProfile} />
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-500 text-lg">No posts yet.</p>
          </div>
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={user._id}
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

