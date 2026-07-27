import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/explore");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Admin Sidebar */}
      <aside className="w-64 glass border-r border-white/10 flex-shrink-0 hidden md:block">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Admin Panel</h2>
          <nav className="space-y-2">
            <Link
              href="/admin"
              className="block px-4 py-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-all font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className="block px-4 py-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-all font-medium"
            >
              Manage Users
            </Link>
            <Link
              href="/admin/logs"
              className="block px-4 py-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-all font-medium"
            >
              Manage Logs
            </Link>
            <Link
              href="/admin/messages"
              className="block px-4 py-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-all font-medium"
            >
              Contact Messages
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        {/* Mobile Nav */}
        <div className="md:hidden glass border-b border-white/10 p-4 flex gap-4 overflow-x-auto whitespace-nowrap">
          <Link href="/admin" className="text-sm font-medium text-slate-300 hover:text-white">Dashboard</Link>
          <Link href="/admin/users" className="text-sm font-medium text-slate-300 hover:text-white">Users</Link>
          <Link href="/admin/logs" className="text-sm font-medium text-slate-300 hover:text-white">Logs</Link>
          <Link href="/admin/messages" className="text-sm font-medium text-slate-300 hover:text-white">Messages</Link>
        </div>
        <div className="p-6 lg:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}
