import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddTask from './pages/AddTask';
import PendingTasks from './pages/PendingTasks';
import CompletedTasks from './pages/CompletedTasks';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Logout from './pages/Logout';
import EditTask from './pages/EditTask';
import CalendarView from './pages/CalendarView';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <>
      <Toaster position="bottom-left" reverseOrder={false} />
      <Navbar />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add" element={<AddTask />} />
        <Route path="/pending" element={<PendingTasks />} />
        <Route path="/completed" element={<CompletedTasks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/edit/:id" element={<EditTask />} />
        <Route path="/calendar" element={<CalendarView />} />
      </Routes>
    </>
  );
}
