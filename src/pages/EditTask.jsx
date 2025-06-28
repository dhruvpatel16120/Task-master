import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

export default function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // all fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("Personal");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");
  const [duration, setDuration] = useState("");
  const [highPriority, setHighPriority] = useState(false);


  useEffect(() => {
    const fetchTask = async () => {
      try {
        const ref = doc(db, "tasks", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setTitle(data.title || "");
          setDescription(data.description || "");
          setPriority(data.priority || "Medium");
          setCategory(data.category || "Personal");
          setDueDate(data.dueDate?.toDate ? data.dueDate.toDate().toISOString().slice(0,16) : "");
          setTags((data.tags || []).join(", "));
          setDuration(data.duration || "");
          setHighPriority(data.highPriority || false);
        } else {
          toast.error("Task not found");
          navigate("/pending");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to load task");
      } finally {
        setFetching(false);
      }
    };
    fetchTask();
  }, [id, navigate]);

  const handleUpdate = async () => {
    if (!title.trim()) return toast.error("Title is required");
    setLoading(true);
    try {
      const ref = doc(db, "tasks", id);
      await updateDoc(ref, {
        title,
        description,
        priority,
        category,
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        duration,
        highPriority,
        updatedAt: serverTimestamp()
      });
      toast.success("✅ Task updated!");
      navigate("/pending");
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">

      <div className="max-w-xl mx-auto mt-10 bg-white rounded-xl shadow-md p-6 space-y-4">
        <h2 className="text-2xl font-bold text-purple-700 text-center flex items-center justify-center gap-2">
          ✏ Edit Task
        </h2>

        {fetching ? (
          <p className="text-center text-gray-500">Loading task details...</p>
        ) : (
          <>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>

            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option>Personal</option>
                  <option>Work</option>
                  <option>Study</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Due Date & Time</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Tags (comma separated)</label>
              <input
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="e.g., urgent, frontend"
                className="w-full px-3 py-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Estimated Duration</label>
                <input
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  placeholder="e.g., 2h, 30min"
                  className="w-full px-3 py-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  checked={highPriority}
                  onChange={() => setHighPriority(!highPriority)}
                  className="mr-2 accent-purple-600"
                />
                <span className="text-gray-700 text-sm">High priority</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                disabled={loading}
                className={`flex-1 bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition ${
                  loading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Updating..." : "Update Task"}
              </button>
              
              <button
                onClick={() => navigate(-1)}
                className="flex-1 border border-purple-600 text-purple-700 py-2 rounded hover:bg-purple-50 transition"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
