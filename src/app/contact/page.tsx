import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ContactPage() {
  async function submitMessage(formData: FormData) {
    "use server";
    
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    if (!name || !email || !subject || !message) {
      throw new Error("Missing fields");
    }

    await prisma.contact_messages.create({
      data: { name, email, subject, message },
    });

    redirect("/contact?success=true");
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
          Get in <span className="text-gradient">Touch</span>
        </h1>
        <p className="text-slate-400">Have a question or feedback? We'd love to hear from you.</p>
      </header>

      <div className="glass-card rounded-3xl p-8 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        
        <form action={submitMessage} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Your Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
            <input
              id="subject"
              name="subject"
              type="text"
              required
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
              placeholder="How can we help?"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">Message</label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none resize-none"
              placeholder="Write your message here..."
            ></textarea>
          </div>

          <div className="pt-4 flex items-center justify-center">
            <button
              type="submit"
              className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white px-8 py-3.5 font-medium shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
