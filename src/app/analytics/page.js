// 📁 src/app/analytics/page.js

"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import DarkModeToggle from "@/components/DarkModeToggle";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  LabelList, 
  Tooltip,
} from "recharts";

const COLORS = ["#16a34a", "#dc2626", "#fbbf24", "#3b82f6", "#8b5cf6"];

export default function AnalyticsPage() {
  const [boards, setBoards] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState(new Date());

  
  const customLegend = () => {
    return (
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2 text-red-600">
          <div className="w-3 h-3 rounded-full bg-red-600" />
          Expense
        </div>
        <div className="flex items-center gap-2 text-green-600">
          <div className="w-3 h-3 rounded-full bg-green-600" />
          Income
        </div>
      </div>
    );
  };

  useEffect(() => {
    const savedBoards = localStorage.getItem("buddgy-boards");
    if (savedBoards) {
      setBoards(JSON.parse(savedBoards));
    }
  }, []);

  useEffect(() => {
    const allEntries = boards.flatMap((b) =>
      b.entries.map((e) => ({ ...e, boardTitle: b.title }))
    );

    const groupedByDate = {};
    const groupedByLabel = {};

    allEntries.forEach((entry) => {
      if (!entry.date) return;
      const date = new Date(entry.date);
      if (date >= startDate && date <= endDate) {
        const dateStr = date.toISOString().split("T")[0];

        if (!groupedByDate[dateStr]) {
          groupedByDate[dateStr] = { date: dateStr, income: 0, expense: 0 };
        }

        if (entry.type === "+") groupedByDate[dateStr].income += entry.amount;
        else if (entry.type === "-") groupedByDate[dateStr].expense += entry.amount;

        const label = entry.name || "Unnamed";
        if (!groupedByLabel[label]) groupedByLabel[label] = { name: label, value: 0, type: entry.type };
        groupedByLabel[label].value += entry.amount;
      }
    });

    const result = Object.values(groupedByDate).sort((a, b) => new Date(a.date) - new Date(b.date));
    setFilteredData(result);
    setPieData(Object.values(groupedByLabel));
  }, [boards, startDate, endDate]);

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      return (
        <div
          className="p-2 border rounded shadow text-sm"
          style={{
            backgroundColor: "#fff",
            color: "#000",
            border: "1px solid #ccc",
          }}
        >
          <p className="font-semibold">{name}</p>
          <p>Amount: ${value}</p>
        </div>
      );
    }
    return null;
  };
  

  return (
    <div className="flex h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <DarkModeToggle />
        </div>

        <h1 className="text-3xl font-bold mb-6">Analytics 📊</h1>

        {/* 🗓️ Date Picker */}
        <div className="flex gap-4 items-center mb-8">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={endDate}
              dateFormat="MM/dd/yyyy"
              className="p-2 rounded-md border dark:bg-black dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              dateFormat="MM/dd/yyyy"
              className="p-2 rounded-md border dark:bg-black dark:text-white"
            />
          </div>
        </div>

        {/* 📊 Bar Chart */}
        <div className="bg-white dark:bg-white/10 p-6 rounded-2xl shadow max-w-3xl mx-auto mb-10">
          <h2 className="text-xl font-semibold text-center mb-4">Income & Expense Chart</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={filteredData}
                barCategoryGap={16}  // bar grupları arasındaki boşluk
                barGap={4}           // income vs expense barları arasındaki boşluk>
                >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Legend />
              <Bar dataKey="income" fill="#16a34a" name="Income 💰">
                <LabelList dataKey="income" position="top" formatter={(v) => `$${v}`} />
              </Bar>
              <Bar dataKey="expense" fill="#dc2626" name="Expense 💸">
                <LabelList dataKey="expense" position="top" formatter={(v) => `$${v}`} />
              </Bar>

            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 🥧 Pie Chart */}
        <div className="bg-white dark:bg-white/10 p-6 rounded-2xl shadow max-w-3xl mx-auto mb-20">
          <h2 className="text-xl font-semibold text-center mb-4">Entries Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey= "value" 
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={60}
                paddingAngle={3}
                label={({ percent }) =>
                    `(${(percent * 100).toFixed(1)}%)`
            }
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.type === "+" ? "#16a34a" : "#dc2626"}
                  />
                ))}
              </Pie>
              <Tooltip 
              content={<CustomPieTooltip />}/>
              <Legend content={customLegend} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}
