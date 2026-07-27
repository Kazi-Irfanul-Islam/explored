"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      router.push("/explore");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-6 py-12">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 sm:p-10 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-pink-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create an account</h1>
            <p className="text-sm text-slate-400">
              Start your journey today.
            </p>
          </header>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all outline-none"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all outline-none"
                placeholder="Choose a password"
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
              className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3.5 font-medium shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all disabled:opacity-50 mt-4"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-pink-400 hover:text-pink-300 font-medium transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
