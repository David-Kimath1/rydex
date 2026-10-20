import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/useAuth";

const MainLayout = lazy(() => import("./layouts/MainLayout"));
const AuthLayout = lazy(() => import("./layouts/AuthLayout"));
const Home = lazy(() => import("./pages/Home"));
const Activity = lazy(() => import("./pages/Activity"));
const Profile = lazy(() => import("./pages/Profile"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Drive = lazy(() => import("./pages/Drive"));
const Business = lazy(() => import("./pages/Business"));
const Help = lazy(() => import("./pages/Help"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const CustomerPortal = lazy(() => import("./pages/CustomerPortal"));
const DriverDashboard = lazy(() => import("./pages/DriverDashboard"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const RolePanelPreview = lazy(() => import("./pages/RolePanelPreview"));

function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="grid min-h-screen place-items-center bg-ink text-white/70">Checking account…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  return <Outlet />;
}

function RequireRole({ roles, children }) {
  const { role, profileLoading, profileError } = useAuth();

  if (profileLoading) return <div className="grid min-h-screen place-items-center bg-ink text-white/70">Loading your account…</div>;
  if (profileError) return <div role="alert" className="grid min-h-screen place-items-center bg-ink px-6 text-center text-red-300">{profileError}</div>;
  if (!roles.includes(role)) return <Navigate to="/portal" replace />;
  return children;
}

export default function App() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-ink text-white/70">Loading RydEx…</div>}>
      <Routes>
        <Route element={<MainLayout />}>
          {import.meta.env.DEV && <Route path="/dev/panels" element={<RolePanelPreview />} />}
          <Route path="/" element={<CustomerDashboard />} />
          <Route path="/book" element={<Home />} />
          <Route element={<RequireAuth />}>
            <Route path="/activity" element={<RequireRole roles={["customer"]}><Activity /></RequireRole>} />
            <Route path="/profile" element={<RequireRole roles={["customer"]}><Profile /></RequireRole>} />
            <Route path="/portal" element={<CustomerPortal />} />
            <Route path="/dashboard" element={<RequireRole roles={["customer"]}><CustomerDashboard /></RequireRole>} />
            <Route path="/driver/dashboard" element={<RequireRole roles={["driver"]}><DriverDashboard /></RequireRole>} />
            <Route path="/admin/users" element={<RequireRole roles={["admin"]}><AdminUsers /></RequireRole>} />
          </Route>
          <Route path="/drive" element={<Drive />} />
          <Route path="/business" element={<Business />} />
          <Route path="/help" element={<Help />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
