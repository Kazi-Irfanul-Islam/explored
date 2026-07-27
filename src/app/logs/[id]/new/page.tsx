import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function NewLogSectionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const resolvedParams = await params;
  const logId = Number(resolvedParams.id);

  if (!session?.user) {
    redirect("/login");
  }

  // verify ownership
  const log = await prisma.travel_logs.findUnique({
    where: { id: logId }
  });

  if (!log || String(log.owner_id) !== session.user.id || log.published === 1) {
    redirect(`/logs/${logId}`);
  }

  async function addSection(formData: FormData) {
    "use server";
    
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    const place_name = formData.get("place_name") as string;
    const place_type = formData.get("place_type") as string;
    const map_link = formData.get("map_link") as string;
    const avg_cost = Number(formData.get("avg_cost"));
    const rating = Number(formData.get("rating"));

    if (!place_name || !place_type || isNaN(avg_cost) || isNaN(rating)) {
      throw new Error("Missing required fields");
    }

    await prisma.log_sections.create({
      data: {
        owner_id: Number(session.user.id),
        log_id: logId,
        place_name,
        place_type,
        map_link: map_link || "Not Mentioned",
        avg_cost,
        rating,
      }
    });

    redirect(`/logs/${logId}`);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          Add a <span className="text-gradient">Destination</span>
        </h1>
        <p className="text-slate-400">
          Add a place you visited during this journey.
        </p>
      </header>

      <div className="glass-card rounded-3xl p-8 sm:p-10 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 blur-[100px] rounded-full pointer-events-none" />

        <form action={addSection} className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Place name</label>
            <input
              name="place_name"
              type="text"
              required
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all outline-none"
              placeholder="e.g. Marina Bay Sands"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Type of place</label>
            <div className="relative">
              <select
                name="place_type"
                required
                defaultValue=""
                className="w-full appearance-none rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all outline-none"
              >
                <option value="" disabled className="bg-slate-900">Select type</option>
                <option className="bg-slate-900">Restaurant</option>
                <option className="bg-slate-900">Hotel</option>
                <option className="bg-slate-900">Resort</option>
                <option className="bg-slate-900">Cafeteria</option>
                <option className="bg-slate-900">Cafe</option>
                <option className="bg-slate-900">Tourist Spot</option>
                <option className="bg-slate-900">Museum</option>
                <option className="bg-slate-900">Park</option>
                <option className="bg-slate-900">Shopping Mall</option>
                <option className="bg-slate-900">Landscape</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">Google Maps link</label>
              <span className="text-xs text-slate-500">Optional</span>
            </div>
            <input
              name="map_link"
              type="url"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all outline-none"
              placeholder="https://maps.google.com/..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Avg cost (৳)</label>
              <input
                name="avg_cost"
                type="number"
                step="1"
                min="0"
                required
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all outline-none"
                placeholder="2500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Rating (1-5)</label>
              <input
                name="rating"
                type="number"
                min="1"
                max="5"
                required
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all outline-none"
                placeholder="5"
              />
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center gap-4">
            <button
              type="submit"
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3.5 font-medium shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all"
            >
              Add Section
            </button>
            <Link
              href={`/logs/${logId}`}
              className="w-full sm:w-auto rounded-xl bg-white/5 border border-white/10 px-8 py-3.5 text-center text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
