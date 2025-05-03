"use client";

import { useEffect, useState,  useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import DarkModeToggle from "@/components/DarkModeToggle";
import DatePicker from "react-datepicker";
import { User } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import { API_BASE_URL } from "@/lib/config";
import { fetchGoals, createGoal, fetchRecommendations, fetchCategories } from "@/lib/api";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { AlertTriangle, CheckCircle, PlusCircle, Edit, Trash2, Target, Sparkles, ListChecks, ArrowRight } from "lucide-react";
import {
  PieChart,Pie,Cell,Legend,Tooltip,ResponsiveContainer,RadialBarChart,RadialBar,} from "recharts";
import BudgetHealthScore from '@/components/BudgetHealthScore';


export default function AIRecommendationsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [smartAlerts, setSmartAlerts] = useState([]);
  const [goalsEvaluation, setGoalsEvaluation] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState("recommendations"); // "recommendations" veya "goals"
  const [recommendations, setRecommendations] = useState([]);
  const [editGoalId, setEditGoalId] = useState(null);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [members, setMembers] = useState([]);
  const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#e11d48"];
  const [healthScore, setHealthScore] = useState(0);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
  
    fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.firstname && data.lastname) {
          setMembers([{ name: `${data.firstname} ${data.lastname}` }]);
        }
      })
      .catch((err) => console.error("Failed to fetch member info:", err));
  }, []);
  
  const [budgetInsights, setBudgetInsights] = useState({
    on_track: [],
    caution: [],
    opportunity: []
  });
  
  // Form state
  const [formData, setFormData] = useState({
    category_id: "",
    type: "fixed",
    amount: "",
    reference_period: "previous_month",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    is_active: true
  });

  // Fetch recommendations from backend
  const loadRecommendations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const data = await fetchRecommendations();
      setRecommendations(data.recommendations || []);
      setBudgetInsights(data.budget_insights || {
        on_track: [],
        caution: [],
        opportunity: []
      });
      setSmartAlerts(data.smart_alerts || []);
      setGoalsEvaluation(data.goals_evaluation || []);
      console.log("AI recommendations loaded:", data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };
  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      console.log("Categories geldi:", data);
      setCategories(data || []);
    } catch (error) {
      console.error("Kategori verisi alınamadı:", error);
    }
  };

  // Fetch user's goals from backend
const loadGoals = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const data = await fetchGoals(); // GET /goals
    setGoals(data || []);
  } catch (error) {
    console.error("Error fetching goals:", error);
  }
};

  //
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    Promise.all([loadRecommendations(),loadGoals(), loadCategories() ]).finally(() => setLoading(false));

    const fetchHealthScore = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/ai/budget-health-analysis`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setHealthScore(data.health_score || 0);
      } catch (error) {
        console.error("Health score fetch failed:", error);
      }
    };
  
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/ai/analytics/${selectedMonth.getFullYear()}/${selectedMonth.getMonth() + 1}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        console.log("Analytics result:", data);
        setCategoryTotals(data.category_totals || {});
      } catch (err) {
        console.error("Analytics fetch failed:", err);
      }
    };
    
    fetchHealthScore();
    fetchAnalytics();

  }, [router, selectedMonth]);

    // Update month/year when selectedMonth changes
    useEffect(() => {
      setFormData(prev => ({
        ...prev,
        month: selectedMonth.getMonth() + 1,
        year: selectedMonth.getFullYear()
      }));
    }, [selectedMonth]);

  const handleCreateGoal = async () => {
    try {
      const newGoal = await createGoal(formData);
      newGoal.category_name = categories.find(c => c.id === newGoal.category_id)?.name || "Unknown";
      setGoals(prevGoals => [...prevGoals, newGoal]);

      setShowModal(false);
      setFormData({
        category_id: categories.length > 0 ? categories[0].id : "",
        type: "fixed",
        amount: "",
        reference_period: "previous_month",
        month: selectedMonth.getMonth() + 1,
        year: selectedMonth.getFullYear(),
        is_active: true
      });
      
      // Refresh recommendations after creating a goal
      await loadRecommendations();
    } catch (error) {
      console.error("Error creating goal:", error);
    }
  };

  const handleUpdateGoal = async (goalId, updatedData) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/goals/${goalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });
  
      if (!res.ok) throw new Error("Goal update failed");
  
      const updatedGoal = await res.json();
      updatedGoal.category_name = categories.find(c => c.id === updatedGoal.category_id)?.name || "Unknown";
      setGoals(prevGoals =>
        prevGoals.map(g => (g.id === goalId ? updatedGoal : g))
      );
      await loadRecommendations();
  
      setShowModal(false);
    } catch (err) {
      console.error("Error updating goal:", err);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/goals/${goalId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) throw new Error("Failed to delete goal");
      
      setGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalId));
      
      // Refresh recommendations after deleting a goal
      await loadRecommendations();
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const fetchGoalProgress = async (goalId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/goals/${goalId}/progress`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) throw new Error("Failed to fetch goal progress");
      
      return await res.json();
    } catch (error) {
      console.error("Error fetching goal progress:", error);
      return null;
    }
  };

  const [progressData, setProgressData] = useState({});

  useEffect(() => {
    const loadProgress = async () => {
      const progressPromises = goals.map(goal => fetchGoalProgress(goal.id));
      const progressResults = await Promise.all(progressPromises);
      
      const progressMap = {};
      goals.forEach((goal, index) => {
        if (progressResults[index]) {
          progressMap[goal.id] = progressResults[index];
        }
      });
      
      setProgressData(progressMap);
    };
    
    if (goals.length > 0) {
      loadProgress();
    }
  }, [goals]);

  // Function to set a recommendation as a goal
  const setRecommendationAsGoal = async (recommendation) => {
    const token = localStorage.getItem("token");
  
    const matchingCategory = categories.find(cat => 
      cat.name.toLowerCase() === recommendation.category.toLowerCase()
    ) || categories.find(cat =>
      cat.name.toLowerCase().includes(recommendation.category.toLowerCase()) ||
      recommendation.category.toLowerCase().includes(cat.name.toLowerCase())
    );
  
    if (!matchingCategory) {
      alert(`There's no category found: ${recommendation.category}. Please create the category first.`);
      return;
    }
  
    try {
      // 1️⃣ create GOAl
      const goalData = {
        category_id: matchingCategory.id,
        type: "fixed",
        amount: recommendation.savings || 0,
        month: selectedMonth.getMonth() + 1,
        year: selectedMonth.getFullYear(),
        is_active: true
      };
  
      const newGoal = await createGoal(goalData);
      setGoals(prevGoals => [...prevGoals, newGoal]);
      alert(`"${matchingCategory.name}" kategorisi için yeni hedef oluşturuldu.`);
      setActiveTab("goals");
  
      // 2️⃣ TRANSACTION add
      const transactionPayload = {
        amount: recommendation.savings || 0,
        type: "expense", // or "income"
        description: recommendation.title,
        category_id: matchingCategory.id,
        date: new Date().toISOString()
      };
  
      const res = await fetch(`${API_BASE_URL}/transactions/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transactionPayload),
      });
  
      if (!res.ok) throw new Error("Transaction could not created");
  
      console.log("✅ Transaction added successfully");
  
      await loadRecommendations();
    } catch (error) {
      console.error("Goal or transaction creation error:", error);
      alert("There's an error. Please try again.");
    }
  
  

  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-black text-black dark:text-white">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Functions to get goal type display name and icon
  const getGoalTypeInfo = (type) => {
    switch (type) {
      case "fixed":
        return { name: "Fixed Amount", icon: "💰" };
      case "percentage":
        return { name: "Percentage of Income", icon: "📊" };
      case "relative":
        return { name: "Relative to Previous", icon: "📈" };
      default:
        return { name: "Unknown", icon: "❓" };
    }
  };
  const getGoalStatusStyle = (status) => {
    switch (status) {
      case "exceeded":
        return "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300";
      case "on_track":
        return "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300";
      case "at_risk":
        return "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300";
      default:
        return "bg-gray-50 dark:bg-gray-800/20 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300";
    }
  };
  // Function to get icon based on recommendation type
  const getRecommendationIcon = (type, priority) => {
    if (type === "warning") {
      return <AlertTriangle className={`${
        priority === 'high' ? 'text-red-600 dark:text-red-400' :
        priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
        'text-blue-600 dark:text-blue-400'
      }`} size={20} />;
    } else if (type === "achievement") {
      return <CheckCircle className="text-green-600 dark:text-green-400" size={20} />;
    } else {
      return <Sparkles className={`${
        priority === 'high' ? 'text-purple-600 dark:text-purple-400' :
        priority === 'medium' ? 'text-blue-600 dark:text-blue-400' :
        'text-green-600 dark:text-green-400'
      }`} size={20} />;
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      <Sidebar />
  
      <div className="flex-1 flex">
        <main className="flex-1 p-8 overflow-y-auto">
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
  <DarkModeToggle />
</div>

  
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">AI Recommendations 🤖</h1>
          </div>
  
          {/* Tabs */}
          <div className="flex mb-8 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("recommendations")}
              className={`mr-4 py-2 px-4 ${
                activeTab === "recommendations"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-medium"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles size={18} />
                <span>Smart Suggestions</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("goals")}
              className={`mr-4 py-2 px-4 ${
                activeTab === "goals"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-medium"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <Target size={18} />
                <span>Budget Goals</span>
              </div>
            </button>
          </div>
  
          {/* Recommendations Tab Content */}
          {activeTab === "recommendations" && (
            <div className="space-y-6">
              {/* Recommendations Panel */}
              <div className="bg-white dark:bg-white/10 p-6 rounded-xl shadow-md border border-gray-100 dark:border-white/5">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="text-blue-500" />
                  Personalized Recommendations
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Based on your spending habits, our AI algorithm has identified these opportunities to improve your finances.
                </p>
  
                <div className="space-y-4">
                  {recommendations.length > 0 ? (
                    recommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg border border-gray-100 dark:border-white/10"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`rounded-full p-2 ${
                              rec.priority === "high"
                                ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                : rec.priority === "medium"
                                ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}
                          >
                            {getRecommendationIcon(rec.type, rec.priority)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium">{rec.title}</h3>
                              {rec.savings > 0 && (
                                <span className="text-green-600 dark:text-green-400 font-medium">
                                  Save ${rec.savings}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                              {rec.description}
                            </p>
                            <div className="flex justify-between items-center mt-3">
                              <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                                {rec.category}
                              </span>
                              {rec.type !== "achievement" && rec.savings > 0 && (
                                <button
                                  onClick={() => setRecommendationAsGoal(rec)}
                                  className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                                >
                                  <span>Set as Goal</span>
                                  <ArrowRight size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 bg-gray-50 dark:bg-white/5 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400">
                        Add more transactions to get personalized recommendations.
                      </p>
                    </div>
                  )}
                </div>
  
                {/* Goals Evaluation */}
                {goalsEvaluation.length > 0 && (
                  <div className="space-y-3 mt-4">
                    {goalsEvaluation.map((goal, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-lg ${getGoalStatusStyle(goal.status)}`}
                      >
                        <div className="font-medium">{goal.message}</div>
                        {goal.suggestions &&
                          goal.suggestions.map((s, j) => (
                            <p
                              key={j}
                              className="text-sm text-red-500 dark:text-red-400 mt-1"
                            >
                              • {s}
                            </p>
                          ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
  
              {/* Budget Insights Section */}
              <div className="bg-white dark:bg-white/10 p-6 rounded-xl shadow-md border border-gray-100 dark:border-white/5">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <ListChecks className="text-purple-500" />
                  Budget Insights
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Insights based on your recent spending patterns and budget goals.
                </p>
  
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg">
  <h3 className="font-medium text-center mb-4">Spending Distribution</h3>
  {Object.keys(categoryTotals).length > 0 ? (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={Object.entries(categoryTotals).map(([name, data]) => ({
              name,
              value: parseFloat(data.value),
              type: data.type
            }))}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {Object.entries(categoryTotals).map((_, index) => (
              <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  ) : (
    <p className="text-center text-sm text-gray-400">No data available</p>
  )}
</div>

<div className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg">
  <h3 className="font-medium text-center mb-4">Budget Health Score</h3>
  {Object.keys(categoryTotals).length > 0 ? (
    <BudgetHealthScore score={healthScore} />
  ) : (
    <p className="text-center text-sm text-gray-400">No data available</p>
  )}
</div>

                </div>
              </div>
            </div>
          )}
      
  
  {activeTab === 'goals' && (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Your Budget Goals</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Set and track financial targets for your spending categories
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
        >
          <PlusCircle size={18} />
          New Goal
        </button>
      </div>
  
      {/* Month Selector */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">Filter by Month</label>
        <DatePicker
          selected={selectedMonth}
          onChange={(date) => setSelectedMonth(date)}
          dateFormat="MMMM yyyy"
          showMonthYearPicker
          className="p-2 rounded-md border dark:bg-white/10 dark:text-white"
        />
      </div>
  
      {/* No Goals Message */}
      {goals.length === 0 ? (
        <div className="bg-white dark:bg-white/10 p-8 rounded-xl shadow text-center">
          <h3 className="text-xl font-semibold mb-2">No Budget Goals Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Track your spending by setting budget goals for different categories.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = progressData[goal.id] || {};
            const goalTypeInfo = getGoalTypeInfo(goal.type);
  
            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-white/10 rounded-xl shadow p-6 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                      {goalTypeInfo.icon} {goalTypeInfo.name}
                    </span>
                    <h3 className="text-lg font-semibold mt-2">{goal.category_name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditGoalId(goal.id);
                        setFormData({
                          category_id: goal.category_id,
                          type: goal.type,
                          amount: goal.amount,
                          reference_period: goal.reference_period || "previous_month",
                          month: goal.month,
                          year: goal.year,
                          is_active: goal.is_active
                        });
                        setShowModal(true);
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
  
                {/* Progress Visual */}
                {progress.current_amount !== undefined && (
                  <div className="mb-4 flex items-center justify-center">
                    <div className="w-24 h-24">
                      <CircularProgressbar
                        value={Math.min(progress.progress_percentage || 0, 100)}
                        text={`${Math.round(progress.progress_percentage || 0)}%`}
                        styles={buildStyles({
                          textSize: '22px',
                          pathColor: progress.status === 'on_track' ? '#16a34a' : '#dc2626',
                          textColor: progress.status === 'on_track' ? '#16a34a' : '#dc2626',
                          trailColor: '#d1d5db',
                        })}
                      />
                    </div>
                  </div>
                )}
  
                {/* Budget Breakdown */}
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Target:</span>
                    <span className="font-medium">
                      ${progress.target_amount || goal.amount}
                    </span>
                  </div>
                  {progress.current_amount !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Current:</span>
                      <span className={`font-medium ${progress.status === 'on_track' ? 'text-green-600' : 'text-red-500'}`}>
                        ${progress.current_amount}
                      </span>
                    </div>
                  )}
                  {progress.remaining_budget !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                      <span className="font-medium">
                        ${Math.max(0, progress.remaining_budget)}
                      </span>
                    </div>
                  )}
                </div>
  
                {/* Status Message */}
                {progress.status && (
                  <div className={`mt-4 p-2 rounded-md text-sm flex items-start gap-2 
                    ${progress.status === 'on_track' 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                      : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'}`}
                  >
                    {progress.status === 'on_track' 
                      ? <CheckCircle className="w-4 h-4 mt-0.5" /> 
                      : <AlertTriangle className="w-4 h-4 mt-0.5" />}
                    <span>{progress.message || (progress.status === 'on_track' ? 'On track!' : 'Budget exceeded')}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  )}
  

  {showModal && (
    <div className="fixed inset-0 bg-black/50 dark:bg-white/20 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {editGoalId ? "Edit Budget Goal" : "Create New Budget Goal"}
        </h2>
  
        <div className="space-y-4">
          {/* Category Selector */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({
                ...formData,
                category_id: parseInt(e.target.value)
              })}
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
  
          {/* Goal Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Goal Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({
                ...formData,
                type: e.target.value
              })}
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="fixed">Fixed Amount</option>
              <option value="percentage">Percentage of Income</option>
              <option value="relative">Relative to Previous Period</option>
            </select>
          </div>
  
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {formData.type === 'fixed' ? 'Amount ($)' :
               formData.type === 'percentage' ? 'Percentage (%)' :
               'Change Percentage (%)'}
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({
                ...formData,
                amount: parseFloat(e.target.value)
              })}
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              placeholder={formData.type === 'fixed' ? 'e.g. 500' : 'e.g. 10'}
            />
          </div>
  
          {/* Reference Period (for relative goals only) */}
          {formData.type === 'relative' && (
            <div>
              <label className="block text-sm font-medium mb-1">Reference Period</label>
              <select
                value={formData.reference_period}
                onChange={(e) => setFormData({
                  ...formData,
                  reference_period: e.target.value
                })}
                className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="previous_month">Previous Month</option>
                <option value="previous_year">Same Month Last Year</option>
              </select>
            </div>
          )}
  
          {/* Month Picker */}
          <div>
            <label className="block text-sm font-medium mb-1">Month</label>
            <DatePicker
              selected={selectedMonth}
              onChange={(date) => setSelectedMonth(date)}
              dateFormat="MMMM yyyy"
              showMonthYearPicker
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        </div>
  
        {/* Modal Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => {
              setShowModal(false);
              setEditGoalId(null);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (editGoalId) {
                handleUpdateGoal(editGoalId, formData);
              } else {
                handleCreateGoal();
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {editGoalId ? "Update Goal" : "Create Goal"}
          </button>
        </div>
      </div>
    </div>
  )}
  </main>

        {/* Sidebar (aside) */}
        <aside className="w-64 bg-white dark:bg-white/10 border-l border-gray-200 dark:border-white/10 p-6 hidden lg:flex flex-col justify-between">
          <div>
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
          </div>
  
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("name");
              localStorage.removeItem("email");
              router.push("/login");
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition mt-6"
          >
            Log out
            </button>
        </aside>
      </div> {/* inner flex container */}
    </div>   
  );
}

  
  
