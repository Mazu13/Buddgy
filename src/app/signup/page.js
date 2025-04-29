"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/themeContext";
import useHasMounted from "@/lib/useHasMounted";
import { API_BASE_URL } from "@/lib/config";


export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const { darkMode, setDarkMode } = useTheme();
  const hasMounted = useHasMounted();
  const router = useRouter();

  if (!hasMounted) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/users/`,
        {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: formData.firstName,   // ✅ düzeltildi
          lastname: formData.lastName,     // ✅ düzeltildi
          email: formData.email,
          password: formData.password,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        alert(data.detail || "Signup failed.");
        return;
      }
  
      // Başarılı ise login sayfasına yönlendir
      router.push("/login");
    } catch (err) {
      console.error("Signup error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center text-gray-900 dark:text-white transition-colors duration-500 ease-in-out overflow-hidden">
      {/* 🌈 Background Blobs */}
      <div className="absolute inset-0 -z-10 bg-white dark:bg-black">
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-indigo-400 via-cyan-500 to-teal-400 rounded-full blur-[120px] opacity-20 dark:opacity-30 top-[10%] left-[15%] animate-pulse" />
        <div className="absolute w-[300px] h-[300px] bg-gradient-to-br from-cyan-400 to-teal-500 rounded-full blur-[100px] opacity-25 dark:opacity-40 bottom-[15%] left-[10%] animate-pulse" />
        <div className="absolute w-[250px] h-[250px] bg-gradient-to-br from-blue-300 to-indigo-500 rounded-full blur-[90px] opacity-20 dark:opacity-30 bottom-[10%] right-[12%] animate-pulse" />
      </div>

      {/* 🌗 Dark Mode Toggle */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`w-10 h-10 flex items-center justify-center rounded-full 
            transition duration-300 border-2 shadow-md 
            ${darkMode ? "bg-white text-yellow-500 border-white/20" : "bg-black text-white border-black/20"}`}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      {/* 📝 Signup Card */}
      <div className="w-full max-w-md bg-white/90 dark:bg-white/15 backdrop-blur-sm border border-white/20 dark:border-white/10 px-8 py-10 rounded-3xl shadow-2xl space-y-6 z-10">
        <h2 className="text-3xl font-bold text-center flex items-center justify-center gap-3">
          Buddgy
          <img src="/images/buddgy-icon.png" alt="buddgy-icon" className="w-10 h-10" />
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-800 dark:text-white focus:ring-2 focus:ring-cyan-400 outline-none"
              placeholder="Enter your first name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-800 dark:text-white focus:ring-2 focus:ring-cyan-400 outline-none"
              placeholder="Enter your last name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-800 dark:text-white focus:ring-2 focus:ring-cyan-400 outline-none"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-800 dark:text-white focus:ring-2 focus:ring-cyan-400 outline-none"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Sign Up
          </button>
        </form>

        <div className="text-center">
          <a href="/login" className="text-sm text-cyan-600 hover:underline dark:text-cyan-400">
            Already have an account? Log In
          </a>
        </div>
      </div>
    </div>
  );
}
