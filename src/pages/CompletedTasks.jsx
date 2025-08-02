import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function CompletedTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "tasks"),
      where("uid", "==", user.uid),
      where("completed", "==", true)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTasks(list);
    });

    return () => unsub();
  }, [user]);

  const markAsPending = async (id) => {
    try {
      await updateDoc(doc(db, "tasks", id), { completed: false });
      toast.success("Task moved back to pending!");
    } catch (err) {
      console.error("Failed to move back:", err);
      toast.error("Something went wrong!");
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteDoc(doc(db, "tasks", id));
      toast.success("Task deleted!");
    } catch (err) {
      console.error("Failed to delete task:", err);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-700 mb-4">✅ Completed Tasks</h2>

        {tasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No completed tasks yet. ✅</p>
            <p className="text-gray-500 text-sm mt-2">Start completing tasks to see them here!</p>
          </div>
        )}

        <div className="grid gap-4 sm:gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-4 sm:p-6 space-y-4 border border-purple-100"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-purple-800 line-through mb-2">{task.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-3">{task.description}</p>
                  
                  <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-500">
                    {task.dueDate && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        Due: {format(task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate), "dd MMM yyyy, p")}
                      </span>
                    )}
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {task.category}
                    </span>
                    <span className={`px-2 py-1 rounded ${
                      task.priority === 'High' ? 'bg-red-100 text-red-700' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {task.priority}
                    </span>
                    {task.duration && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {task.duration}
                      </span>
                    )}
                    {task.highPriority && (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">
                        🔥 High Priority
                      </span>
                    )}
                  </div>

                  {task.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {task.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 sm:flex-col sm:gap-2">
                  <button
                    onClick={() => markAsPending(task.id)}
                    className="flex-1 sm:flex-none text-xs sm:text-sm px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                  >
                    ↩ Move to Pending
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="flex-1 sm:flex-none text-xs sm:text-sm px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
