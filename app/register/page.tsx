"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-3xl shadow-2xl p-8 border-2 border-purple-100 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full blur-3xl opacity-30 -mr-24 -mt-24"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-purple-200 to-blue-200 rounded-full blur-3xl opacity-30 -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Join Us!
              </h1>
              <p className="text-gray-600">Create your account and get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-pink-300 focus:border-pink-400 transition-all bg-white/80 backdrop-blur-sm font-semibold"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full p-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-pink-300 focus:border-pink-400 transition-all bg-white/80 backdrop-blur-sm font-semibold"
                  placeholder="johndoe"
                />
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-pink-300 focus:border-pink-400 transition-all bg-white/80 backdrop-blur-sm font-semibold"
                  placeholder="john@example.com"
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
                  className="w-full p-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-pink-300 focus:border-pink-400 transition-all bg-white/80 backdrop-blur-sm font-semibold"
                  placeholder="Create a strong password"
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
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white py-4 rounded-xl font-black text-lg shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-gray-600 bg-white/60 backdrop-blur-sm p-4 rounded-xl">
              Already have an account?{" "}
              <a href="/login" className="text-purple-600 font-bold hover:text-purple-800 hover:underline">
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}