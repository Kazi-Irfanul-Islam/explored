export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-bold tracking-tight text-white mb-8 text-center">
        Privacy Policy
      </h1>
      <div className="glass-card rounded-3xl p-10 space-y-6 text-slate-300 leading-relaxed text-sm md:text-base">
        <h2 className="text-xl font-bold text-white mt-4">1. Information We Collect</h2>
        <p>
          We only collect information necessary to provide our services, which includes your username and hashed password for authentication. When you create travel logs, the content you publish is visible to the public.
        </p>

        <h2 className="text-xl font-bold text-white mt-4">2. How We Use Information</h2>
        <p>
          Your information is used strictly to maintain your account, display your travel logs, and allow you to interact with others via comments and wishlists. We do not sell your personal data to third parties.
        </p>

        <h2 className="text-xl font-bold text-white mt-4">3. Data Security</h2>
        <p>
          We implement modern security practices, including strong bcrypt hashing for passwords and secure session management via NextAuth, to protect your account against unauthorized access.
        </p>

        <h2 className="text-xl font-bold text-white mt-4">4. Contact Us</h2>
        <p>
          If you have questions about our privacy practices, please use the Contact page to reach our admin team.
        </p>
      </div>
    </main>
  );
}
