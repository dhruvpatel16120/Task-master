import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";   // ✅ add this import
import logo from "/src/assets/logo.png";

export default function Navbar() {
  const { user } = useAuth();  // ✅ get user (and optionally logout)
  const navigate = useNavigate();
  const location = useLocation();
  const [dateTime, setDateTime] = useState(new Date());
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProfile(snap.data());
      }
    };
    fetchProfile();
  }, [user]);

  return (
    <header className="flex justify-between items-center px-6 py-3 bg-white shadow">
      {/* Left - Logo */}
      <Link to="/">
        <img src={logo} alt="Logo" className="h-10" />
      </Link>

      {/* Center - Navigation links */}
      <nav className="flex space-x-4 text-sm font-medium">
        <Link
          to="/"
          className={location.pathname === "/" ? "text-purple-600 font-semibold" : "text-gray-700 hover:text-purple-600"}
        >
          Dashboard
        </Link>
        <Link
          to="/add"
          className={location.pathname === "/add" ? "text-purple-600 font-semibold" : "text-gray-700 hover:text-purple-600"}
        >
          Add Task
        </Link>
        <Link
          to="/pending"
          className={location.pathname === "/pending" ? "text-purple-600 font-semibold" : "text-gray-700 hover:text-purple-600"}
        >
          Pending Tasks
        </Link>
        <Link
          to="/completed"
          className={location.pathname === "/completed" ? "text-purple-600 font-semibold" : "text-gray-700 hover:text-purple-600"}
        >
          Completed Tasks
        </Link>
      </nav>

      {/* Right - Date/time + user + logout */}
      <div className="flex items-center space-x-4">
        <div className="hidden md:block text-gray-600 text-xs">
          {dateTime.toLocaleDateString()} {dateTime.toLocaleTimeString()}
        </div>
        {profile && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center font-semibold">
              {profile.username ? profile.username.charAt(0).toUpperCase() : "U"}
            </div>
            <span className="text-gray-700 text-sm font-medium">{profile.username}</span>
          </div>
        )}
        <button
          onClick={() => navigate("/logout")}   // ✅ navigate to /logout route
          className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs hover:bg-purple-700 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
