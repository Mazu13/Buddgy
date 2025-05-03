"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import DarkModeToggle from "@/components/DarkModeToggle";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { API_BASE_URL } from "@/lib/config";
import { fetchGoals, createGoal } from "@/lib/api";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { AlertTriangle, CheckCircle, Plus, PlusCircle, Edit, Trash2 } from "lucide-react";

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
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

  // Fetch goals and categories
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      try {
        // Fetch categories first
        const categoriesRes = await fetch(`${API_BASE_URL}/categories/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!categoriesRes.ok) throw new Error("Failed to fetch categories");
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
        
        // Set default category if available
        if (categoriesData.length > 0 && !formData.category_id) {
          setFormData(prev => ({ ...prev, category_id: categoriesData[0].id }));
        }
        
        // Then fetch goals
        const goalsData = await fetchGoals();
        setGoals(goalsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

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
    } catch (error) {
      console.error("Error creating goal:", error);
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

  return (
    <div className="flex h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <DarkModeToggle />
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Budget Goals 🎯</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center gap-2"
          >
            <PlusCircle size={18} />
            Add New Goal
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
                          // Implement edit logic
                          console.log("Edit goal", goal.id);
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
                  
                  {/* Progress display */}
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
                  
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Target:</span>
                      <span className="font-medium">
                        ${progress.target_amount || goal.amount}
                      </span>
                    </div>
                    
                    {progress.current_amount !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Current:</span>
                        <span className={`font-medium ${progress.status === 'on_track' ? 'text-green-600' : 'text-red-500'}`}>
                          ${progress.current_amount}
                        </span>
                      </div>
                    )}
                    
                    {progress.remaining_budget !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                        <span className="font-medium">
                          ${progress.remaining_budget > 0 ? progress.remaining_budget : 0}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Status message */}
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

        {/* Create Goal Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-white/20 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create New Budget Goal</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: parseInt(e.target.value)})}
                    className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Goal Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="fixed">Fixed Amount</option>
                    <option value="percentage">Percentage of Income</option>
                    <option value="relative">Relative to Previous Period</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {formData.type === 'fixed' ? 'Amount ($)' : 
                     formData.type === 'percentage' ? 'Percentage (%)' : 
                     'Change Percentage (%)'}
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                    className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                    placeholder={formData.type === 'fixed' ? "e.g. 500" : "e.g. 10"}
                  />
                </div>
                
                {formData.type === 'relative' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Reference Period</label>
                    <select
                      value={formData.reference_period}
                      onChange={(e) => setFormData({...formData, reference_period: e.target.value})}
                      className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                    >
                      <option value="previous_month">Previous Month</option>
                      <option value="previous_year">Same Month Last Year</option>
                    </select>
                  </div>
                )}
                
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
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGoal}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Create Goal
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}