import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

export default function CalendarView() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "tasks"), where("uid", "==", user.uid));
    const unsub = onSnapshot(q, snap => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(list);
    });
    return () => unsub();
  }, [user]);

  // Filter tasks for selected date
  const tasksForDate = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
    return taskDate.toDateString() === selectedDate.toDateString();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <h2 className="text-xl font-bold text-purple-700">📅 Calendar View</h2>
        <Calendar value={selectedDate} onChange={setSelectedDate} />
        <div className="bg-white rounded shadow p-4">
          <h3 className="text-purple-700 font-semibold mb-2">Tasks for {selectedDate.toDateString()}</h3>
          {tasksForDate.length === 0 ? (
            <p className="text-gray-500 text-sm">No tasks for this date.</p>
          ) : (
            <ul className="space-y-1">
              {tasksForDate.map(task => (
                <li key={task.id} className="flex justify-between items-center">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-xs text-gray-500">{task.category}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
