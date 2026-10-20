import { useState } from "react";
import { AuthContext } from "../context/authContext";
import AdminUsers from "./AdminUsers";
import CustomerDashboard from "./CustomerDashboard";
import DriverDashboard from "./DriverDashboard";

const panelOptions = [
  { id: "admin", label: "Admin" },
  { id: "customer", label: "Customer" },
  { id: "driver", label: "Driver" },
];

const previewAccounts = {
  admin: {
    uid: "preview-admin",
    email: "admin@example.com",
    full_name: "Alex Admin",
    role: "admin",
  },
  customer: {
    uid: "preview-customer",
    email: "alex.customer@example.com",
    full_name: "Alex Customer",
    role: "customer",
  },
  driver: {
    uid: "preview-driver",
    email: "sam.driver@example.com",
    full_name: "Sam Driver",
    role: "driver",
  },
};

export default function RolePanelPreview() {
  const [activePanel, setActivePanel] = useState("admin");
  const account = previewAccounts[activePanel];
  const authValue = {
    user: { uid: account.uid, email: account.email },
    loading: false,
    authError: "",
    profile: account,
    role: account.role,
    profileLoading: false,
    profileError: "",
    isConfigured: true,
    signOut: async () => ({ error: null }),
  };

  return (
    <>
      <section className="border-b border-white/10 bg-surface px-4 py-4 text-white sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-semibold">Local panel preview</h1>
            <p className="mt-1 text-xs text-white/50">Sample screens only. Changes here are not saved to Firebase.</p>
          </div>
          <div className="flex gap-2" role="group" aria-label="Choose a panel to preview">
            {panelOptions.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={activePanel === id}
                onClick={() => setActivePanel(id)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activePanel === id
                    ? "bg-lime text-ink"
                    : "border border-white/10 bg-ink text-white/70 hover:border-white/30"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>
      <AuthContext.Provider value={authValue}>
        {activePanel === "admin" && <AdminUsers preview />}
        {activePanel === "customer" && <CustomerDashboard preview />}
        {activePanel === "driver" && <DriverDashboard />}
      </AuthContext.Provider>
    </>
  );
}
