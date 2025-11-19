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
  // Decode URL-encoded username (handles cases where email might be passed)
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
    // Fetch profile when username changes
    if (username) {
      fetchProfile();
    }
  }, [username]);

  useEffect(() => {
    // Update following status when currentUser becomes available
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
      // Encode username for URL (handle special characters)
      const encodedUsername = encodeURIComponent(username);
      const userRes = await fetch(`/api/user/${encodedUsername}`, { credentials: "include" });
      const userData = await userRes.json();
      
      if (userRes.ok && userData.user) {
        setUser(userData.user);
        
        // Check if current user is following this user (update when currentUser is available)
        if (currentUser) {
          setIsFollowing(userData.user.followers.some((id: string) => id.toString() === currentUser._id));
        }
      } else {
        // User not found
        setUser(null);
        console.warn("User not found:", username);
      }

      // Fetch posts by this user
      const postsRes = await fetch("/api/posts/list", { credentials: "include" });
      const postsData = await postsRes.json();
      
      if (postsRes.ok) {
        // Filter posts by username (case-insensitive match)
        const decodedUsername = decodeURIComponent(username).toLowerCase();
        setPosts(postsData.posts.filter((p: Post) => 
          p.author.username.toLowerCase() === decodedUsername
        ));
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
      fetchProfile(); // Refresh to get updated likes
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
      fetchProfile(); // Refresh posts
    } catch (err) {
      console.error("Comment error:", err);
      throw err;
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

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600 text-lg font-semibold">User not found</p>
          <p className="text-red-500 mt-2">The user "{username}" does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <ProfileCard
        user={user}
        currentUserId={currentUser?._id}
        isFollowing={isFollowing}
        onFollow={handleFollow}
      />

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Posts</h2>
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

