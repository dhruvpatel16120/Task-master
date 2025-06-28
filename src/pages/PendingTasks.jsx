import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { format, differenceInMinutes } from "date-fns";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";


export default function PendingTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [checkedReminders, setCheckedReminders] = useState([]);
  const [sortBy, setSortBy] = useState("dueDate");           // new
  const [filterCategory, setFilterCategory] = useState("All"); // new
  const [showModal, setShowModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);


  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "tasks"),
      where("uid", "==", user.uid),
      where("completed", "==", false)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTasks(list);
    });

    return () => unsub();
  }, [user]);

  // ✅ Reminder checker
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      tasks.forEach(task => {
        if (
          task.dueDate &&
          !checkedReminders.includes(task.id)
        ) {
          const taskTime = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
          const diff = differenceInMinutes(taskTime, now);

          // 🔔 If due in next 1 minute
          if (diff >= 0 && diff <= 1) {
            toast(`⏰ Task "${task.title}" is due now!`, { icon: '⏰' });
            setCheckedReminders(prev => [...prev, task.id]);
          }
        }
      });
    }, 30000); // check every 30 sec

    return () => clearInterval(interval);
  }, [tasks, checkedReminders]);

  const markAsCompleted = async (id) => {
    try {
      await updateDoc(doc(db, "tasks", id), { completed: true });
      toast.success("✅ Task marked as completed!");
    } catch (err) {
      console.error("Failed to mark as completed:", err);
      toast.error("Something went wrong!");
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteDoc(doc(db, "tasks", id));
      toast.success("🗑 Task deleted!");
    } catch (err) {
      console.error("Failed to delete task:", err);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">

      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-4">
        <h2 className="text-2xl font-bold text-purple-700 mb-2">🕒 Pending Tasks</h2>

        {/* ✅ Sort & Filter */}
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Filter by Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded"
            >
              <option value="All">All</option>
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Study">Study</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* ✅ Tasks */}
        {tasks.length === 0 && (
          <p className="text-gray-600">No pending tasks. 🎉</p>
        )}

        <div className="grid gap-4">
          {tasks
            .filter(task => filterCategory === "All" || task.category === filterCategory)
            .sort((a, b) => {
              if (sortBy === "priority") {
                const priorityOrder = { High: 1, Medium: 2, Low: 3 };
                return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
              } else if (sortBy === "dueDate") {
                const dateA = a.dueDate?.toDate ? a.dueDate.toDate() : new Date(a.dueDate || 0);
                const dateB = b.dueDate?.toDate ? b.dueDate.toDate() : new Date(b.dueDate || 0);
                return dateA - dateB;
              }
              return 0;
            })
            .map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-4 space-y-2 border border-purple-100"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-purple-800">{task.title}</h3>
                    <p className="text-gray-600 text-sm">{task.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => markAsCompleted(task.id)}
                      className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      ✓ Complete
                    </button>
                    <button
                        onClick={() => {
                          setTaskToDelete(task);
                          setShowModal(true);
                        }}
                        className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        🗑 Delete
                      </button>
                    <Link
                      to={`/edit/${task.id}`}
                      className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      ✏ Edit
                    </Link>

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
{showModal && taskToDelete && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">⚠ Confirm Delete</h3>
      <p className="text-sm text-gray-600">
        Are you sure you want to delete <strong>{taskToDelete.title}</strong>?
      </p>
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => setShowModal(false)}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-gray-700 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            try {
              await deleteDoc(doc(db, "tasks", taskToDelete.id));
              toast.success("Task deleted!");
            } catch (err) {
              console.error(err);
              toast.error("Failed to delete task");
            } finally {
              setShowModal(false);
              setTaskToDelete(null);
            }
          }}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
</div>
  );
}
