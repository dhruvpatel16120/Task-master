import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function NotFound() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Show notification
    toast.error("Page not found!");
    
    // Redirect based on authentication status
    if (user) {
      // Authenticated users go to dashboard
      navigate("/", { replace: true });
    } else {
      // Unauthenticated users go to login
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
} 