import { useState } from "react";
import { auth, googleProvider, db } from "../services/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate all fields
    if (!fullName || !username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        fullName,
        username,
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      navigate("/");
    } catch (err) {
      console.error("Signup error:", err);
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setLoading(true);
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
      console.error("Google signup error:", err);
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = (err) => {
    console.error(err);
    if (err.code) {
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("An account with this email already exists.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/weak-password":
          setError("Password should be at least 6 characters.");
          break;
        case "auth/network-request-failed":
          setError("Network error. Please check your internet connection.");
          break;
        case "auth/popup-closed-by-user":
          setError("Google signup popup was closed. Please try again.");
          break;
        default:
          setError("Something went wrong. Please try again.");
      }
    } else {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Signup Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 sm:px-16">
        <div className="w-full max-w-md">
          <img
            src="/src/assets/logo.png"
            alt="Task Master Logo"
            className="w-36 mb-8"
          />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Create your account</h2>
          <p className="text-gray-600 mb-4">Start organizing your tasks today.</p>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-100 border border-red-200 rounded p-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
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
              {loading ? "Signing up..." : "Sign up"}
            </button>
          </form>

          <div className="my-4 flex items-center justify-center text-gray-500">
            <span className="px-2">OR</span>
          </div>

          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full mt-4 bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition flex items-center justify-center"
          >
            <img
              src="/src/assets/google-color.svg"
              alt="Google"
              className="w-5 h-5 mr-2 bg-white rounded-full p-[1px]"
            />
            Sign up with Google
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-600 font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Background */}
      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center"
        style={{
          backgroundImage: `url('/src/assets/bg2.jpg')`,
        }}
      />
    </div>
  );
}
