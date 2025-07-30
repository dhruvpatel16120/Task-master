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
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import NotFound from './components/NotFound';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <>
      <Toaster position="bottom-left" reverseOrder={false} />
      <Navbar />

      <Routes>
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/add" element={<PrivateRoute><AddTask /></PrivateRoute>} />
        <Route path="/pending" element={<PrivateRoute><PendingTasks /></PrivateRoute>} />
        <Route path="/completed" element={<PrivateRoute><CompletedTasks /></PrivateRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/logout" element={<PrivateRoute><Logout /></PrivateRoute>} />
        <Route path="/edit/:id" element={<PrivateRoute><EditTask /></PrivateRoute>} />
        <Route path="/calendar" element={<PrivateRoute><CalendarView /></PrivateRoute>} />
        
        {/* 404 Route - Redirect to appropriate page based on auth status */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
