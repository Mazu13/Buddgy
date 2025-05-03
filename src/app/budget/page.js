"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import DarkModeToggle from "@/components/DarkModeToggle";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { User } from "lucide-react";
import { Dialog } from "@headlessui/react";
import { API_BASE_URL } from "@/lib/config";
import { fetchBoards } from "@/lib/api";
import useHasMounted from "@/lib/useHasMounted";


// Helper function to save boards to localStorage
const saveBoardsToLocalStorage = (boards) => {
  try {
    localStorage.setItem('budgetBoards', JSON.stringify(boards));
    console.log("💾 Saved boards to localStorage");
  } catch (error) {
    console.error("Failed to save boards to localStorage:", error);
  }
};

// Helper function to load boards from localStorage
const loadBoardsFromLocalStorage = () => {
  try {
    const savedBoards = localStorage.getItem('budgetBoards');
    if (savedBoards) {
      const parsed = JSON.parse(savedBoards);
      console.log("📂 Loaded boards from localStorage:", parsed);
      return parsed;
    }
  } catch (error) {
    console.error("Failed to load boards from localStorage:", error);
  }
  return [];
};

export default function BudgetPage() {
  
  const hasMounted = useHasMounted();

  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  
  // Initialize boards from localStorage for instant loading
  const [boards, setBoards] = useState(() => loadBoardsFromLocalStorage());
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [members, setMembers] = useState([]);
  const [showBoardModal, setShowBoardModal] = useState(false);

  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [entryData, setEntryData] = useState({ type: "+", name: "", amount: "" });

  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editedBoardTitle, setEditedBoardTitle] = useState("");

  const [editingEntry, setEditingEntry] = useState(null);
  const [editedEntry, setEditedEntry] = useState({ name: "", amount: "", type: "+" });
  const [budgetInsights, setBudgetInsights] = useState(null);

  
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
  
  
  const loadBoards = async () => {
    try {
      const data = await fetchBoards();
  
      const dataWithCategoryNames = data.map((board) => ({
        ...board,
        category_name:
          board.category_name ||
          categories.find((c) => c.id === board.category_id)?.name ||
          null,
      }));
  
      setBoards(dataWithCategoryNames);
      localStorage.setItem("budgetBoards", JSON.stringify(dataWithCategoryNames));
    } catch (err) {
      console.error("Error using shared fetchBoards:", err);
    } finally {
      setIsLoading(false);
    }
  };
  // Sayfa ilk açıldığında backend'den board'ları çeker
useEffect(() => {
  loadBoards(); 
}, []);


  useEffect(() => {
    if (categories.length > 0) {
      loadBoards(); 
    }
  }, [categories]);
  
  // Save boards to localStorage whenever they change
  useEffect(() => {
    if (boards.length > 0) {
      saveBoardsToLocalStorage(boards);
    }
  }, [boards]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
  
    return () => {
      console.log("🛑 BudgetPage component unmounting");
    };
  }, [router]);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("📦 Token gönderilen:", token); 
    if (!token) {
      setIsLoading(false); // token yoksa da loading'den çık
      return;
    }
  
    fetch(`${API_BASE_URL}/categories/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("Fetched categories:", data);
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategoryId(data[0].id.toString());
        }
      })
      .catch(err => {
        console.error("❌ Failed to fetch categories:", err);
      })
      .finally(() => {
        setIsLoading(false); // 💯 garanti: ne olursa olsun loading bitsin
      });
  }, []);
  
  // Debug: Log boards state changes
  useEffect(() => {
    console.log("🏷️ Boards state updated:", boards);
  }, [boards]);
  
  const handleAddBoard = async () => {
    const token = localStorage.getItem("token");
    if (!newBoardTitle.trim() || !selectedCategoryId) return;
  
    try {
      const res = await fetch(`${API_BASE_URL}/boards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newBoardTitle,
          category_id: parseInt(selectedCategoryId),
        }),
      });
  
      if (!res.ok) {
        const errText = await res.text();
        throw new Error("Board creation failed: " + errText);
      }
  
      const newBoard = await res.json();
      const updatedBoards = [...boards, newBoard];
      setBoards(updatedBoards);
      saveBoardsToLocalStorage(updatedBoards);
  
      setNewBoardTitle("");
      setShowBoardModal(false);
    } catch (err) {
      console.error("Board add error:", err);
    }
  };
  
  const handleDragEnd = async (result) => {
    const { source, destination, type } = result;
    if (!destination) return;
  
    // Board'lar sıralanıyorsa
    if (type === "BOARD") {
      const newBoards = Array.from(boards);
      const [movedBoard] = newBoards.splice(source.index, 1);
      newBoards.splice(destination.index, 0, movedBoard);
      
      // Update UI and localStorage immediately
      setBoards(newBoards);
      saveBoardsToLocalStorage(newBoards);
      
      // Backend'e ID'leri int olarak gönder
      try {
        const boardOrder = newBoards.map(board => parseInt(board.id));
        const token = localStorage.getItem("token");
        
        fetch(`${API_BASE_URL}/boards/reorder`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ board_order: boardOrder }),
        }).catch(error => {
          console.error("Board reorder API error:", error);
        });
      } catch (error) {
        console.error("Board reorder error:", error);
      }
      
      return;
    }
  
    // Entry'ler sıralanıyorsa veya başka board'a aktarılıyorsa
    const sourceBoardIndex = boards.findIndex((b) => b.id.toString() === source.droppableId);
    const destBoardIndex = boards.findIndex((b) => b.id.toString() === destination.droppableId);

    // Handle case where board isn't found
    if (sourceBoardIndex === -1 || destBoardIndex === -1) {
      console.error("Source or destination board not found", { source, destination });
      return;
    }
  
    const sourceBoard = boards[sourceBoardIndex];
    const destBoard = boards[destBoardIndex];
    
    // Handle case where source entry isn't found
    if (!sourceBoard.entries || !sourceBoard.entries[source.index]) {
      console.error("Source entry not found", { sourceBoard, sourceIndex: source.index });
      return;
    }
    
    const movedEntry = sourceBoard.entries[source.index];
    let newBoards;
  
    // Aynı board içinde yer değişiyorsa
    if (sourceBoard === destBoard) {
      const newEntries = Array.from(sourceBoard.entries);
      newEntries.splice(source.index, 1);
      newEntries.splice(destination.index, 0, movedEntry);
      const newBoard = { ...sourceBoard, entries: newEntries };
      newBoards = Array.from(boards);
      newBoards[sourceBoardIndex] = newBoard;
      
      // Update UI and localStorage immediately
      setBoards(newBoards);
      saveBoardsToLocalStorage(newBoards);
      
      // Same board reordering - backend sync optional
    } else {
      // Başka board'a aktarılıyorsa
      const sourceEntries = Array.from(sourceBoard.entries);
      const destEntries = Array.from(destBoard.entries || []);
      sourceEntries.splice(source.index, 1);

      // 🧠 board_id'yi güncelledik:
      const updatedEntry = { ...movedEntry, board_id: destBoard.id };
      destEntries.splice(destination.index, 0, updatedEntry);
      
      // Backend'e entry'nin board_id güncellemesini gönder
      try {
        const token = localStorage.getItem("token");
        await fetch(`${API_BASE_URL}/entries/${movedEntry.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: movedEntry.name,
            amount: movedEntry.amount,
            type: movedEntry.type,
            board_id: destBoard.id,  // 👈 yeni board ID
          }),
        });
      } catch (error) {
        console.error("Entry board update error:", error);
      }

      newBoards = Array.from(boards);
      newBoards[sourceBoardIndex] = { ...sourceBoard, entries: sourceEntries };
      newBoards[destBoardIndex] = { ...destBoard, entries: destEntries };
      
      // Update UI and localStorage immediately
      setBoards(newBoards);
      saveBoardsToLocalStorage(newBoards);
      
      // Backend'e entry taşıma bilgisini ve sıralamayı gönder
      try {
        const token = localStorage.getItem("token");
        await fetch(`${API_BASE_URL}/entries/reorder`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            entry_id: movedEntry.id,
            source_board_id: parseInt(sourceBoard.id),
            destination_board_id: parseInt(destBoard.id),
            entries: newBoards[destBoardIndex].entries.map((entry, index) => ({
              id: entry.id,
              position: index,
            })),
          }),
        });
      } catch (error) {
        console.error("Entry reorder API error:", error);
      }
    }
  };

  // Improved version with localStorage sync
  const handleDeleteBoard = async (boardId) => {
    const token = localStorage.getItem("token");
    
    // First update UI immediately for responsiveness
    const updatedBoards = boards.filter((board) => board.id !== boardId);
    setBoards(updatedBoards);
    saveBoardsToLocalStorage(updatedBoards);
    
    try {
      const res = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!res.ok) {
        console.error("Board deletion failed on server");
        // We don't need to revert UI state - the board will disappear
        // until next reload, but that's ok for UX in most cases
      } else {
        console.log("Board deleted successfully on server");
      }
    } catch (err) {
      console.error("Delete board error:", err);
      // Could add a toast notification here to inform the user of the error
    }
  };

  // Yeni versiyon - Backend senkronizasyonu ile
  const handleSaveBoardTitle = async (boardId) => {
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editedBoardTitle }),
      });

      if (!res.ok) throw new Error("Board update failed");
      
      // UI güncelleme
      setBoards((prevBoards) =>
        prevBoards.map((board) =>
          board.id === boardId ? { ...board, title: editedBoardTitle } : board
        )
      );
    } catch (err) {
      console.error("Update board error:", err);
    }
    
    setEditingBoardId(null);
    setEditedBoardTitle("");
  };

  const handleDeleteEntry = async (boardId, entryIndex) => {
    const token = localStorage.getItem("token");
    const entryToDelete = boards.find(b => b.id === boardId).entries[entryIndex];

    try {
      const res = await fetch(`${API_BASE_URL}/entries/${entryToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Entry deletion failed");

      setBoards(prevBoards =>
        prevBoards.map(board =>
          board.id === boardId
            ? {
                ...board,
                entries: board.entries.filter((_, i) => i !== entryIndex),
              }
            : board
        )
      );
    } catch (err) {
      console.error("Delete entry error:", err);
    }
  };

  const handleSaveEntry = async (boardId, entryIndex) => {
    const token = localStorage.getItem("token");
    const entryToUpdate = boards.find(b => b.id === boardId).entries[entryIndex];
  
    try {
      const res = await fetch(`${API_BASE_URL}/entries/${entryToUpdate.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editedEntry.name,
          amount: parseFloat(editedEntry.amount),
          type: editedEntry.type,
          board_id: boardId
        }),
      });
  
      if (!res.ok) throw new Error("Entry update failed");
  
      const updated = await res.json();
  
      setBoards(prevBoards =>
        prevBoards.map(board =>
          board.id === boardId
            ? {
                ...board,
                entries: board.entries.map((entry, i) =>
                  i === entryIndex ? updated : entry
                )
              }
            : board
        )
      );
    } catch (err) {
      console.error("Update entry error:", err);
    }
  
    setEditingEntry(null);
    setEditedEntry({ name: "", amount: "", type: "+" });
  };
  
  const handleAddEntry = async () => {
    const token = localStorage.getItem("token");
    const { type, name, amount } = entryData;
if (!name || !amount || !selectedBoardId ) return;
  
    const newEntry = {
      board_id: selectedBoardId,
      type,
      name,
      amount: parseFloat(amount),
      category_id: boards.find(b => b.id === selectedBoardId)?.category_id
    };
  
    try {
      // Create a temporary entry for immediate UI feedback
      const tempEntry = {
        id: "temp-" + Date.now(), // Temporary ID
        type,
        name,
        amount: parseFloat(amount)
      };
      
      // Update UI first for better user experience
      const updatedBoards = boards.map((board) =>
        board.id === selectedBoardId
          ? { ...board, entries: [...(board.entries || []), tempEntry] }
          : board
      );
      setBoards(updatedBoards);
      saveBoardsToLocalStorage(updatedBoards);
      
      // Now send to server
      const res = await fetch(`${API_BASE_URL}/entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEntry),
      });
  
      if (!res.ok) {
        throw new Error("Entry creation failed");
      }
      
      // Capture response text first
      const responseText = await res.text();
      
      try {
        // Attempt to parse JSON
        const saved = {
          ...JSON.parse(responseText),
          board_id: selectedBoardId
        };
        
        // Replace the temporary entry with the real one from the server
        setBoards((prevBoards) =>
          prevBoards.map((board) =>
            board.id === selectedBoardId
              ? { 
                  ...board, 
                  entries: board.entries.map(entry => 
                    entry.id === tempEntry.id ? saved : entry
                  ) 
                }
              : board
          )
        );
      } catch (parseError) {
        console.error("Failed to parse entry response:", parseError, responseText);
        
        // If we can't parse the response, refresh all boards
        loadBoards();
      }
    } catch (err) {
      console.error("Add entry error:", err);
      
      // Remove the temporary entry on error
      setBoards((prevBoards) =>
        prevBoards.map((board) =>
          board.id === selectedBoardId
            ? { 
                ...board, 
                entries: board.entries.filter(entry => !entry.id.toString().startsWith("temp-"))
              }
            : board
        )
      );
    }
  
    setEntryData({ type: "+", name: "", amount: "" });
    setSelectedBoardId(null);
    setShowEntryModal(false);
    try {
      const res = await fetch(`${API_BASE_URL}/ai/recommendations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      console.log("✅ Budget insights refreshed:", data.budget_insights);
      setBudgetInsights(data.budget_insights);
    } catch (err) {
      console.error("❌ Failed to refresh insights:", err);
    }
    
  };
  
  if (!hasMounted || isLoading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

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
                Budget Tracking 💼
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Create boards and track your entries.
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                router.push("/login");
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Log out
            </button>
          </div>

          <div className="mb-6">
            <button
              onClick={() => setShowBoardModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              + Add Board
            </button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable 
              droppableId="boards" 
              direction="horizontal" 
              type="BOARD"
            >
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-wrap gap-4 p-4"
                >
                  {boards.map((board, index) => (
                    board?.id && (
                      <Draggable 
                        key={board.id.toString()} 
                        draggableId={board.id.toString()} 
                        index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white dark:bg-white/10 rounded-xl shadow-md p-4 min-w-[300px] border border-gray-200 dark:border-white/10"
                          >
                            <div className="cursor-move">
                              {editingBoardId === board.id ? (
                                <div className="flex items-center gap-2 mb-2">
                                  <input
                                    type="text"
                                    value={editedBoardTitle}
                                    onChange={(e) => setEditedBoardTitle(e.target.value)}
                                    className="px-2 py-1 border rounded-md text-sm dark:bg-black dark:border-gray-600"
                                  />
                                  <button
                                    onClick={() => handleSaveBoardTitle(board.id)}
                                    className="text-sm text-blue-500 hover:underline"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingBoardId(null);
                                      setEditedBoardTitle("");
                                    }}
                                    className="text-sm text-gray-400 hover:underline"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-between items-center mb-2">
                                  <h2 className="font-semibold text-lg">
  {board.category_name || board.title}
</h2>
                                  {(board.category_name || board.category_id) && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {board.category_name || categories.find(c => c.id === board.category_id)?.name || "Unknown category"}
                                    </p>
                                  )}

                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingBoardId(board.id);
                                        setEditedBoardTitle(board.title);
                                      }}
                                      className="text-xs text-blue-500 hover:underline"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteBoard(board.id)}
                                      className="text-xs text-red-500 hover:underline"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                setSelectedBoardId(board.id);
                                setShowEntryModal(true);
                              }}
                              className="bg-green-500 text-white w-full py-1 rounded-md hover:bg-green-600 text-sm mb-2"
                            >
                              + Add Entry
                            </button>

                            <Droppable droppableId={board.id.toString()} type="ENTRY">
                              {(dropProvided) => (
                                <ul
                                  ref={dropProvided.innerRef}
                                  {...dropProvided.droppableProps}
                                  className="space-y-1 text-sm min-h-[50px] p-1 bg-gray-50 dark:bg-gray-900 rounded-md"
                                >
                                  {board.entries && board.entries.map((entry, idx) => (
                                    <Draggable
                                      key={`entry-${entry.id}`}
                                      draggableId={`entry-${entry.id}`}
                                      index={idx}
                                    >
                                      {(dragProvided) =>
                                        editingEntry?.boardId === board.id && editingEntry?.entryIndex === idx ? (
                                          <li className="flex flex-col gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                                            {/* + / - Button Row */}
                                            <div className="flex gap-2 mb-2">
                                              <button
                                                className={`px-2 py-1 rounded-md text-sm border ${editedEntry.type === "+" ? "bg-green-500 text-white" : "bg-transparent border-gray-300"}`}
                                                onClick={() => setEditedEntry({ ...editedEntry, type: "+" })}
                                              >
                                                + Income
                                              </button>
                                              <button
                                                className={`px-2 py-1 rounded-md text-sm border ${editedEntry.type === "-" ? "bg-red-500 text-white" : "bg-transparent border-gray-300"}`}
                                                onClick={() => setEditedEntry({ ...editedEntry, type: "-" })}
                                              >
                                                - Expense
                                              </button>
                                            </div>
                                            <input
                                              type="text"
                                              value={editedEntry.name}
                                              onChange={(e) =>
                                                setEditedEntry({ ...editedEntry, name: e.target.value })
                                              }
                                              className="px-2 py-1 border rounded-md text-sm dark:bg-black dark:border-gray-600"
                                            />
                                            <input
                                              type="number"
                                              value={editedEntry.amount}
                                              onChange={(e) =>
                                                setEditedEntry({ ...editedEntry, amount: e.target.value })
                                              }
                                              className="px-2 py-1 border rounded-md text-sm dark:bg-black dark:border-gray-600"
                                            />
                                            <div className="flex justify-end gap-2 text-xs">
                                              <button
                                                onClick={() => handleSaveEntry(board.id, idx)}
                                                className="text-blue-500 hover:underline"
                                              >
                                                Save
                                              </button>
                                              <button
                                                onClick={() => {
                                                  setEditingEntry(null);
                                                  setEditedEntry({ name: "", amount: "", type: "+" });
                                                }}
                                                className="text-gray-400 hover:underline"
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          </li>
                                        ) : (
                                          <li
                                            ref={dragProvided.innerRef}
                                            {...dragProvided.draggableProps}
                                            {...dragProvided.dragHandleProps}
                                            className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded-md"
                                          >
                                            <div>
                                              <span className={`font-medium ${entry.type === "+" ? "text-green-600" : "text-red-500"}`}>
                                                {entry.type === "+" ? "💰" : "💸"} {entry.name}
                                              </span>
                                              <span className="ml-2 text-xs text-gray-400">${entry.amount}</span>
                                            </div>
                                            <div className="flex gap-2 text-xs">
                                              <button
                                                onClick={() => {
                                                  setEditingEntry({ boardId: board.id, entryIndex: idx });
                                                  setEditedEntry({ 
                                                    name: entry.name, 
                                                    amount: entry.amount, 
                                                    type: entry.type 
                                                  });
                                                }}
                                                className="text-blue-500 hover:underline"
                                              >
                                                Edit
                                              </button>
                                              <button
                                                onClick={() => handleDeleteEntry(board.id, idx)}
                                                className="text-red-500 hover:underline"
                                              >
                                                Delete
                                              </button>
                                            </div>
                                          </li>
                                        )
                                      }
                                    </Draggable>
                                  ))}
                                  {dropProvided.placeholder}
                                </ul>
                              )}
                            </Droppable>
                          </div>
                        )}
                      </Draggable>
                    )
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
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

        <Dialog open={showBoardModal} onClose={() => setShowBoardModal(false)} className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
          <div className="bg-white dark:bg-black p-6 rounded-lg z-10 w-[90%] max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Add Board</h2>
            <input
              type="text"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              placeholder="Board title"
              className="w-full px-3 py-2 mb-4 border rounded-md dark:bg-black dark:border-gray-700"
            />
            <div className="mb-4">
  <label className="block text-sm mb-1">Category</label>
  <select
  value={selectedCategoryId}
  onChange={(e) => setSelectedCategoryId(e.target.value)}
  className="w-full px-3 py-2 border rounded-md dark:bg-black dark:border-gray-700"
>
  {Array.isArray(categories) &&
    categories.map((cat) => (
      <option key={cat.id} value={cat.id.toString()}>
        {cat.name}
      </option>
  ))}
</select>

</div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowBoardModal(false)}
                className="text-sm text-gray-500 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBoard}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </Dialog>
     
        <Dialog open={showEntryModal} onClose={() => setShowEntryModal(false)} className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
          <div className="bg-white dark:bg-black p-6 rounded-lg z-10 w-[90%] max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Add Entry</h2>

            <div className="mb-4">
              <label className="text-sm font-medium">Type</label>
              <div className="flex gap-2 mt-1">
                <button
                  className={`px-3 py-1 rounded-md text-sm border ${entryData.type === "+" ? "bg-green-500 text-white" : "bg-transparent border-gray-300"}`}
                  onClick={() => setEntryData({ ...entryData, type: "+" })}
                >
                  + Income
                </button>
                <button
                  className={`px-3 py-1 rounded-md text-sm border ${entryData.type === "-" ? "bg-red-500 text-white" : "bg-transparent border-gray-300"}`}
                  onClick={() => setEntryData({ ...entryData, type: "-" })}
                >
                  - Expense
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm mb-1">Name</label>
              <input
                type="text"
                value={entryData.name}
                onChange={(e) => setEntryData({ ...entryData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md dark:bg-black dark:border-gray-700"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Amount</label>
              <input
                type="number"
                value={entryData.amount}
                onChange={(e) => setEntryData({ ...entryData, amount: e.target.value })}
                className="w-full px-3 py-2 border rounded-md dark:bg-black dark:border-gray-700"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEntryModal(false)}
                className="text-sm text-gray-500 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEntry}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
}
