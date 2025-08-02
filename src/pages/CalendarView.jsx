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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-700 mb-6">📅 Calendar View</h2>
        
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Calendar */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-purple-700 mb-4">Select Date</h3>
            <div className="flex justify-center">
              <Calendar 
                value={selectedDate} 
                onChange={setSelectedDate}
                className="w-full max-w-sm"
              />
            </div>
          </div>

          {/* Tasks for selected date */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-purple-700 mb-4">
              Tasks for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            {tasksForDate.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm sm:text-base">No tasks scheduled for this date.</p>
                <p className="text-gray-400 text-xs mt-2">Select another date or add new tasks</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasksForDate.map(task => (
                  <div 
                    key={task.id} 
                    className={`p-3 rounded-lg border-l-4 ${
                      task.completed 
                        ? 'bg-green-50 border-green-400' 
                        : 'bg-purple-50 border-purple-400'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-sm sm:text-base ${
                          task.completed ? 'line-through text-gray-600' : 'text-gray-800'
                        }`}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2">
                            {task.description}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className={`px-2 py-1 rounded-full ${
                          task.priority === 'High' ? 'bg-red-100 text-red-700' :
                          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {task.category}
                        </span>
                        {task.completed && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {task.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
