"use client";
import { useTheme } from "@/lib/themeContext";
import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const { darkMode, setDarkMode } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className={`w-11 h-11 flex items-center justify-center rounded-full shadow-lg backdrop-blur-lg text-lg transition hover:scale-110 hover:shadow-xl ${
        darkMode
          ? "bg-white text-yellow-500"   // ☀️ güneş ikonu, beyaz arka plan
          : "bg-black text-white"        // 🌙 ay ikonu, siyah arka plan
      }`}
      aria-label="Toggle Dark Mode"
    >
      {darkMode ? "☀️" : "🌙"}
    </button>
  );
}
