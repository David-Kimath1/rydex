import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import InstallPWA from "../ui/InstallPWA";
import { useAuth } from "../../context/useAuth";

const links = [
  { to: "/", label: "Ride" },
  { to: "/drive", label: "Drive" },
  { to: "/business", label: "Business" },
  { to: "/help", label: "Help" },
  { to: "/activity", label: "Activity" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [authError, setAuthError] = useState("");
  const { user, role, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setAuthError("");
    try {
      const { error } = await signOut();
      if (error) throw error;
      setOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Sign-out failed", error);
      setAuthError("Couldn't sign you out. Please try again.");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-ink/90 backdrop-blur border-b border-white/5">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl gabriela-regular tracking-tight">
          Ryd<span className="text-lime">Ex</span>
        </Link>

        <ul className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-full text-sm font-medium transition ${
                    isActive
                      ? "bg-white text-ink"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-2">
          <InstallPWA />
          {authLoading ? (
            <span className="px-4 py-2 text-sm text-white/40">Checking account…</span>
          ) : user ? (
            <>
              {role === "admin" ? (
                <Link to="/admin/users" className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white">Admin</Link>
              ) : (
                <Link to={role === "driver" ? "/driver/dashboard" : role === "customer" ? "/dashboard" : "/portal"} className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white">
                  {role === "driver" ? "Driver dashboard" : role === "customer" ? "Dashboard" : "Account"}
                </Link>
              )}
              <button onClick={handleSignOut} className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white">Log in</Link>
              <Link to="/signup" className="px-4 py-2 rounded-full bg-lime text-ink text-sm font-semibold hover:brightness-110 transition">Sign up</Link>
            </>
          )}
        </div>

        {/* Mobile Animated Menu Toggle */}
        <div 
          className={`toggle md:hidden ${open ? 'is-open' : ''}`} 
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setOpen(!open)}
        >
          <div id="bar1" className="bars"></div>
          <div id="bar2" className="bars"></div>
          <div id="bar3" className="bars"></div>
        </div>
      </nav>

      {open && (
        <div className="md:hidden border-t border-white/5 bg-ink">
          <ul className="px-4 py-3 space-y-1">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-lg text-sm font-medium ${
                      isActive ? "bg-white text-ink" : "text-white/70 hover:bg-white/5"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
            <li className="pt-2 mt-1 border-t border-white/5 flex gap-2">
              {user ? (
                <>
                  <Link to={role === "admin" ? "/admin/users" : role === "driver" ? "/driver/dashboard" : role === "customer" ? "/dashboard" : "/portal"} onClick={() => setOpen(false)} className="flex-1 text-center px-3 py-2 rounded-lg text-sm font-medium bg-white/5">
                    {role === "admin" ? "Admin" : role === "driver" ? "Driver dashboard" : role === "customer" ? "Dashboard" : "Account"}
                  </Link>
                  <button onClick={handleSignOut} className="flex-1 px-3 py-2 rounded-lg bg-lime text-ink text-sm font-semibold">Sign out</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="flex-1 text-center px-3 py-2 rounded-lg text-sm font-medium bg-white/5">Log in</Link>
                  <Link to="/signup" onClick={() => setOpen(false)} className="flex-1 text-center px-3 py-2 rounded-lg bg-lime text-ink text-sm font-semibold">Sign up</Link>
                </>
              )}
            </li>
          </ul>
        </div>
      )}
      {authError && <p role="alert" className="px-4 pb-3 text-sm text-red-400">{authError}</p>}
    </header>
  );
}
