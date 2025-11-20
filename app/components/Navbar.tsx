"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface User {
  _id: string;
  username: string;
  name?: string;
  avatarUrl?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.error("Failed to fetch user:", err);
    } finally {
      setLoading(false);
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
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Social App
        </Link>

        <div className="flex gap-6 items-center">
          <Link href="/community" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            Community
          </Link>
          <Link href="/process" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            Process
          </Link>
          <Link href="/rewards" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            Rewards
          </Link>
          
          {loading ? (
            <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
          ) : user ? (
            <>
              <Link 
                href="/profile"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Profile
              </Link>
              <button 
                onClick={handleLogout} 
                className="text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}