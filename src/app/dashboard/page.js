"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import DarkModeToggle from "@/components/DarkModeToggle";
import { API_BASE_URL } from "@/lib/config";
import { fetchBoards } from "@/lib/api";


import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Sparkles, Bell, User } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [boards, setBoards] = useState([]);
  const [showingIncome, setShowingIncome] = useState(true);
  const [members, setMembers] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
  
    fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data?.firstname && data?.lastname) {
          setUsername(data.firstname); // Welcome kısmı için
          setMembers([{ name: `${data.firstname} ${data.lastname}` }]); // Members paneli için
        }
      })
      .catch(err => console.error("Failed to fetch user:", err));
  }, []);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
  
    const loadBoards = async () => {
      try {
        const data = await fetchBoards(); 
        setBoards(data || []);             
        localStorage.setItem("budgetBoards", JSON.stringify(data)); 
      } catch (err) {
        console.error("Error fetching boards:", err);
      }
    };
  
    loadBoards();
  }, [router]);
  


  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const name = localStorage.getItem("name");

    if (token && email && name) {
      const createUserIfNeeded = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/users/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              firstname: name.split(" ")[0] || "Google",
              lastname: name.split(" ")[1] || "User",
              email: email,
              password: "google-oauth",
            }),
          });

          if (res.ok) {
            console.log("User created in backend.");
          } else {
            const data = await res.json();
            if (data.detail?.includes("zaten kayıtlı")) {
              console.log("User already exists.");
            } else {
              console.warn("Backend error:", data);
            }
          }
        } catch (err) {
          console.error("Failed to sync user to backend:", err);
        }
      };

      createUserIfNeeded();
    }
  }, []);

  const totalIncome = boards
    .flatMap((board) => board.entries || [])
    .filter((entry) => entry.type === "+")
    .reduce((sum, entry) => sum + (entry.amount || 0), 0);

  const totalExpense = boards
    .flatMap((board) => board.entries || [])
    .filter((entry) => entry.type === "-")
    .reduce((sum, entry) => sum + (entry.amount || 0), 0);

  const netBalance = totalIncome - totalExpense;
  const totalSum = totalIncome + totalExpense;

  const incomePercent = totalSum === 0 ? 0 : Math.round((totalIncome / totalSum) * 100);
  const expensePercent = totalSum === 0 ? 0 : Math.round((totalExpense / totalSum) * 100);
  const balancePercent = totalIncome === 0 ? 0 : Math.round((netBalance / totalIncome) * 100);

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
              Welcome, {username} 👋
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Here's a quick overview of your budget.
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("name");
                localStorage.removeItem("email");
                router.push("/login");
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Log out
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-10 mb-12 w-full">


            <div
              onClick={() => setShowingIncome(!showingIncome)}
              className="w-full sm:w-1/2 p-8 cursor-pointer bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm flex flex-col items-center justify-center hover:shadow-md transition"
            >
              <div className="w-60 h-60 mb-2">
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

            <div className="w-full sm:w-1/2 p-8 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm flex flex-col items-center justify-center">

              <div className="w-60 h-60 mb-2">
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

       
        </main>

        <aside className="w-64 bg-white dark:bg-white/10 border-l border-gray-200 dark:border-white/10 p-6 hidden lg:block">
          <h2 className="text-lg font-semibold mb-4">User</h2>
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
