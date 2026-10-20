import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Inbox, ArrowRight, Car, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { getRides, clearRides } from "../services/storage";
import { formatKsh } from "../utils/fareCalculator";
import { formatDate } from "../utils/formatters";

export default function Activity() {
  const [rides, setRides] = useState(() => getRides());
  const [selectedRide, setSelectedRide] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearHistory = () => {
    clearRides();
    setRides([]);
    setShowClearConfirm(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-ink text-white py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Activity</h1>
            <p className="text-white/50 text-sm mt-1">View your past rides and receipts.</p>
          </div>
          {rides.length > 0 && (
            <button 
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition px-3 py-2 rounded-lg hover:bg-red-400/10"
            >
              <Trash2 size={16} /> Clear History
            </button>
          )}
        </div>

        {/* Empty State */}
        {rides.length === 0 ? (
          <div className="bg-surface border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Inbox size={32} className="text-white/30" />
            </div>
            <h2 className="text-xl font-bold mb-2">No rides yet</h2>
            <p className="text-white/50 mb-8 max-w-sm">You haven't taken any rides with RydEx yet. Book your first ride to see it here.</p>
            <Link to="/">
              <Button>Book a Ride <ArrowRight size={18} /></Button>
            </Link>
          </div>
        ) : (
          /* Ride List */
          <div className="space-y-4">
            {rides.map((ride) => (
              <button
                key={ride.id}
                onClick={() => setSelectedRide(ride)}
                className="w-full text-left bg-surface border border-white/10 hover:border-white/30 rounded-2xl p-5 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    ride.status === 'completed' ? 'bg-lime/10 text-lime' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {ride.status === 'completed' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold tracking-wider text-white/40 uppercase">{ride.id}</span>
                      <span className="text-xs text-white/30">•</span>
                      <span className="text-xs text-white/50">{formatDate(ride.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="truncate max-w-[120px] sm:max-w-[200px]">{ride.pickup?.name}</span>
                      <ArrowRight size={14} className="text-white/30 shrink-0" />
                      <span className="truncate max-w-[120px] sm:max-w-[200px]">{ride.destination?.name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:flex-col sm:items-end w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-white/5">
                  <span className="text-lg font-bold text-white">{formatKsh(ride.ride.price)}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md mt-1 ${
                    ride.status === 'completed' ? 'bg-lime/10 text-lime' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Trip Details Modal */}
      <Modal 
        isOpen={!!selectedRide} 
        onClose={() => setSelectedRide(null)} 
        title="Ride Details"
      >
        {selectedRide && (
          <div className="space-y-6">
            
            {/* Status Header */}
            <div className={`p-4 rounded-xl flex items-center gap-3 ${
              selectedRide.status === 'completed' ? 'bg-lime/10 text-lime' : 'bg-red-500/10 text-red-400'
            }`}>
              {selectedRide.status === 'completed' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              <div>
                <h3 className="font-bold text-lg capitalize">{selectedRide.status}</h3>
                <p className="text-xs opacity-80">{formatDate(selectedRide.date)}</p>
              </div>
            </div>

            {/* Route */}
            <div className="space-y-4 relative">
              <div className="absolute left-[9px] top-6 bottom-6 w-0.5 bg-white/10"></div>
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-5 h-5 rounded-full bg-ink border-2 border-lime flex items-center justify-center mt-0.5">
                  <div className="w-1.5 h-1.5 bg-lime rounded-full"></div>
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-0.5">Pickup</p>
                  <p className="font-medium">{selectedRide.pickup?.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 relative z-10">
                <div className="w-5 h-5 rounded-full bg-ink border-2 border-white flex items-center justify-center mt-0.5">
                  <MapPin size={12} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-0.5">Destination</p>
                  <p className="font-medium">{selectedRide.destination?.name}</p>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-white/10"></div>

            {/* Ride Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-ink p-3 rounded-xl border border-white/5">
                <p className="text-xs text-white/50 mb-1">Category</p>
                <p className="font-semibold text-sm flex items-center gap-2">
                  <Car size={16} className="text-lime" /> {selectedRide.ride.name}
                </p>
              </div>
              <div className="bg-ink p-3 rounded-xl border border-white/5">
                <p className="text-xs text-white/50 mb-1">Distance</p>
                <p className="font-semibold text-sm">{selectedRide.distanceKm.toFixed(1)} km</p>
              </div>
            </div>

            {/* Price */}
            <div className="bg-ink p-4 rounded-xl border border-white/5 flex justify-between items-center">
              <span className="font-semibold text-white/70">Total Fare</span>
              <span className="text-xl font-bold text-lime">{formatKsh(selectedRide.ride.price)}</span>
            </div>

          </div>
        )}
      </Modal>

      {/* Clear History Confirm Modal */}
      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Clear Ride History?"
      >
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <Trash2 size={32} className="text-red-400" />
          </div>
          <div>
            <p className="text-white/70">Are you sure you want to permanently delete all your ride history? This action cannot be undone.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setShowClearConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleClearHistory}>
              Yes, Delete
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
