import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Activity, ArrowRight, CarFront, UserRound } from "lucide-react";
import { httpsCallable } from "firebase/functions";
import { reload } from "firebase/auth";
import Button from "../components/ui/Button";
import { useAuth } from "../context/useAuth";
import { auth, functions } from "../lib/firebase";

export default function CustomerPortal() {
  const { user, profile, role, profileLoading, profileError, signOut } = useAuth();
  const navigate = useNavigate();
  const [signOutError, setSignOutError] = useState("");
  const [bootstrapError, setBootstrapError] = useState("");
  const [bootstrapping, setBootstrapping] = useState(false);
  const isBootstrapAdmin = user?.email?.toLowerCase() === import.meta.env.VITE_FIREBASE_ADMIN_BOOTSTRAP_EMAIL?.toLowerCase();

  const handleBootstrapAdmin = async () => {
    setBootstrapError("");
    setBootstrapping(true);
    try {
      await reload(auth.currentUser);
      if (!auth.currentUser.emailVerified) {
        throw new Error("Verify this email address first, then try again.");
      }
      const bootstrapAdmin = httpsCallable(functions, "bootstrapFirstAdmin");
      await bootstrapAdmin();
      await auth.currentUser.getIdToken(true);
      navigate("/admin/users", { replace: true });
    } catch (error) {
      console.error("First admin setup failed", error);
      setBootstrapError(error.message || "We couldn't set up the administrator account.");
    } finally {
      setBootstrapping(false);
    }
  };

  if (profileLoading) {
    return <div className="grid min-h-[calc(100vh-64px)] place-items-center bg-ink text-white/70">Loading your account…</div>;
  }

  if (profileError) {
    return <p role="alert" className="mx-auto max-w-xl p-8 text-center text-red-300">{profileError}</p>;
  }

  if (role === "admin") return <Navigate to="/admin/users" replace />;
  if (role === "driver") return <Navigate to="/driver/dashboard" replace />;

  if (role === "pending" || !role) {
    return (
      <main className="grid min-h-[calc(100vh-64px)] place-items-center bg-ink px-5 py-10 text-white">
        <section className="w-full max-w-lg rounded-3xl border border-white/10 bg-surface p-7 text-center sm:p-10">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-lime/10 text-lime">
            <UserRound size={26} />
          </div>
          <h1 className="text-2xl font-bold">Your account is awaiting role assignment</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            An administrator will assign your account as a customer or driver. You can use the app after your account is approved.
          </p>
          {isBootstrapAdmin && (
            <div className="mt-6 rounded-2xl border border-lime/20 bg-lime/[0.06] p-4 text-left">
              <p className="text-sm font-semibold text-lime">First-time Firebase setup</p>
              <p className="mt-1 text-xs leading-relaxed text-white/55">
                Verify this email address to create the first administrator account.
              </p>
              {bootstrapError && <p role="alert" className="mt-3 text-xs text-red-300">{bootstrapError}</p>}
              <Button className="mt-4 w-full" disabled={bootstrapping} onClick={handleBootstrapAdmin}>
                {bootstrapping ? "Setting up administrator…" : "Set up first administrator"}
              </Button>
            </div>
          )}
          {signOutError && <p role="alert" className="mt-4 text-sm text-red-300">{signOutError}</p>}
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="ghost" onClick={() => window.location.reload()}>
            Check status again
          </Button>
          <Button onClick={async () => {
            setSignOutError("");
            try {
              const { error } = await signOut();
              if (error) throw error;
              navigate("/", { replace: true });
            } catch (error) {
              console.error("Sign-out failed", error);
              setSignOutError("Couldn't sign you out. Please try again.");
            }
          }}>
            Sign out
          </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-ink px-4 py-10 text-white sm:px-6 sm:py-16">
      <section className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-lime">Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">How would you like to continue?</h1>
          <p className="mt-2 text-white/55">Choose your RydEx booking experience or open your account dashboard.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link to="/" className="group rounded-3xl border border-lime/30 bg-lime/[0.06] p-6 transition hover:border-lime hover:bg-lime/10 sm:p-8">
            <CarFront size={30} className="text-lime" />
            <h2 className="mt-5 text-xl font-bold">Ride booking MVP</h2>
            <p className="mt-2 min-h-12 text-sm leading-relaxed text-white/55">Open the ride-booking experience to enter your route and compare ride options.</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-lime">Open ride booking <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
          </Link>

          <Link to="/dashboard" className="group rounded-3xl border border-white/10 bg-surface p-6 transition hover:border-white/30 sm:p-8">
            <Activity size={30} className="text-lime" />
            <h2 className="mt-5 text-xl font-bold">Open dashboard</h2>
            <p className="mt-2 min-h-12 text-sm leading-relaxed text-white/55">Go to your customer dashboard for ride activity, profile settings, and account links.</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-lime">Open dashboard <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
          </Link>
        </div>
      </section>
    </main>
  );
}
