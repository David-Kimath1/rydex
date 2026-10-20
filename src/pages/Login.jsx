import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Button from "../components/ui/Button";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, isFirebaseConfigured } from "../lib/firebase";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.includes("@")) {
      return setError("Please enter a valid email address.");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    if (!isFirebaseConfigured || !auth) {
      setError("Sign-in isn't configured yet. Follow the Firebase setup in README.md.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, form.email.trim(), form.password);
      navigate("/portal", { replace: true });
    } catch (signInError) {
      console.error("Sign-in failed", signInError);
      setError(signInError.message || "We couldn't sign you in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome back</h1>
        <p className="text-white/50 text-sm">Sign in to your RydEx account to continue.</p>
      </div>

      {!isFirebaseConfigured && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm p-3 rounded-xl mb-6">
          Firebase is not configured yet. Add your Firebase web app settings to <code>.env.local</code>.
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm text-white/70 mb-1.5">Email address</label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="email" 
              required
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              className="w-full bg-surface border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:border-lime focus:outline-none"
              placeholder="Sign in with email"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1.5">Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type={showPassword ? "text" : "password"}
              required
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              className="w-full bg-surface border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white focus:border-lime focus:outline-none"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"} {!loading && <ArrowRight size={18} />}
        </Button>
      </form>

      <p className="text-center text-sm text-white/50 mt-8">
        Don't have an account?{" "}
        <Link to="/signup" className="text-lime font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
