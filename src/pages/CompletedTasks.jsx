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

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">Completed Tasks</h2>

        {tasks.length === 0 && (
          <p className="text-gray-600">No completed tasks yet. ✅</p>
        )}

        <div className="grid gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition p-4 space-y-2 border border-purple-100"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-purple-800 line-through">{task.title}</h3>
                  <p className="text-gray-600 text-sm">{task.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => markAsPending(task.id)}
                    className="text-xs px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    ↩ Pending
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap text-xs text-gray-500 space-x-2">
                {task.dueDate && (
                  <span>
                    Due: {format(task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate), "dd MMM yyyy, p")}
                  </span>
                )}
                <span>Category: {task.category}</span>
                <span>Priority: {task.priority}</span>
                {task.duration && <span>Duration: {task.duration}</span>}
                {task.highPriority && (
                  <span className="text-red-500 font-semibold">🔥 High</span>
                )}
              </div>

              {task.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
