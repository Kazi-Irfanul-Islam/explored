import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sort?: string }>;
}) {
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";
  const sort = resolvedParams?.sort || "newest";

  const logs = await prisma.travel_logs.findMany({
    where: {
      published: 1,
      OR: search
        ? [
          { title: { contains: search } },
          { description: { contains: search } },
          { journey_type: { contains: search } },
        ]
        : undefined,
    },
    orderBy: {
      created_at: sort === "oldest" ? "asc" : "desc",
    },
    include: {
      owner: {
        select: { username: true },
      },
      log_sections: {
        select: { avg_cost: true, rating: true },
      },
    },
  });

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Explore <span className="text-gradient">Journeys</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Discover incredible travel logs, hidden gems, and adventures shared by our community.
        </p>
      </header>

      <form method="GET" action="/explore" className="mb-14">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center gap-4 glass p-2 rounded-full">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by title, description, or type..."
            className="flex-1 min-w-[200px] bg-transparent px-6 py-3 text-white placeholder-slate-400 focus:outline-none"
          />
          <div className="h-8 w-px bg-white/20 hidden md:block"></div>
          <select
            name="sort"
            defaultValue={sort}
            className="w-40 bg-transparent px-4 py-3 text-slate-200 focus:outline-none appearance-none"
          >
            <option value="newest" className="bg-slate-900">Newest</option>
            <option value="oldest" className="bg-slate-900">Oldest</option>
          </select>
          <button
            type="submit"
            className="rounded-full bg-primary hover:bg-primary/90 px-8 py-3 font-medium text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all"
          >
            Search
          </button>
        </div>
      </form>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {logs.length === 0 && (
          <div className="col-span-full text-center py-20">
            <p className="text-slate-400 text-lg">No journeys found. Try a different search.</p>
          </div>
        )}
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
                  <h2 className="text-2xl font-semibold tracking-tight text-white group-hover:text-primary transition-colors line-clamp-2">
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
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary-foreground border border-primary/30 capitalize">
                    {log.journey_type.replace("_", " ")}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    ⭐ {avgRating || 0}/5
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(log.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
