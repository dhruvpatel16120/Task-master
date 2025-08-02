import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "/src/assets/logo.png";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dateTime, setDateTime] = useState(new Date());
  const [profile, setProfile] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src={logo} alt="Logo" className="h-8 sm:h-10" />
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex space-x-8 text-sm font-medium">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === "/" 
                    ? "text-purple-600 bg-purple-50" 
                    : "text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/add"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === "/add" 
                    ? "text-purple-600 bg-purple-50" 
                    : "text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                }`}
              >
                Add Task
              </Link>
              <Link
                to="/pending"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === "/pending" 
                    ? "text-purple-600 bg-purple-50" 
                    : "text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                }`}
              >
                Pending Tasks
              </Link>
              <Link
                to="/completed"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === "/completed" 
                    ? "text-purple-600 bg-purple-50" 
                    : "text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                }`}
              >
                Completed Tasks
              </Link>
            </nav>
          )}

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-gray-600 text-xs">
              {dateTime.toLocaleDateString()} {dateTime.toLocaleTimeString()}
            </div>
            {user ? (
              <>
                {profile && (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center font-semibold text-sm">
                      {profile.username ? profile.username.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span className="text-gray-700 text-sm font-medium hidden lg:block">
                      {profile.username}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => navigate("/logout")}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-purple-600 text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {user ? (
              <>
                <Link
                  to="/"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    location.pathname === "/" 
                      ? "text-purple-600 bg-purple-50" 
                      : "text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/add"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    location.pathname === "/add" 
                      ? "text-purple-600 bg-purple-50" 
                      : "text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                  }`}
                >
                  Add Task
                </Link>
                <Link
                  to="/pending"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    location.pathname === "/pending" 
                      ? "text-purple-600 bg-purple-50" 
                      : "text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                  }`}
                >
                  Pending Tasks
                </Link>
                <Link
                  to="/completed"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    location.pathname === "/completed" 
                      ? "text-purple-600 bg-purple-50" 
                      : "text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                  }`}
                >
                  Completed Tasks
                </Link>
                
                {/* Mobile user info and logout */}
                <div className="border-t border-gray-200 pt-4 pb-3">
                  {profile && (
                    <div className="flex items-center px-3 py-2">
                      <div className="w-8 h-8 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center font-semibold text-sm">
                        {profile.username ? profile.username.charAt(0).toUpperCase() : "U"}
                      </div>
                      <span className="ml-3 text-gray-700 text-sm font-medium">
                        {profile.username}
                      </span>
                    </div>
                  )}
                  <div className="mt-3 px-3">
                    <button
                      onClick={() => navigate("/logout")}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
