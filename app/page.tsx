import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-space-black to-space-navy relative overflow-hidden">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center relative z-10">
        {/* Hero Section */}
        <div className="mb-8 sm:mb-12 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 animate-glow">
            Welcome to NerdSphere
          </h1>
          <p className="text-xl sm:text-2xl text-space-cyan animate-pulse-slow">
            An experimental anonymous global chat room
          </p>
        </div>

        {/* Warning Section */}
        <div className="bg-space-navy/50 border-2 border-space-purple rounded-lg p-6 sm:p-8 mb-6 sm:mb-8 backdrop-blur-sm animate-slide-up shadow-glow">
          <h2 className="text-lg sm:text-xl font-bold text-space-purple mb-4">
            ⚠️ Warning: Expect Chaos
          </h2>
          <div className="text-gray-300 space-y-3 text-left text-sm sm:text-base">
            <p>
              <strong>No moderation.</strong> Anyone can say anything. This is an experiment in digital chaos.
            </p>
            <p>
              <strong>Messages disappear after 24 hours.</strong> Nothing here is permanent.
            </p>
            <p>
              <strong>Completely anonymous.</strong> No accounts, no tracking, no rules.
            </p>
            <p className="text-xs sm:text-sm text-gray-400 mt-4">
              By entering, you acknowledge this is an unmoderated space. Proceed at your own discretion.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <Link
          href="/chat"
          className="inline-block bg-space-purple hover:bg-space-glow text-white font-bold text-lg sm:text-xl px-8 sm:px-12 py-3 sm:py-4 rounded-lg transition-all duration-300 shadow-glow hover:shadow-[0_0_30px_rgba(139,92,246,0.8)] transform hover:scale-105 active:scale-95"
        >
          Enter the Chaos
        </Link>
      </div>
    </div>
  );
}
