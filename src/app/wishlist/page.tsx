import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const wishlistItems = await prisma.wishlist.findMany({
    where: { user_id: Number(session.user.id) },
    include: {
      log: {
        include: {
          owner: true,
          log_sections: true,
        },
      },
    },
    orderBy: { id: "desc" },
  });

  const logs = wishlistItems.map((item) => item.log);

  return (
    <main className="max-w-5xl mx-auto px-6 py-14">
      <header className="mb-12 border-b border-white/10 pb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
          Your <span className="text-gradient">Wishlist</span>
        </h1>
        <p className="text-slate-400 text-lg">
          Places you want to visit and journeys you want to remember.
        </p>
      </header>

      {logs.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center">
          <p className="text-slate-300 text-xl mb-4">Your wishlist is empty</p>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            You haven’t added any travel logs to your wishlist yet. Start exploring and save the journeys you’d like to revisit later.
          </p>
          <Link
            href="/explore"
            className="rounded-full bg-white/10 hover:bg-white/20 px-8 py-3 font-medium text-white transition-all border border-white/10"
          >
            Explore Logs
          </Link>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {logs.map((log) => {
            const totalCost = log.log_sections.reduce(
              (sum, section) => sum + Number(section.avg_cost),
              0
            );

            let avgRating = 0;
            if (log.log_sections.length > 0) {
              const sumRatings = log.log_sections.reduce(
                (sum, section) => sum + section.rating,
                0
              );
              avgRating = Math.round((sumRatings / log.log_sections.length) * 10) / 10;
            }

            return (
              <Link
                key={log.id}
                href={`/logs/${log.id}`}
                className="glass-card rounded-3xl p-8 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-2xl font-semibold tracking-tight text-white group-hover:text-pink-400 transition-colors line-clamp-2">
                      {log.title}
                    </h2>
                    <div className="bg-white/10 text-white text-sm font-medium px-3 py-1 rounded-full whitespace-nowrap">
                      ৳{totalCost.toFixed(0)}
                    </div>
                  </div>

                  <p className="text-sm text-slate-400">
                    by <span className="text-slate-200 font-medium">{log.owner.username}</span>
                  </p>

                  <p className="text-slate-300 leading-relaxed line-clamp-3">
                    {log.description}
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 capitalize">
                      {log.journey_type.replace("_", " ")}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      ⭐ {avgRating || 0}/5
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </main>
  );
}
