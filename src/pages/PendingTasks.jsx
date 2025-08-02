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
      await updateDoc(doc(db, "tasks", id), { completed: true, uid: user.uid });
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-700 mb-4">🕒 Pending Tasks</h2>

        {/* ✅ Sort & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
            >
              <option value="All">All Categories</option>
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Study">Study</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* ✅ Tasks */}
        {tasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No pending tasks. 🎉</p>
            <p className="text-gray-500 text-sm mt-2">Great job staying on top of your tasks!</p>
          </div>
        )}

        <div className="grid gap-4 sm:gap-6">
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
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-4 sm:p-6 space-y-4 border border-purple-100"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-purple-800 mb-2">{task.title}</h3>
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
                      onClick={() => markAsCompleted(task.id)}
                      className="flex-1 sm:flex-none text-xs sm:text-sm px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      ✓ Complete
                    </button>
                    <Link
                      to={`/edit/${task.id}`}
                      className="flex-1 sm:flex-none text-xs sm:text-sm px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                    >
                      ✏ Edit
                    </Link>
                    <button
                      onClick={() => {
                        setTaskToDelete(task);
                        setShowModal(true);
                      }}
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

      {/* Delete Confirmation Modal */}
      {showModal && taskToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">⚠ Confirm Delete</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>{taskToDelete.title}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 text-sm font-medium transition-colors"
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
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
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
