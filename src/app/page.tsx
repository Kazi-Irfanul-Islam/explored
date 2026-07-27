import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6 text-center">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[150px] rounded-[100%] pointer-events-none" />
      
      <div className="relative z-10 space-y-8 max-w-3xl">
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-slate-300">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
          Explored v2.0 is here
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
          Document your <span className="text-gradient">Journeys</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The most beautiful way to record your travels, calculate expenses, and share your adventures with the world.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/explore"
            className="w-full sm:w-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 font-medium shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all"
          >
            Start Exploring
          </Link>
          
          {!session?.user && (
            <Link
              href="/register"
              className="w-full sm:w-auto rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white px-8 py-4 font-medium transition-all"
            >
              Create an Account
            </Link>
          )}
        </div>
      </div>

      <footer className="absolute bottom-6 text-sm text-slate-500 flex gap-6">
        <Link href="/about" className="hover:text-slate-300 transition-colors">About Us</Link>
        <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
        <Link href="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
      </footer>
    </main>
  );
}
