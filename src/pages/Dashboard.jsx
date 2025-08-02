import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend
} from "chart.js";
import Papa from "papaparse";
import toast from "react-hot-toast";
ChartJS.register(ArcElement, Tooltip, Legend);

const quotesList = [
  { text: "Stay productive, stay positive!", author: "Unknown" },
  { text: "Focus on progress, not perfection.", author: "Unknown" },
  { text: "Small steps lead to big results.", author: "Unknown" },
  { text: "Consistency is the key to success.", author: "Unknown" },
  { text: "Make each day your masterpiece.", author: "John Wooden" },
  { text: "Believe in yourself and all that you are.", author: "Christian D. Larson" },
  { text: "Don’t watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "You don’t have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Don’t limit your challenges. Challenge your limits.", author: "Jerry Dunn" },
  { text: "Dream big, start small, act now.", author: "Robin Sharma" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "Don’t be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
  { text: "It always seems impossible until it’s done.", author: "Nelson Mandela" },
  { text: "A little progress each day adds up to big results.", author: "Unknown" },
  { text: "You are capable of more than you know.", author: "Unknown" },
  { text: "Stay humble. Work hard. Be kind.", author: "Unknown" },
  { text: "The harder you work for something, the greater you’ll feel when you achieve it.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Don’t stop until you’re proud.", author: "Unknown" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "If you get tired, learn to rest, not quit.", author: "Banksy" },
  { text: "The best way to predict your future is to create it.", author: "Peter Drucker" },
  { text: "Success doesn’t come from what you do occasionally, it comes from what you do consistently.", author: "Marie Forleo" },
  { text: "Perseverance is not a long race; it is many short races one after the other.", author: "Walter Elliot" }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [quote, setQuote] = useState(quotesList[0]);
  const [fade, setFade] = useState(true); // fade control

  // ✨ Pick random quote once on load
  useEffect(() => {
    const random = quotesList[Math.floor(Math.random() * quotesList.length)];
    setQuote(random);
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "tasks"), where("uid", "==", user.uid));
    const unsub = onSnapshot(q, snapshot => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(list);
    });
    return () => unsub();
  }, [user]);

  // give a new quote
  const getNewQuote = () => {
  setFade(false);   // start fade out
  setTimeout(() => {
    const random = quotesList[Math.floor(Math.random() * quotesList.length)];
    setQuote(random);
    setFade(true);  // fade in new
  }, 200); // match transition duration
};

  const exportToCSV = () => {
  if (tasks.length === 0) {
    toast.error("No tasks to export!");
    return;
  }

  // Convert tasks to plain object list (avoid Firestore metadata)
  const taskData = tasks.map(task => ({
    Title: task.title,
    Description: task.description,
    Category: task.category,
    Priority: task.priority,
    Tags: (task.tags || []).join(", "),
    DueDate: task.dueDate?.toDate ? task.dueDate.toDate().toLocaleString() : "",
    Duration: task.duration || "",
    HighPriority: task.highPriority ? "Yes" : "No",
    Completed: task.completed ? "Yes" : "No",
    CreatedAt: task.createdAt?.toDate ? task.createdAt.toDate().toLocaleString() : ""
  }));

  const csv = Papa.unparse(taskData);

  // Create download link
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "tasks.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.success("✅ CSV downloaded!");
};


  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const chartData = {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        data: [completedTasks, pendingTasks],
        backgroundColor: ["#8b5cf6", "#e5e7eb"], // purple & gray
        borderWidth: 1
      }
    ]
  };

  const latestTasks = [...tasks]
    .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Greeting */}
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-700">
          Welcome back, {user?.displayName || "User"}! 🎉
        </h1>

        {/* ✨ Quote widget */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 space-y-3">
          <h3 className="font-semibold text-purple-700 mb-3 text-lg">🌟 Motivation</h3>
          <p
            className={`italic text-gray-600 transition-opacity duration-200 text-sm sm:text-base ${fade ? "opacity-100" : "opacity-0"}`}
          >
            "{quote.text}"
          </p>
          <p className="text-xs text-right text-gray-500">— {quote.author}</p>

          <button
            onClick={getNewQuote}
            className="mt-3 bg-purple-600 text-white text-xs sm:text-sm px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            🔄 New Quote
          </button>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 text-center">
            <div className="text-gray-500 text-xs sm:text-sm mb-1">Total Tasks</div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-purple-700">{totalTasks}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 text-center">
            <div className="text-gray-500 text-xs sm:text-sm mb-1">Completed</div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-green-600">{completedTasks}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 text-center">
            <div className="text-gray-500 text-xs sm:text-sm mb-1">Pending</div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-yellow-500">{pendingTasks}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 text-center">
            <div className="text-gray-500 text-xs sm:text-sm mb-1">Completion %</div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-purple-700">{completionRate}%</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
          <a
            href="/calendar"
            className="inline-flex items-center justify-center bg-purple-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            📅 View Calendar
          </a>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center justify-center bg-purple-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            📥 Export to CSV
          </button>
        </div>

        {/* Chart + Latest Tasks */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="font-semibold text-purple-700 mb-4 text-lg">Task Status Overview</h3>
            <div className="w-full max-w-xs mx-auto">
              <Doughnut data={chartData} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="font-semibold text-purple-700 mb-4 text-lg">Latest Tasks</h3>
            {latestTasks.length === 0 ? (
              <p className="text-gray-500 text-sm">No tasks yet.</p>
            ) : (
              <ul className="space-y-3">
                {latestTasks.map(task => (
                  <li key={task.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 text-sm sm:text-base truncate">{task.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{task.category} | {task.priority}</div>
                    </div>
                    <div className={`text-xs font-semibold mt-2 sm:mt-0 sm:ml-4 ${
                      task.completed ? "text-green-600" : "text-yellow-500"
                    }`}>
                      {task.completed ? "Completed" : "Pending"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
