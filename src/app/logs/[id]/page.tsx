import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function LogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const resolvedParams = await params;
  const logId = Number(resolvedParams.id);

  if (isNaN(logId)) {
    return <div className="text-center p-20 text-white">Invalid log ID</div>;
  }

  const log = await prisma.travel_logs.findUnique({
    where: { id: logId },
    include: {
      owner: true,
      log_sections: {
        orderBy: { created_at: "asc" }
      },
      comments: {
        include: { owner: true },
        orderBy: { created_at: "desc" }
      },
    },
  });

  if (!log) {
    return <div className="p-20 text-center text-white">Log not found</div>;
  }

  // Calculate stats
  const totalCost = log.log_sections.reduce((sum, section) => sum + Number(section.avg_cost), 0);
  let avgRating = 0;
  if (log.log_sections.length > 0) {
    const sumRatings = log.log_sections.reduce((sum, section) => sum + section.rating, 0);
    avgRating = Math.round((sumRatings / log.log_sections.length) * 10) / 10;
  }

  // Check wishlist
  let onWishlist = false;
  if (session?.user) {
    const wish = await prisma.wishlist.findUnique({
      where: {
        user_id_log_id: {
          user_id: Number(session.user.id),
          log_id: log.id,
        },
      },
    });
    onWishlist = !!wish;
  }

  const isOwner = session?.user?.id === String(log.owner_id);
  const isLoggedIn = !!session?.user;
  const isUserRole = session?.user?.role === "user" || session?.user?.role === "admin"; // Admin can comment too

  // Server actions
  async function publishLog() {
    "use server";
    await prisma.travel_logs.update({
      where: { id: logId },
      data: { published: 1 },
    });
    revalidatePath(`/logs/${logId}`);
  }

  async function toggleWishlist() {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session?.user) return;

    if (onWishlist) {
      await prisma.wishlist.delete({
        where: {
          user_id_log_id: {
            user_id: Number(session.user.id),
            log_id: logId,
          }
        }
      });
    } else {
      await prisma.wishlist.create({
        data: {
          user_id: Number(session.user.id),
          log_id: logId,
        }
      });
    }
    revalidatePath(`/logs/${logId}`);
  }

  async function addComment(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session?.user) return;

    const commentText = formData.get("comment") as string;
    if (!commentText || commentText.trim() === "") return;

    await prisma.comments.create({
      data: {
        owner_id: Number(session.user.id),
        log_id: logId,
        comment: commentText,
      }
    });
    revalidatePath(`/logs/${logId}`);
  }

  async function deleteComment(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session?.user) return;
    
    const commentId = Number(formData.get("comment_id"));
    const comment = await prisma.comments.findUnique({ where: { id: commentId } });
    
    if (comment && comment.owner_id === Number(session.user.id)) {
      await prisma.comments.delete({ where: { id: commentId } });
      revalidatePath(`/logs/${logId}`);
    }
  }

  return (
    <main className="max-w-6xl mx-auto p-6 lg:p-12">
      {/* Hero Header */}
      <header className="mb-12 relative">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/20 blur-[120px] rounded-[100%] pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-6">
          <div className="flex items-center justify-center gap-3 text-sm text-slate-400">
            <span className="capitalize px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              {log.journey_type.replace("_", " ")}
            </span>
            <span>•</span>
            <span>{new Date(log.created_at).toLocaleDateString()}</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
            {log.title}
          </h1>

          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {log.description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium pt-4">
            <div className="glass px-6 py-3 rounded-full flex flex-col items-center">
              <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Created by</span>
              <span className="text-white">@{log.owner.username}</span>
            </div>
            <div className="glass px-6 py-3 rounded-full flex flex-col items-center">
              <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Avg Cost</span>
              <span className="text-white text-lg">৳{totalCost.toFixed(0)}</span>
            </div>
            <div className="glass px-6 py-3 rounded-full flex flex-col items-center">
              <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Rating</span>
              <span className="text-white text-lg">⭐ {avgRating}/5</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-16 relative z-10">
        
        {/* Main Content - Destinations */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-2xl font-semibold text-white">Destinations</h2>
            
            {!log.published && isOwner && (
              <Link href={`/logs/${log.id}/new`}>
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-sm text-white font-medium transition-all">
                  + Add Destination
                </button>
              </Link>
            )}
          </div>

          {log.log_sections.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center text-slate-400">
              No destinations added to this journey yet.
            </div>
          ) : (
            <div className="relative border-l border-white/10 ml-4 space-y-8 pb-4">
              {log.log_sections.map((section, idx) => (
                <div key={section.id} className="relative pl-8 group">
                  {/* Timeline dot */}
                  <div className="absolute -left-2 top-2 w-4 h-4 rounded-full bg-primary shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
                  
                  <div className="glass-card rounded-3xl p-6 sm:p-8 hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{section.place_name}</h3>
                        <p className="text-sm text-slate-400">{section.place_type}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">৳{Number(section.avg_cost)}</div>
                        <div className="text-sm text-slate-400">per person</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-white/10">
                      <div className="text-sm text-slate-300 flex items-center gap-2">
                        ⭐ <span className="font-medium text-white">{section.rating}/5</span> rating
                      </div>
                      
                      {section.map_link && section.map_link !== "Not Mentioned" && (
                        <a 
                          href={section.map_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1"
                        >
                          View Map &rarr;
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar - Actions & Comments */}
        <div className="space-y-6">
          
          {/* Actions */}
          {isLoggedIn && (
            <div className="glass-card rounded-3xl p-6">
              {!log.published && isOwner ? (
                <form action={publishLog}>
                  <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all">
                    Publish Journey
                  </button>
                  <p className="text-xs text-slate-400 mt-3 text-center">Make this log visible to everyone.</p>
                </form>
              ) : (
                <form action={toggleWishlist}>
                  <button className={`w-full py-4 rounded-xl font-medium transition-all ${
                    onWishlist 
                      ? "bg-white/10 text-white border border-white/20 hover:bg-white/20" 
                      : "bg-white text-black hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  }`}>
                    {onWishlist ? "Remove from Wishlist" : "❤️ Add to Wishlist"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Comments */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Discussion</h3>

            {isLoggedIn && (
              <form action={addComment} className="mb-8">
                <textarea
                  name="comment"
                  rows={3}
                  required
                  placeholder="Share your thoughts..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none mb-3"
                ></textarea>
                <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-medium transition-all">
                  Post Comment
                </button>
              </form>
            )}

            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {log.comments.length === 0 ? (
                <p className="text-center text-slate-500 text-sm py-4">No comments yet. Be the first!</p>
              ) : (
                log.comments.map((comment) => (
                  <div key={comment.id} className="group relative">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="font-medium text-slate-200 text-sm">{comment.owner.username}</div>
                      <div className="text-xs text-slate-500">{new Date(comment.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none p-4 text-sm text-slate-300">
                      {comment.comment}
                    </div>
                    
                    {String(comment.owner_id) === session?.user?.id && (
                      <form action={deleteComment} className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <input type="hidden" name="comment_id" value={comment.id} />
                        <button type="submit" className="text-xs text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-2 py-1 rounded">
                          Delete
                        </button>
                      </form>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
