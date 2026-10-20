import { useState } from "react";
import { User, Mail, Car, Save, RotateCcw } from "lucide-react";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { RIDE_CATEGORIES } from "../utils/fareCalculator";
import { clearRides } from "../services/storage";
import { useAuth } from "../context/useAuth";

export default function Profile() {
  const { user, profile } = useAuth();
  const [preferredRide, setPreferredRide] = useState(
    () => localStorage.getItem("rydex_pref_ride") || "economy"
  );
  const [isSaved, setIsSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = () => {
    localStorage.setItem("rydex_pref_ride", preferredRide);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetData = () => {
    clearRides();
    localStorage.removeItem("rydex_pref_ride");
    setShowResetConfirm(false);
    window.location.reload();
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-ink text-white py-8 sm:py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-white/50 text-sm mt-1">Manage your account settings and preferences.</p>
        </div>

        <div className="bg-surface border border-white/10 rounded-2xl p-5 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
            <div className="w-20 h-20 rounded-full bg-lime/20 flex items-center justify-center border-2 border-lime shrink-0">
              <User size={40} className="text-lime" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">
                {profile?.full_name || user?.displayName || "Your RydEx profile"}
              </h2>
              <p className="text-white/50 flex items-center justify-center sm:justify-start gap-2 mt-1 text-sm sm:text-base">
                <Mail size={14} /> {user?.email || "Sign in to connect your account"}
              </p>
            </div>
          </div>

          <div className="w-full h-px bg-white/10"></div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Car size={20} className="text-lime" /> Ride Preferences
            </h3>
            
            <div>
              <label className="block text-sm text-white/70 mb-2">Default Ride Category</label>
              <select 
                value={preferredRide}
                onChange={(e) => setPreferredRide(e.target.value)}
                className="w-full bg-ink border border-white/10 rounded-xl px-4 py-3 text-white focus:border-lime focus:outline-none appearance-none"
              >
                {RIDE_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave} disabled={isSaved} className="w-full sm:w-auto">
              {isSaved ? "Saved!" : <><Save size={18} /> Save Preferences</>}
            </Button>
          </div>
        </div>

        <div className="bg-surface border border-red-500/20 rounded-2xl p-5 sm:p-8 space-y-4">
          <h3 className="font-semibold text-lg text-red-400">Data Management</h3>
          <p className="text-sm text-white/50">
            This clears ride history stored on this device and resets your local ride preference. Your account stays active.
          </p>
          <Button variant="danger" onClick={() => setShowResetConfirm(true)} className="w-full sm:w-auto">
            <RotateCcw size={18} /> Reset All Data
          </Button>
        </div>

      </div>

      <Modal isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)} title="Reset App Data?">
        <div className="space-y-6 text-center">
          <p className="text-white/70">Clear locally stored ride history and reset your ride preference? This cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setShowResetConfirm(false)}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={handleResetData}>Yes, Reset</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
