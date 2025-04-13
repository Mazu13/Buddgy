"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, BarChart, Bot, Bell, Users } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: <Home size={18} /> },
    { name: "Budget Tracking", href: "/budget", icon: <Wallet size={18} /> },
    { name: "Analytics", href: "/analytics", icon: <BarChart size={18} /> },
    { name: "AI Recommendations", href: "/ai", icon: <Bot size={18} /> },
    { name: "Alerts", href: "/alerts", icon: <Bell size={18} /> },
    { name: "Team", href: "/team", icon: <Users size={18} /> },
  ];

  return (
    <div className="w-64 min-h-screen bg-white dark:bg-[#111827] border-r dark:border-white/10 px-4 py-6 text-gray-800 dark:text-white">
      <div className="flex items-center space-x-2 mb-10">
        <img
          src="/images/buddgy-icon.png"
          alt="buddgy-icon"
          className="w-8 h-8 rounded-full"
        />
        <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Buddgy</h1>
      </div>
      <ul className="space-y-4">
        {links.map((link) => (
          <li key={link.name}>
            <Link
              href={link.href}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition duration-200 ease-in-out ${
                pathname === link.href
                  ? "bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 font-medium"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {link.icon}
              <span className="text-sm">{link.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
