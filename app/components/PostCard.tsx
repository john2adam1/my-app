"use client";

import { useState } from "react";

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
  comments: Array<{
    user: { username: string; avatarUrl?: string };
    text: string;
    donatedStars: number;
    createdAt: string;
  }>;
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLike?: (postId: string) => void;
  onComment?: (postId: string, text: string, donatedStars: number) => void;
}

export default function PostCard({ post, currentUserId, onLike, onComment }: PostCardProps) {
  const [liked, setLiked] = useState(post.likes.includes(currentUserId || ""));
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [donatedStars, setDonatedStars] = useState(0);

  const handleLike = async () => {
    if (!onLike) return;
    try {
      await onLike(post._id);
      setLiked(!liked);
      setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleComment = async () => {
    if (!onComment || !commentText.trim()) return;
    try {
      await onComment(post._id, commentText, donatedStars);
      setCommentText("");
      setDonatedStars(0);
      setShowCommentForm(false);
    } catch (error) {
      console.error("Comment error:", error);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-5 mb-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center mb-4">
        <a href={`/profile/${encodeURIComponent(post.author.username)}`} className="flex items-center">
          {post.author.avatarUrl ? (
            <img
              src={post.author.avatarUrl}
              alt={post.author.username}
              className="w-12 h-12 rounded-full mr-3 object-cover border-2 border-gray-100"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mr-3 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
              {post.author.username[0].toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-semibold text-gray-900 hover:text-blue-600">
              {post.author.name || post.author.username}
            </div>
            <div className="text-sm text-gray-500">@{post.author.username}</div>
          </div>
        </a>
      </div>

      {post.text && (
        <p className="mb-4 text-gray-800 whitespace-pre-wrap leading-relaxed">
          {post.text}
        </p>
      )}
      {post.imageUrl && (
        <div className="mb-4 rounded-lg overflow-hidden border border-gray-100">
          <img 
            src={post.imageUrl} 
            alt="Post" 
            className="w-full h-auto max-h-96 object-cover"
          />
        </div>
      )}

      <div className="flex items-center gap-6 mb-3 pt-3 border-t border-gray-100">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
            liked 
              ? "text-red-500 bg-red-50 hover:bg-red-100" 
              : "text-gray-600 hover:text-red-500 hover:bg-gray-50"
          }`}
        >
          <span className="text-xl">{liked ? "❤️" : "🤍"}</span>
          <span className="font-medium">{likesCount}</span>
        </button>
        <button
          onClick={() => setShowCommentForm(!showCommentForm)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-600 hover:text-blue-500 hover:bg-gray-50 transition-colors"
        >
          <span className="text-xl">💬</span>
          <span className="font-medium">{post.comments.length}</span>
        </button>
      </div>

      {showCommentForm && (
        <div className="border-t border-gray-100 pt-4 mt-4 bg-gray-50 rounded-lg p-4">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
          />
          <div className="flex items-center gap-3 mb-3">
            <label className="text-sm font-medium text-gray-700">Donate stars:</label>
            <input
              type="number"
              value={donatedStars}
              onChange={(e) => setDonatedStars(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
              className="w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {donatedStars > 0 && (
              <span className="text-yellow-500 font-medium">⭐ {donatedStars}</span>
            )}
          </div>
          <button
            onClick={handleComment}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            Comment
          </button>
        </div>
      )}

      {post.comments.length > 0 && (
        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="space-y-3">
            {post.comments.map((comment, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">@{comment.user.username}</span>
                  {comment.donatedStars > 0 && (
                    <span className="text-yellow-500 font-medium text-sm">
                      ⭐ {comment.donatedStars} stars
                    </span>
                  )}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

