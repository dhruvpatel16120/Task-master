import { useState } from "react";
import { db } from "../services/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { validateTaskData, sanitizeTaskData } from "../utils/security";
import { handleDatabaseError } from "../utils/errorHandler";

export default function AddTask() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("Personal");
  const [priority, setPriority] = useState("Medium");
  const [tags, setTags] = useState("");
  const [duration, setDuration] = useState("");
  const [highPriority, setHighPriority] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    // Validate task data
    const taskData = {
      title,
      description,
      category,
      priority,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      duration,
      highPriority,
      dueDate: dueDate ? new Date(dueDate) : null
    };

    const validation = validateTaskData(taskData);
    if (!validation.isValid) {
      toast.error(validation.errors.join(', '));
      return;
    }

    setLoading(true);

    try {
      // Sanitize task data before saving
      const sanitizedData = sanitizeTaskData(taskData);
      
      console.log("Adding task with data:", {
        uid: user.uid,
        username: user.displayName || "Anonymous",
        userEmail: user.email || "No email",
        ...sanitizedData,
        completed: false,
        createdAt: serverTimestamp()
      });

      await addDoc(collection(db, "tasks"), {
        uid: user.uid,
        username: user.displayName || "Anonymous",
        userEmail: user.email || "No email",
        ...sanitizedData,
        completed: false,
        createdAt: serverTimestamp()
      });

      // Clear form
      setTitle(""); setDescription(""); setDueDate("");
      setCategory("Personal"); setPriority("Medium");
      setTags(""); setDuration(""); setHighPriority(false);

      toast.success("✅ Task added successfully!");
    } catch (err) {
      const errorMessage = handleDatabaseError(err, 'add_task');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="flex justify-center items-start mt-10 px-4">
        <div className="bg-gradient-to-br from-white via-purple-50 to-white shadow-xl rounded-xl w-full max-w-xl p-6 space-y-4">
          <h2 className="text-2xl font-bold text-purple-700 text-center mb-2">Add New Task</h2>

          {/* Title */}
          <div>
            <label className="block text-gray-700 text-sm mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className="w-full px-4 py-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 text-sm mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              placeholder="Add details..."
              className="w-full px-4 py-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            ></textarea>
          </div>

          {/* Category & Priority */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-gray-700 text-sm mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option>Personal</option>
                <option>Work</option>
                <option>Study</option>
                <option>Other</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-gray-700 text-sm mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-gray-700 text-sm mb-1">Tags (comma separated)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., urgent, frontend"
              className="w-full px-4 py-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Duration & High Priority */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-gray-700 text-sm mb-1">Estimated Duration</label>
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
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

          {/* Due Date */}
          <div>
            <label className="block text-gray-700 text-sm mb-1">Due Date & Time</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Button */}
          <button
            onClick={handleAdd}
            disabled={loading}
            className={`w-full bg-purple-600 text-white py-2 rounded-md text-lg font-semibold hover:bg-purple-700 transition ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Adding..." : "Add Task"}
          </button>

          {/* Live Preview */}
          <div className="mt-4 border-t pt-4">
            <h3 className="text-purple-700 font-semibold mb-2">Live Preview</h3>
            <div className="bg-purple-50 border border-purple-200 rounded p-3 space-y-1">
              <div className="font-medium">{title || "Task title..."}</div>
              <div className="text-gray-600 text-sm">{description || "Task description..."}</div>
              <div className="flex text-xs text-gray-500 space-x-2">
                <span>Category: {category}</span>
                <span>Priority: {priority}</span>
                {dueDate && <span>Due: {new Date(dueDate).toLocaleString()}</span>}
                {duration && <span>Duration: {duration}</span>}
                {highPriority && <span className="text-red-500 font-semibold">🔥 High Priority</span>}
              </div>
              {tags && (
                <div className="text-xs text-gray-600">Tags: {tags}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
