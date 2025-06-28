import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleConfirm = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleCancel = () => {
    navigate(-1); // go back
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-200 to-purple-300">
      <div className="bg-white bg-opacity-10 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-white-300">
        <h2 className="text-3xl font-bold text-black mb-4">Confirm Logout</h2>
        <p className="text-black mb-6">Are you sure you want to log out of Task Master?</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleConfirm}
            className="bg-red-600 text-white px-5 py-2 rounded-full font-medium hover:bg-red-700 transition"
          >
            Yes, Log out
          </button>
          <button
            onClick={handleCancel}
            className="bg-purple-200 text-purple-800 px-5 py-2 rounded-full font-medium hover:bg-purple-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
