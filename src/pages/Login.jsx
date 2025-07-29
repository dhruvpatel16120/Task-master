import { useState } from "react";
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
import { useNavigate, Link } from "react-router-dom";
import { validateEmail, rateLimiter } from "../utils/security";
import { handleAuthError, handleDatabaseError } from "../utils/errorHandler";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

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
    <div className="flex min-h-screen">
      {/* Left Side - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 sm:px-16">
        <div className="w-full max-w-md">
          <img src="/src/assets/logo.png" alt="Logo" className="w-36 mb-8" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome back</h2>
          <p className="text-gray-600 mb-4">Please enter your details</p>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-100 border border-red-200 rounded p-2">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setResetEmail(e.target.value); // for forgot password
                }}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Remember for 30 days
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

                  <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center bg-purple-600 text-white py-2 rounded-md transition ${
            loading ? "opacity-70 cursor-not-allowed" : "hover:bg-purple-700"
          }`}
        >
          {loading ? (
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
          ) : null}
          {loading ? "logging in..." : "Log in"}
        </button>

          </form>

          <div className="my-4 flex items-center justify-center text-gray-500">
            <span className="px-2">OR</span>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full mt-4 bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition flex items-center justify-center"
          >
            <img
              src="/src/assets/google-color.svg"
              alt="Google"
              className="w-5 h-5 mr-2 bg-white rounded-full p-[1px]"
            />
            Log in with Google
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-purple-600 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Background Image */}
      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center"
        style={{
          backgroundImage: `url('/src/assets/bg.jpg')`,
        }}
      />
    </div>
  );
}
