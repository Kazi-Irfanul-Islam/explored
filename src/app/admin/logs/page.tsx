import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  const logs = await prisma.travel_logs.findMany({
    include: { owner: true },
    orderBy: { created_at: "desc" },
  });

  async function deleteLog(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    if (id) {
      await prisma.travel_logs.delete({ where: { id } });
      revalidatePath("/admin/logs");
      revalidatePath("/admin");
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Manage Logs</h1>
      
      <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/5 text-slate-200 border-b border-white/10 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/logs/${log.id}`} className="font-medium text-white hover:text-primary transition-colors">
                      {log.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{log.owner.username}</td>
                  <td className="px-6 py-4">
                    {log.published === 1 ? (
                      <span className="text-emerald-400">Published</span>
                    ) : (
                      <span className="text-amber-400">Draft</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{new Date(log.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <form action={deleteLog}>
                      <input type="hidden" name="id" value={log.id} />
                      <button type="submit" className="text-red-400 hover:text-red-300 hover:underline">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
