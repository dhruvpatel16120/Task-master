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
      <div className="flex justify-center items-start py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-white via-purple-50 to-white shadow-xl rounded-xl w-full max-w-2xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-700 text-center mb-4 sm:mb-6">Add New Task</h2>

          {/* Title */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              placeholder="Add details..."
              className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
            ></textarea>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              >
                <option>Personal</option>
                <option>Work</option>
                <option>Study</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Tags (comma separated)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., urgent, frontend, meeting"
              className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Duration & High Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Estimated Duration</label>
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 2h, 30min"
                className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              />
            </div>
            <div className="flex items-center justify-start sm:justify-end">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={highPriority}
                  onChange={() => setHighPriority(!highPriority)}
                  className="mr-3 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-gray-700 text-sm font-medium">High priority</span>
              </label>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Due Date & Time</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Button */}
          <button
            onClick={handleAdd}
            disabled={loading}
            className={`w-full bg-purple-600 text-white py-3 px-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-purple-700 transition-colors ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </div>
            ) : (
              "Add Task"
            )}
          </button>

          {/* Live Preview */}
          <div className="mt-6 border-t border-purple-200 pt-6">
            <h3 className="text-purple-700 font-semibold mb-3 text-lg">Live Preview</h3>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
              <div className="font-medium text-gray-800 text-sm sm:text-base">
                {title || "Task title..."}
              </div>
              <div className="text-gray-600 text-sm">
                {description || "Task description..."}
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                <span className="bg-white px-2 py-1 rounded">Category: {category}</span>
                <span className="bg-white px-2 py-1 rounded">Priority: {priority}</span>
                {dueDate && (
                  <span className="bg-white px-2 py-1 rounded">
                    Due: {new Date(dueDate).toLocaleString()}
                  </span>
                )}
                {duration && (
                  <span className="bg-white px-2 py-1 rounded">Duration: {duration}</span>
                )}
                {highPriority && (
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">
                    🔥 High Priority
                  </span>
                )}
              </div>
              {tags && (
                <div className="text-xs text-gray-600">
                  Tags: {tags}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
