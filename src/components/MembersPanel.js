"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

export default function MembersPanel() {
  const [memberName, setMemberName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMemberName(`${data.firstname} ${data.lastname}`);

        } else {
          console.error("Failed to fetch user");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  if (!memberName) return null;

  return (
    <div className="w-64 bg-white dark:bg-white/10 border-l border-gray-200 dark:border-white/10 p-6 hidden lg:flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-semibold mb-4">User</h2>
        <ul className="space-y-3">
          <li className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm">{memberName}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
