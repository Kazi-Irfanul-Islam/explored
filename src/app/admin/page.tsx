import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const usersCount = await prisma.users.count();
  const logsCount = await prisma.travel_logs.count();
  const messagesCount = await prisma.contact_messages.count();

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Link href="/admin/users" className="glass-card rounded-2xl p-6 hover:-translate-y-1 transition-transform group">
          <div className="text-slate-400 font-medium mb-2 uppercase tracking-wider text-sm">Total Users</div>
          <div className="text-4xl font-bold text-white group-hover:text-primary transition-colors">{usersCount}</div>
        </Link>
        
        <Link href="/admin/logs" className="glass-card rounded-2xl p-6 hover:-translate-y-1 transition-transform group">
          <div className="text-slate-400 font-medium mb-2 uppercase tracking-wider text-sm">Total Logs</div>
          <div className="text-4xl font-bold text-white group-hover:text-primary transition-colors">{logsCount}</div>
        </Link>

        <Link href="/admin/messages" className="glass-card rounded-2xl p-6 hover:-translate-y-1 transition-transform group">
          <div className="text-slate-400 font-medium mb-2 uppercase tracking-wider text-sm">Messages</div>
          <div className="text-4xl font-bold text-white group-hover:text-primary transition-colors">{messagesCount}</div>
        </Link>
      </div>
    </div>
  );
}
