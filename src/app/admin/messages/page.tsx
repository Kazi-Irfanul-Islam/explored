import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await prisma.contact_messages.findMany({
    orderBy: { created_at: "desc" },
  });

  async function deleteMessage(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    if (id) {
      await prisma.contact_messages.delete({ where: { id } });
      revalidatePath("/admin/messages");
      revalidatePath("/admin");
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Contact Messages</h1>
      
      {messages.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-slate-400">
          No contact messages yet.
        </div>
      ) : (
        <div className="space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className="glass-card rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{msg.subject}</h3>
                  <p className="text-sm text-slate-400">
                    From: <span className="text-slate-200">{msg.name}</span> ({msg.email})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block mb-2">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                  <form action={deleteMessage}>
                    <input type="hidden" name="id" value={msg.id} />
                    <button type="submit" className="text-xs text-red-400 hover:text-red-300 hover:underline">
                      Delete message
                    </button>
                  </form>
                </div>
              </div>
              <p className="text-slate-300 whitespace-pre-wrap">{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
