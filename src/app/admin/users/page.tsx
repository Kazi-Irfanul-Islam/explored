import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.users.findMany({
    orderBy: { id: "asc" },
  });

  async function deleteUser(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    if (id) {
      await prisma.users.delete({ where: { id } });
      revalidatePath("/admin/users");
      revalidatePath("/admin");
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Manage Users</h1>
      
      <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/5 text-slate-200 border-b border-white/10 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">{user.id}</td>
                  <td className="px-6 py-4 font-medium text-white">{user.username}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${user.role === 'admin' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/10 text-slate-300 border border-white/10'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.role !== 'admin' && (
                      <form action={deleteUser}>
                        <input type="hidden" name="id" value={user.id} />
                        <button type="submit" className="text-red-400 hover:text-red-300 hover:underline">
                          Delete
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    No users found.
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
