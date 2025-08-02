import { useState, useEffect } from "react";
import { auth, googleProvider, db } from "../services/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { validateEmail, rateLimiter } from "../utils/security";
import { handleAuthError, handleDatabaseError } from "../utils/errorHandler";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Check if user came from signup page
  useEffect(() => {
    if (location.state?.fromSignup) {
      setSuccessMessage("Account created successfully! Please log in.");
      // Clear the state to prevent showing message again on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

    const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    // Rate limiting check
    if (!rateLimiter.isAllowed(email)) {
      setError("Too many login attempts. Please wait a moment and try again.");
      return;
    }

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    // Enhanced email validation
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return; 
    }

    setLoading(true);
    try {
      const persistence = rememberMe
        ? browserLocalPersistence
        : browserSessionPersistence;

      await setPersistence(auth, persistence);
      await signInWithEmailAndPassword(auth, email, password);

      // Reset rate limiter on successful login
      rateLimiter.reset(email);
      navigate("/");
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setLoading(false);
    }
  };



  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        fullName: user.displayName || "",
        username: user.email.split("@")[0],
        email: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      navigate("/");
    } catch (err) {
      setError(handleAuthError(err));
    }
  };

  const handleForgotPassword = async () => {
    setError(null);

    if (!resetEmail) {
      setError("Please enter your email to reset password.");
      return;
    }

    if (!validateEmail(resetEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      alert("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError(handleAuthError(err));
    }
  };




  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-16 py-8 lg:py-0">
        <div className="w-full max-w-md">
          <img src="/logo.png" alt="Logo" className="w-24 sm:w-36 mb-6 sm:mb-8 mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">Welcome back</h2>
          <p className="text-gray-600 mb-6 text-center">Please enter your details</p>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-100 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 text-sm text-green-600 bg-green-100 border border-green-200 rounded-lg p-3">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setResetEmail(e.target.value); // for forgot password
                }}
                required
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 space-y-2 sm:space-y-0">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Remember for 30 days
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-purple-600 hover:text-purple-700 hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center bg-purple-600 text-white py-3 px-4 rounded-lg font-medium transition-colors ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:bg-purple-700"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"
                    ></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </button>
          </form>

          <div className="my-6 flex items-center justify-center text-gray-500">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-300 flex items-center justify-center"
          >
            <img
              src="/google-color.svg"
              alt="Google"
              className="w-5 h-5 mr-3 bg-white rounded-full p-[1px]"
            />
            Log in with Google
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-purple-600 font-medium hover:text-purple-700 hover:underline transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Background Image */}
      <div
        className="hidden lg:block lg:w-1/2 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('bg.jpg')`,
        }}
      />
    </div>
  );
}
