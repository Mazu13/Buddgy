"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import DarkModeToggle from "@/components/DarkModeToggle";
import useHasMounted from "@/lib/useHasMounted";
import { API_BASE_URL } from "@/lib/config";

export default function Login() {
  const hasMounted = useHasMounted();
  const router = useRouter();
  

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!hasMounted) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const res = await fetch(`${API_BASE_URL}/token`, {


        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });
  
      const text = await res.text();
      let data;
  
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("JSON parse hatası:", text);
        setError("Invalid response from server");
        return;
      }
  
      if (!res.ok) {
        setError(data.detail || "Login failed");
        return;
      }
  
      if (!data.access_token) {
        setError("Access token missing");
        return;
      }
  
      localStorage.setItem("token", data.access_token);
      router.push("/dashboard");
    } catch (err) {
      console.error("FETCH ERROR:", err);
      setError("Server error");
    }
  };
  
  return (
    <div className="relative min-h-screen flex items-center justify-center text-gray-900 dark:text-white transition-colors duration-500 ease-in-out overflow-hidden">
      {/* 🌗 Global Toggle */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <DarkModeToggle />
      </div>

      {/* 🌈 Background Blobs */}
      <div className="absolute inset-0 -z-10 bg-white dark:bg-black">
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-indigo-400 via-cyan-500 to-teal-400 rounded-full blur-[120px] opacity-20 dark:opacity-30 top-[10%] left-[15%] animate-pulse" />
        <div className="absolute w-[300px] h-[300px] bg-gradient-to-br from-cyan-400 to-teal-500 rounded-full blur-[100px] opacity-25 dark:opacity-40 bottom-[15%] left-[10%] animate-pulse" />
        <div className="absolute w-[250px] h-[250px] bg-gradient-to-br from-blue-300 to-indigo-500 rounded-full blur-[90px] opacity-20 dark:opacity-30 bottom-[10%] right-[12%] animate-pulse" />
      </div>

      {/* 💳 Login Card */}
      <div className="w-full max-w-md bg-white/90 dark:bg-white/15 backdrop-blur-sm border border-white/20 dark:border-white/10 px-8 py-10 rounded-3xl shadow-2xl space-y-6 z-10">
        <h2 className="text-3xl font-bold text-center flex items-center justify-center gap-3">
          Buddgy
          <img src="/images/buddgy-icon.png" alt="buddgy-icon" className="w-10 h-10" />
        </h2>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-800 dark:text-white focus:ring-2 focus:ring-cyan-400 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-800 dark:text-white focus:ring-2 focus:ring-cyan-400 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
             type="button"
             onClick={handleLogin}
            className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Log In
          </button>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full flex items-center justify-center gap-2 py-2 px-4
              bg-gradient-to-r from-purple-400 to-indigo-500
              text-white font-medium rounded-lg border border-transparent
              transition-all duration-300
              hover:bg-white hover:text-gray-800 hover:border-gray-300 dark:hover:text-white"
        >
          <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
            <path d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.2H272v95.1h146.9c-6.3 33.6-25 62.2-53.5 81.3v67h86.6c50.7-46.7 81.5-115.6 81.5-193.2z" fill="#4285F4" />
            <path d="M272 544.3c72.6 0 133.5-24.1 178-65.4l-86.6-67c-24.1 16.2-55 25.8-91.4 25.8-70 0-129.4-47.2-150.7-110.2H33.4v69.3c44.3 88.3 135.3 147.5 238.6 147.5z" fill="#34A853" />
            <path d="M121.3 327.5c-10.2-30.6-10.2-63.9 0-94.5V163.7H33.4c-37.8 75.7-37.8 164.9 0 240.6l87.9-67z" fill="#FBBC05" />
            <path d="M272 107.3c39.5 0 75 13.6 102.9 40.2l77.3-77.3C405.5 25.5 345 0 272 0 168.7 0 77.7 59.2 33.4 147.5l87.9 67C142.6 154.5 202 107.3 272 107.3z" fill="#EA4335" />
          </svg>
          <span>Sign in with Google</span>
        </button>

        <div className="text-center mt-4">
          <a href="/password" className="text-sm text-cyan-600 hover:underline dark:text-cyan-400">
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  );
}
