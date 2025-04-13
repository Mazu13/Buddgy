"use client";

import DarkModeToggle from "@/components/DarkModeToggle";

export default function WelcomePage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center text-gray-900 dark:text-white transition-colors duration-500 ease-in-out overflow-hidden">

      {/* 🌗 Global Dark Mode Toggle */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <DarkModeToggle />
      </div>

      {/* 🌈 Glow Background Blobs */}
      <div className="absolute inset-0 -z-10 bg-white dark:bg-black">
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-indigo-400 via-cyan-500 to-teal-400 rounded-full blur-[120px] opacity-20 dark:opacity-30 top-[10%] left-[15%] animate-pulse" />
        <div className="absolute w-[300px] h-[300px] bg-gradient-to-br from-cyan-400 to-teal-500 rounded-full blur-[100px] opacity-25 dark:opacity-40 bottom-[15%] left-[10%] animate-pulse" />
        <div className="absolute w-[250px] h-[250px] bg-gradient-to-br from-blue-300 to-indigo-500 rounded-full blur-[90px] opacity-20 dark:opacity-30 bottom-[10%] right-[12%] animate-pulse" />
      </div>

      {/* 🖼️ İllüstrasyonlar */}
      <img src="/images/picture1.svg" alt="chart woman" className="absolute w-[160px] sm:w-[200px] top-8 left-4 animate-float-slow opacity-80 pointer-events-none" />
      <img src="/images/picture2.svg" alt="pie chart man" className="absolute w-[150px] sm:w-[180px] top-6 right-6 animate-float opacity-80 pointer-events-none" />
      <img src="/images/picture3.svg" alt="wallet back man" className="absolute w-[120px] sm:w-[160px] bottom-4 left-2 animate-float opacity-90 pointer-events-none" />
      <img src="/images/picture4.svg" alt="bar chart screen" className="absolute w-[160px] sm:w-[200px] bottom-4 right-2 animate-float opacity-90 pointer-events-none" />
      <img src="/images/picture5.svg" alt="piggy bank" className="absolute w-[180px] sm:w-[220px] bottom-0 left-1/2 -translate-x-1/2 animate-float-slow opacity-90 pointer-events-none" />

      {/* 💳 Welcome Card */}
      <div className="w-full max-w-xl bg-white/90 dark:bg-white/15 backdrop-blur-sm border border-white/20 dark:border-white/10 px-8 py-10 rounded-3xl shadow-2xl text-center animate-fade-in z-10 relative space-y-6">

        <img
          src="/images/buddgy-icon.png"
          alt="buddgy-icon"
          className="w-14 h-14 mx-auto transition-transform duration-300 hover:scale-110 hover:-translate-y-1"
        />

        <h1 className="text-3xl sm:text-4xl font-bold leading-snug">
          Manage Your Money <br className="hidden sm:block" />
          with Buddgy
        </h1>

        <p className="text-md text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
          Budget smarter. Track every dollar. Grow your savings — all in one beautiful place.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
          <a
            href="/signup"
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition transform hover:scale-105"
          >
            Sign Up
          </a>
          <a
            href="/login"
            className="px-6 py-2 bg-purple-400 hover:bg-purple-500 text-white font-medium rounded-lg transition transform hover:scale-105"
          >
            Log In
          </a>
        </div>
      </div>
    </div>
  );
}
