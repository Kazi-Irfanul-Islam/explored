import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function CreateLogPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  async function createLog(formData: FormData) {
    "use server";
    
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const journey_type = formData.get("journey_type") as string;

    if (!title || !description || !journey_type) throw new Error("Missing fields");

    await prisma.travel_logs.create({
      data: {
        owner_id: Number(session.user.id),
        title,
        description,
        journey_type,
        published: 0,
      }
    });

    redirect(`/logs`);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
          Create a <span className="text-gradient">Travel Log</span>
        </h1>
        <p className="text-slate-400">Keep it short. You can add more details later.</p>
      </header>

      <div className="glass-card rounded-3xl p-8 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        
        <form action={createLog} className="space-y-6 relative z-10">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={150}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
              placeholder="e.g. Weekend in Cox’s Bazar"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">Short description</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none resize-none"
              placeholder="A quick summary of what this log is about…"
            ></textarea>
          </div>

          <div>
            <label htmlFor="journey_type" className="block text-sm font-medium text-slate-300 mb-2">Journey type</label>
            <div className="relative">
              <select
                id="journey_type"
                name="journey_type"
                required
                defaultValue=""
                className="w-full appearance-none rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
              >
                <option value="" disabled className="bg-slate-900">Select one</option>
                <option value="solo" className="bg-slate-900">Solo</option>
                <option value="small_group" className="bg-slate-900">Small group</option>
                <option value="family_travel" className="bg-slate-900">Family travel</option>
                <option value="picnic" className="bg-slate-900">Picnic</option>
                <option value="business" className="bg-slate-900">Business</option>
                <option value="leisure" className="bg-slate-900">Leisure</option>
              </select>
            </div>
            <p className="mt-2 text-xs text-slate-500">Helps organize logs later.</p>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center gap-4">
            <button
              type="submit"
              className="w-full sm:w-auto rounded-xl bg-primary hover:bg-primary/90 text-white px-8 py-3.5 font-medium shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all"
            >
              Get started
            </button>
            <Link
              href="/logs"
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
