// lib/api.js - Kategori verilerini yönetmek için API fonksiyonları

import { API_BASE_URL } from "@/lib/config";

// Bütün panoları getir
export const fetchBoards = async () => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("Authentication token not found");
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/boards`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Boards fetched successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to fetch boards:", error);
    throw error;
  }
};

// Kategorileri getir
export const fetchCategories = async () => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("Authentication token not found");
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/categories/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Categories fetched successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
};

// Yeni bir pano oluştur
export const createBoard = async (boardData) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("Authentication token not found");
  }
  
  try {
    // category_id'yi sayıya dönüştür
    const payload = {
      ...boardData,
      category_id: parseInt(boardData.category_id)
    };
    
    console.log("Creating board with data:", payload);
    
    const response = await fetch(`${API_BASE_URL}/boards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Board creation failed: ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Board created successfully:", data);
    return data;
  } catch (error) {
    console.error("Error creating board:", error);
    throw error;
  }
};

// Yeni bir işlem (entry) oluştur
export const createEntry = async (entryData) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("Authentication token not found");
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(entryData),
    });
    
    if (!response.ok) {
      throw new Error("Entry creation failed");
    }
    
    const data = await response.json();
    console.log("Entry created successfully:", data);
    return data;
  } catch (error) {
    console.error("Error creating entry:", error);
    throw error;
  }
};

// Hedefleri getir
export const fetchGoals = async () => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("Authentication token not found");
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/goals/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Goals fetched successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to fetch goals:", error);
    throw error;
  }
};

// Yeni bir hedef oluştur
export const createGoal = async (goalData) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("Authentication token not found");
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/goals/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(goalData),
    });
    
    if (!response.ok) {
      throw new Error("Goal creation failed");
    }
    
    const data = await response.json();
    console.log("Goal created successfully:", data);
    return data;
  } catch (error) {
    console.error("Error creating goal:", error);
    throw error;
  }
};

// AI önerilerini getir
export const fetchRecommendations = async () => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("Authentication token not found");
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/ai/recommendations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    console.log("AI recommendations fetched successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to fetch AI recommendations:", error);
    throw error;
  }
};