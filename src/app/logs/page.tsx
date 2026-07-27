import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MyLogsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const logs = await prisma.travel_logs.findMany({
    where: { owner_id: Number(session.user.id) },
    orderBy: { created_at: "desc" },
  });

  const totalLogs = logs.length;

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
            Your <span className="text-gradient">Travel Logs</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Write while you travel. Keep everything in one place.
          </p>
        </div>

        <div className="flex gap-4">
          <Link
            href="/create-log"
            className="rounded-full bg-primary hover:bg-primary/90 px-6 py-3 text-sm font-medium text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all"
          >
            + Create new log
          </Link>
        </div>
      </section>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold text-white">All Logs ({totalLogs})</h2>
      </div>

      {logs.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <p className="text-slate-400 text-lg mb-6">You haven't created any logs yet.</p>
          <Link
            href="/create-log"
            className="text-primary hover:text-primary/80 font-medium"
          >
            Start your first journey &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {logs.map((log) => (
            <Link
              key={log.id}
              href={`/logs/${log.id}`}
              className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                    {log.title}
                  </h3>
                  {log.published === 1 ? (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium">
                      Published
                    </span>
                  ) : (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium">
                      Draft
                    </span>
                  )}
                </div>
                <p className="text-slate-400 line-clamp-2 max-w-2xl">
                  {log.description}
                </p>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-500 whitespace-nowrap">
                <span className="capitalize">{log.journey_type.replace("_", " ")}</span>
                <span>•</span>
                <span>{new Date(log.created_at).toLocaleDateString()}</span>
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                  &rarr;
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
