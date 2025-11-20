"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ emailOrUsername, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/community");
      router.refresh();
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl shadow-2xl p-8 border-2 border-blue-100 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-3xl opacity-30 -mr-24 -mt-24"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-30 -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🔐</div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Welcome Back!
              </h1>
              <p className="text-gray-600">Login to continue your journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Email or Username
                </label>
                <input
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                  className="w-full p-4 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all bg-white/80 backdrop-blur-sm font-semibold"
                  placeholder="Enter your email or username"
                />
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-4 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all bg-white/80 backdrop-blur-sm font-semibold"
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <div className="bg-red-100 border-2 border-red-300 text-red-700 p-4 rounded-xl text-sm font-semibold flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white py-4 rounded-xl font-black text-lg shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-gray-600 bg-white/60 backdrop-blur-sm p-4 rounded-xl">
              Don't have an account?{" "}
              <a href="/register" className="text-purple-600 font-bold hover:text-purple-800 hover:underline">
                Register here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}