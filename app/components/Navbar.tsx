"use client";

import { useState, useEffect } from "react";

interface User {
  _id: string;
  username: string;
  name?: string;
  avatarUrl?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      // Not logged in
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <nav className="w-full py-4 bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
        <a href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Social App
        </a>

        <div className="flex gap-6 items-center">
          <a href="/community" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            Community
          </a>
          <a href="/process" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            Process
          </a>
          <a href="/rewards" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            Rewards
          </a>
          {user ? (
            <>
              <a 
                href={`/profile/${encodeURIComponent(user.username)}`} 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                {user.username}
              </a>
              <button 
                onClick={handleLogout} 
                className="text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Login
              </a>
              <a 
                href="/register" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
              >
                Register
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

