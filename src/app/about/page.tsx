export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 text-center">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-8">
        About <span className="text-gradient">Explored</span>
      </h1>
      <div className="glass-card rounded-3xl p-10 text-left space-y-6 text-slate-300 leading-relaxed text-lg">
        <p>
          Explored was built with a simple goal in mind: to help travelers document their journeys beautifully while keeping track of their experiences, destinations, and costs.
        </p>
        <p>
          Whether you're embarking on a solo backpacking trip across Europe, a business trip to Singapore, or a weekend getaway with family, Explored provides a seamless platform to record your memories.
        </p>
        <p>
          Our community is passionate about discovering new places, sharing hidden gems, and helping each other plan better trips through authentic ratings and shared experiences.
        </p>
        <p className="font-semibold text-white mt-8 text-center pt-8 border-t border-white/10">
          Keep Exploring. Keep Documenting.
        </p>
      </div>
    </main>
  );
}
