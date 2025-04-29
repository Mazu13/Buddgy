// Yeni handleDragEnd fonksiyonu ve her board icin icerideki entry'lere Draggable + Droppable uygulanmis
// Tum dosya icerigi guncellenmistir

"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import DarkModeToggle from "@/components/DarkModeToggle";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { User } from "lucide-react";
import { Dialog } from "@headlessui/react";


export default function BudgetPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [boards, setBoards] = useState([]);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [members] = useState([{ name: "Ayşenur Mazıbaş" }]);
  const [showBoardModal, setShowBoardModal] = useState(false);

  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [entryData, setEntryData] = useState({ type: "+", name: "", amount: "" });

  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editedBoardTitle, setEditedBoardTitle] = useState("");

  const [editingEntry, setEditingEntry] = useState(null);
  const [editedEntry, setEditedEntry] = useState({ name: "", amount: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, []);
  

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
  
    const fetchBoards = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/boards`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!res.ok) throw new Error("Failed to fetch boards");
        const data = await res.json();
        setBoards(data); // backend'deki board formatına göre gerekirse uyarlarsın
      } catch (err) {
        console.error("Error loading boards:", err);
      }
    };
  
    fetchBoards();
  }, []);
  

  useEffect(() => {
    localStorage.setItem("buddgy-boards", JSON.stringify(boards));
  }, [boards]);

  const handleAddBoard = () => {
    if (newBoardTitle.trim() === "") return;
    const newBoard = {
      id: Date.now().toString(),
      title: newBoardTitle,
      entries: [],
    };
    setBoards([...boards, newBoard]);
    setNewBoardTitle("");
    setShowBoardModal(false);
  };

  const handleDragEnd = (result) => {
    const { source, destination, draggableId, type } = result;
    if (!destination) return;

    // Board'lar sıralanıyorsa
    if (type === "BOARD") {
      const newBoards = Array.from(boards);
      const [movedBoard] = newBoards.splice(source.index, 1);
      newBoards.splice(destination.index, 0, movedBoard);
      setBoards(newBoards);
      return;
    }

    // Entry'ler sıralanıyorsa veya başka board'a aktarılıyorsa
    const sourceBoardIndex = boards.findIndex((b) => b.id === source.droppableId);
    const destBoardIndex = boards.findIndex((b) => b.id === destination.droppableId);

    const sourceBoard = boards[sourceBoardIndex];
    const destBoard = boards[destBoardIndex];
    const movedEntry = sourceBoard.entries[source.index];

    // Aynı board içinde yer değişiyorsa
    if (sourceBoard === destBoard) {
      const newEntries = Array.from(sourceBoard.entries);
      newEntries.splice(source.index, 1);
      newEntries.splice(destination.index, 0, movedEntry);
      const newBoard = { ...sourceBoard, entries: newEntries };
      const newBoards = Array.from(boards);
      newBoards[sourceBoardIndex] = newBoard;
      setBoards(newBoards);
    } else {
      // Başka board'a aktarılıyorsa
      const sourceEntries = Array.from(sourceBoard.entries);
      const destEntries = Array.from(destBoard.entries);
      sourceEntries.splice(source.index, 1);
      destEntries.splice(destination.index, 0, movedEntry);

      const newBoards = Array.from(boards);
      newBoards[sourceBoardIndex] = { ...sourceBoard, entries: sourceEntries };
      newBoards[destBoardIndex] = { ...destBoard, entries: destEntries };
      setBoards(newBoards);
    }
  };

  const handleDeleteBoard = (boardId) => {
    setBoards(boards.filter((board) => board.id !== boardId));
  };

  const handleSaveBoardTitle = (boardId) => {
    setBoards((prevBoards) =>
      prevBoards.map((board) =>
        board.id === boardId ? { ...board, title: editedBoardTitle } : board
      )
    );
    setEditingBoardId(null);
    setEditedBoardTitle("");
  };

  const handleDeleteEntry = (boardId, entryIndex) => {
    setBoards((prevBoards) =>
      prevBoards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              entries: board.entries.filter((_, i) => i !== entryIndex),
            }
          : board
      )
    );
  };

  const handleSaveEntry = (boardId, entryIndex) => {
    setBoards((prevBoards) =>
      prevBoards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              entries: board.entries.map((entry, i) =>
                i === entryIndex
                  ? {
                      ...entry,
                      type: editedEntry.type,
                      name: editedEntry.name,
                      amount: parseFloat(editedEntry.amount),

                    }
                  : entry
              ),
            }
          : board
      )
    );
    setEditingEntry(null);
    setEditedEntry({ name: "", amount: "" });
  };

  const handleAddEntry = async () => {
    const token = localStorage.getItem("token");
    const { type, name, amount } = entryData;
    if (!name || !amount || !selectedBoardId) return;
  
    const newEntry = {
      board_id: selectedBoardId,
      type,
      name,
      amount: parseFloat(amount),
    };
  
    try {
      const res = await fetch(`${API_BASE_URL}/entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEntry),
      });
  
      if (!res.ok) throw new Error("Entry creation failed");
      const saved = await res.json();
  
      setBoards((prevBoards) =>
        prevBoards.map((board) =>
          board.id === selectedBoardId
            ? { ...board, entries: [...board.entries, saved] }
            : board
        )
      );
    } catch (err) {
      console.error("Add entry error:", err);
    }
  
    setEntryData({ type: "+", name: "", amount: "" });
    setSelectedBoardId(null);
    setShowEntryModal(false);
  };
  
  

  if (status === "loading") return <div className="text-center mt-20">Loading...</div>;

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
                Budget Tracking, {session?.user?.name?.split(" ")[0]} 💼
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Create boards and track your entries.
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
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
            <Droppable droppableId="boards" direction="horizontal" type="BOARD">
              {(provided) => (
                <div
                ref={provided.innerRef} {...provided.droppableProps} {...provided.dragHandleProps}
                className="flex gap-4 overflow-x-auto"
                >
                  {boards.map((board, index) => (
                    <Draggable key={board.id} draggableId={board.id.toString()} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                          className="bg-white dark:bg-white/10 rounded-xl shadow-md p-4 min-w-[300px] border border-gray-200 dark:border-white/10"
                        >
                          <div {...provided.dragHandleProps} className="cursor-move">
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
                                <h2 className="font-semibold text-lg">{board.title}</h2>
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

                          <Droppable droppableId={board.id.toString()} type="ENTRY" isDropDisabled={false}>
                            {(dropProvided) => (
                              <ul
                                ref={dropProvided.innerRef}
                                {...dropProvided.droppableProps}
                                className="space-y-1 text-sm min-h-[50px] p-1 bg-gray-50 dark:bg-gray-900 rounded-md"
                              >
                                {board.entries.map((entry, idx) => (
  <Draggable
    key={`${board.id}-${idx}`}
    draggableId={`${board.id}-${idx}`}
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
                setEditedEntry({ name: "", amount: "" });
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
                setEditedEntry({ name: entry.name, amount: entry.amount, type: entry.type });

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
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
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
