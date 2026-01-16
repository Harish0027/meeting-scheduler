"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create or get user - simplified auth without password
      const username = email.split("@")[0];
      const response = await fetch("http://localhost:3001/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const result = await response.json();
      const user = result.data || result;

      // Set auth token in cookie
      document.cookie = `authToken=${user.id}; path=/; max-age=${
        30 * 24 * 60 * 60
      }`;
      
      // Store user data in cookie for frontend use
      document.cookie = `user=${encodeURIComponent(JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
      }))}; path=/; max-age=${30 * 24 * 60 * 60}`;

      toast.success("Logged in successfully!");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">
            Cal
          </div>
          <span className="text-sm font-semibold text-neutral-900">
            Cal.com
          </span>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-neutral-900">Sign in</h1>
            <p className="text-sm text-neutral-600">
              Enter your email to sign in to your account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-xs text-blue-900">
              <strong>Demo:</strong> Enter any email to create or sign in
            </p>
          </div>

          {/* Back to home */}
          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
