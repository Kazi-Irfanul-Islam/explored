import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  async function updatePassword(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    const currentPassword = formData.get("current_password") as string;
    const newPassword = formData.get("new_password") as string;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      redirect("/settings?error=Invalid inputs");
    }

    const user = await prisma.users.findUnique({ where: { id: Number(session.user.id) } });
    if (!user) throw new Error("User not found");

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      redirect("/settings?error=Incorrect current password");
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    redirect("/settings?success=Password updated successfully");
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Profile Settings</h1>
        <p className="text-slate-400">Manage your account preferences and security.</p>
      </header>

      <div className="glass-card rounded-3xl p-8">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
          <div className="h-16 w-16 rounded-full bg-primary/20 text-primary flex items-center justify-center text-2xl font-bold border border-primary/30">
            {session.user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{session.user.name}</h2>
            <p className="text-slate-400 capitalize text-sm">{session.user.role} Account</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-white mb-6">Change Password</h3>
        
        <form action={updatePassword} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
            <input
              name="current_password"
              type="password"
              required
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
            <input
              name="new_password"
              type="password"
              required
              minLength={6}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-primary hover:bg-primary/90 text-white px-8 py-3 font-medium transition-all"
          >
            Update Password
          </button>
        </form>
      </div>
    </main>
  );
}
