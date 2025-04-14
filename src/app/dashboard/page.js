"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import DarkModeToggle from "@/components/DarkModeToggle";
import { fetchBoards } from "../../lib/api";

import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Sparkles, Bell, User } from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [boards, setBoards] = useState([]);
  const [showingIncome, setShowingIncome] = useState(true);

  useEffect(() => {
    const checkAccessAndFetchBoards = async () => {
      const token = localStorage.getItem("token");

      // Erişim kontrolü: Ne session var ne token → login sayfasına gönder
      if (!token && status === "unauthenticated") {
        router.push("/login");
        return;
      }

      try {
        const data = await fetchBoards(); // backend'den veri çek
        setBoards(data);
      } catch (err) {
        console.error("Could not fetch boards:", err);
      }
    };

    if (status !== "loading") {
      checkAccessAndFetchBoards();
    }
  }, [status, router]);

  if (status === "loading") return <div className="text-center mt-20">Loading...</div>;

  const totalIncome = boards
    .flatMap((board) => board.entries)
    .filter((entry) => entry.type === "+")
    .reduce((sum, entry) => sum + (entry.amount || 0), 0);

  const totalExpense = boards
    .flatMap((board) => board.entries)
    .filter((entry) => entry.type === "-")
    .reduce((sum, entry) => sum + (entry.amount || 0), 0);

  const netBalance = totalIncome - totalExpense;
  const totalSum = totalIncome + totalExpense;

  const incomePercent = totalSum === 0 ? 0 : Math.round((totalIncome / totalSum) * 100);
  const expensePercent = totalSum === 0 ? 0 : Math.round((totalExpense / totalSum) * 100);
  const balancePercent = totalIncome === 0 ? 0 : Math.round((netBalance / totalIncome) * 100);
  const [members, setMembers] = useState([{ name: "Ayşenur Mazıbaş" }]);
  return (
    <div className="flex min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      <Sidebar />

      <div className="flex-1 flex">
        <main className="flex-1 p-8">
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
            <DarkModeToggle />
          </div>

          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome, {session?.user?.name?.split(" ")[0]} 👋
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Here's a quick overview of your budget.
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Log out
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            {/* Toggleable Income/Expense Card */}
            <div
              onClick={() => setShowingIncome(!showingIncome)}
              className="cursor-pointer bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center hover:shadow-md transition"
            >
              <div className="w-28 h-28 mb-2">
                <CircularProgressbar
                  value={showingIncome ? incomePercent : expensePercent}
                  text={`${showingIncome ? incomePercent : expensePercent}%`}
                  styles={buildStyles({
                    textColor: showingIncome ? "#16a34a" : "#dc2626",
                    pathColor: showingIncome ? "#16a34a" : "#dc2626",
                    trailColor: showingIncome ? "#e0f2e9" : "#fdecea",
                  })}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {showingIncome ? "Total Income" : "Total Expense"}
              </p>
              <p className={`text-2xl font-bold ${showingIncome ? "text-green-600" : "text-red-500"}`}>
                ${showingIncome ? totalIncome : totalExpense}
              </p>
            </div>

            {/* Net Balance Card */}
            <div className="bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center">
              <div className="w-24 h-24 mb-2">
                <CircularProgressbar
                  value={balancePercent}
                  text={`${balancePercent}%`}
                  styles={buildStyles({
                    textColor: "#2563eb",
                    pathColor: "#2563eb",
                    trailColor: "#e0ecfc",
                  })}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Net Balance</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${netBalance}</p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-xl shadow flex items-start gap-2 mb-6">
            <Sparkles className="text-yellow-600 mt-1 w-5 h-5" />
            <div>
              <p className="font-semibold text-yellow-800 dark:text-yellow-300">Quick Tip</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">Working on it...</p>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-xl shadow flex items-start gap-2">
            <Bell className="text-red-500 mt-1 w-5 h-5" />
            <div>
              <p className="font-semibold text-red-800 dark:text-red-300">Alert</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">Working on it...!</p>
            </div>
          </div>
        </main>

        <aside className="w-64 bg-white dark:bg-white/10 border-l border-gray-200 dark:border-white/10 p-6 hidden lg:block">
          <h2 className="text-lg font-semibold mb-4">Members</h2>
          <ul className="space-y-3">
            {members.map((member, idx) => (
              <li key={idx} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm">{member.name}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}