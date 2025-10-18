import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-black via-space-black to-purple-950">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>

      {/* Black hole sphere at bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 pointer-events-none">
        {/* Outer glow rings with breathing animation */}
        <div className="absolute inset-0 -inset-32">
          <div className="absolute inset-0 rounded-full bg-gradient-radial from-purple-500/30 via-purple-600/20 to-transparent blur-3xl animate-breathe"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-radial from-pink-500/20 via-purple-500/10 to-transparent blur-2xl animate-breathe" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* Black hole sphere */}
        <div className="relative w-96 h-96 rounded-full bg-gradient-radial from-black via-purple-950 to-black shadow-[0_0_100px_rgba(168,85,247,0.4)]">
          {/* Inner dark core */}
          <div className="absolute inset-12 rounded-full bg-black shadow-[inset_0_0_60px_rgba(0,0,0,0.9)]"></div>
          
          {/* Event horizon ring */}
          <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-breathe"></div>
          <div className="absolute inset-6 rounded-full border border-purple-400/20 animate-breathe" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </div>

      {/* Purple horizon glow */}
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-purple-900/40 via-purple-500/10 to-transparent pointer-events-none"></div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center relative z-10">
        {/* Hero Section */}
        <div className="mb-8 sm:mb-12 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 animate-glow lowercase">
            welcome to nerdsphere
          </h1>
          <p className="text-xl sm:text-2xl text-space-cyan animate-pulse-slow lowercase">
            an experimental anonymous global chat room
          </p>
        </div>

        {/* Warning Section - Glassmorphic */}
        <div className="bg-white/5 border border-purple-500/30 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 backdrop-blur-xl animate-slide-up shadow-[0_8px_32px_0_rgba(139,92,246,0.2)]">
          <h2 className="text-lg sm:text-xl font-bold text-space-purple mb-4 lowercase">
            ⚠️ warning: expect chaos
          </h2>
          <div className="text-gray-300 space-y-3 text-left text-sm sm:text-base lowercase">
            <p>
              <strong>no moderation.</strong> anyone can say anything. this is an experiment in digital chaos.
            </p>
            <p>
              <strong>messages disappear after 24 hours.</strong> nothing here is permanent.
            </p>
            <p>
              <strong>completely anonymous.</strong> no accounts, no tracking, no rules.
            </p>
            <p className="text-xs sm:text-sm text-gray-400 mt-4">
              by entering, you acknowledge this is an unmoderated space. proceed at your own discretion.
            </p>
          </div>
        </div>

        {/* Call to Action - Outline Button */}
        <div className="relative inline-block group">
          {/* Animated border glow background */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-xl opacity-75 group-hover:opacity-100 blur-sm animate-border-glow"></div>
          
          {/* Button */}
          <Link
            href="/chat"
            className="relative inline-block bg-black/80 backdrop-blur-sm border-2 border-purple-500/50 text-white font-bold text-lg sm:text-xl px-8 sm:px-12 py-3 sm:py-4 rounded-xl transition-all duration-300 hover:border-purple-400 hover:bg-black/60 transform hover:scale-105 active:scale-95 overflow-hidden group-hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] lowercase"
          >
            {/* Shimmer effect overlay */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent animate-shimmer"></span>
            
            {/* Button text */}
            <span className="relative z-10">enter the chat</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
