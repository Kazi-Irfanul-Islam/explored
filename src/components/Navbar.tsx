import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tighter flex items-center gap-2">
          <span className="text-gradient">Explored</span>
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link href="/explore" className="hover:text-white transition-colors">
            Explore
          </Link>
          <Link href="/contact" className="hover:text-white transition-colors">
            Contact
          </Link>
          
          {session?.user ? (
            <>
              <Link href="/logs" className="hover:text-white transition-colors">
                My Logs
              </Link>
              <Link href="/wishlist" className="hover:text-white transition-colors">
                Wishlist
              </Link>
              {session.user.role === "admin" && (
                <Link href="/admin" className="text-primary hover:text-primary/80 transition-colors font-semibold">
                  Admin
                </Link>
              )}
              <Link href="/settings" className="hover:text-white transition-colors">
                Settings
              </Link>
              <Link href="/api/auth/signout" className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
                Sign out
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-white transition-colors">
                Log in
              </Link>
              <Link href="/register" className="px-4 py-2 rounded-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
