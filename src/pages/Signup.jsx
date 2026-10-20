import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Button from "../components/ui/Button";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "../lib/firebase";

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (form.name.length < 2) return setError("Please enter your full name.");
    if (!form.email.includes("@")) return setError("Please enter a valid email address.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");

    if (!isFirebaseConfigured || !auth || !db) {
      setError("Sign-up isn't configured yet. Follow the Firebase setup in README.md.");
      return;
    }

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
      await updateProfile(user, { displayName: form.name.trim() });
      await setDoc(doc(db, "profiles", user.uid), {
        full_name: form.name.trim(),
        email: user.email,
        phone: "",
        role: "pending",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      await sendEmailVerification(user);
      navigate("/portal", { replace: true });
    } catch (signUpError) {
      console.error("Sign-up failed", signUpError);
      setError(signUpError.message || "We couldn't create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create an account</h1>
        <p className="text-white/50 text-sm">Create an account. An administrator will assign your customer or driver role before you continue.</p>
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

      {notice && (
        <div role="status" className="bg-lime/10 border border-lime/20 text-lime text-sm p-3 rounded-xl mb-6">
          {notice}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm text-white/70 mb-1.5">Full Name</label>
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              required
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              className="w-full bg-surface border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:border-lime focus:outline-none"
              placeholder="Enter your full name"
            />
          </div>
        </div>

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
              placeholder="Enter your email address"
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
              placeholder="Create a password (at least 6 characters)"
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

        <Button type="submit" className="w-full mt-2" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"} {!loading && <ArrowRight size={18} />}
        </Button>
      </form>

      <p className="text-center text-sm text-white/50 mt-8">
        Already have an account?{" "}
        <Link to="/login" className="text-lime font-semibold hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
