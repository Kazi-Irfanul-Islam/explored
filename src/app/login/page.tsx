"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid username or password");
      } else {
        router.push("/explore");
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-6 py-12">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 sm:p-10 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome back</h1>
            <p className="text-sm text-slate-400">
              Log in to continue your journey.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/20 border border-destructive/50 text-destructive-foreground text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white py-3.5 font-medium shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all disabled:opacity-50 mt-4"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
