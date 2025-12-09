import { Link, useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, Github } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useState } from 'react';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";


interface SignInProps {
  onSignIn: () => void;
  onAdminSignIn: () => void;
}

export default function SignIn({ onSignIn, onAdminSignIn }: SignInProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Register user in backend if not exists
    await fetch("http://127.0.0.1:5000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: user.displayName,
        email: user.email,
        password: "google-oauth"
      }),
    });

    // Store login in localStorage
    localStorage.setItem("userEmail", user.email || "");

    alert("Signed in with Google!");
    onSignIn();
    navigate("/view-reports");

  } catch (err) {
    console.error(err);
    alert("Google sign-in failed");
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // ADMIN LOGIN (NO DB CHECK)
  if (email === "admin1@gmail.com" && password === "abc") {
    onAdminSignIn();
    navigate("/admin/dashboard");
    return;
  }

  // USER LOGIN (CHECK DB)
  try {
    const response = await fetch("http://127.0.0.1:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error);
      return;
    }

    // LOGIN SUCCESS
   onSignIn();
localStorage.setItem("userEmail", email);
navigate("/view-reports");



  } catch (error) {
    console.error("Login error", error);
    alert("Server error — backend not reachable");
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-5">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">LabInsight AI</span>
            </Link>
            <Link
              to="/"
              className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Sign In Form */}
      <div className="flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100">

            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome Back</h1>
              <p className="text-lg text-gray-600">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* EMAIL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Email Address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* REMEMBER ME + FORGOT */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </a>
              </div>

              {/* SIGN IN BUTTON */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                Sign In
              </button>
            </form>

            {/* SOCIAL LOGIN */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <button
  onClick={handleGoogleLogin}
  className="flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
>
  <FcGoogle className="w-5 h-5" />
  <span className="font-medium text-gray-700">Google</span>
</button>

                <button className="flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                  <Github className="w-5 h-5" />
                  <span className="font-medium text-gray-700">GitHub</span>
                </button>
              </div>
            </div>

            <p className="mt-8 text-center text-gray-600">
              Don't have an account?{' '}
              <Link to="/get-started" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
