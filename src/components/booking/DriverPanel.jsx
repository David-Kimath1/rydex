import { useState, useRef } from "react";
import { Bike, Car, Phone, Star, CheckCircle2, Receipt, Download, ArrowLeft, MapPin, CreditCard, ShieldCheck } from "lucide-react";
import Button from "../ui/Button";
import { formatKsh } from "../../utils/fareCalculator";

export default function DriverPanel({
  status,
  driver,
  ride,
  eta,
  distanceKm,
  durationMin,
  bookingId,
  onCancel,
  onConfirmPickup,
  onComplete,
  onGoBack,
}) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const receiptRef = useRef(null);

  const downloadReceipt = async () => {
    if (!receiptRef.current) return;
    setIsGenerating(true);

    try {
      const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: "#F8F9FA",
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`RydEx-Receipt-${bookingId || "Download"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (status === "completed") {
    return (
      <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-500 relative">
        
        {/* ========================================================
            HIDDEN RECEIPT TEMPLATE FOR PDF GENERATION
            ======================================================== */}
        <div className="absolute left-[-9999px] top-0">
          <div 
            ref={receiptRef} 
            className="w-[794px] h-[1123px] bg-[#F8F9FA] relative overflow-hidden text-[#0B0B0B] flex flex-col"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <svg className="absolute top-0 right-0 w-[390px] h-[270px] pointer-events-none" viewBox="0 0 390 270" aria-hidden="true">
              <path fill="#F1F8EA" d="M183 0h207v188C304 168 246 111 183 0Z" />
              <path fill="#E6F1DB" d="M273 0h117v138C343 114 304 66 273 0Z" />
              <path fill="#DCEBCC" d="M339 0h51v89c-24-20-40-48-51-89Z" />
            </svg>

            <div className="px-16 pt-14 pb-10 flex justify-between items-start z-10 relative">
              <div className="pt-1">
                <h1 className="text-[43px] leading-none font-black tracking-[0.08em] text-[#111827]">
                  RYD<span className="text-[#8ABF4A]">EX</span>
                </h1>
                <p className="mt-2 text-[10px] font-semibold tracking-[0.38em] text-[#6B7280]">RIDE · MOVE · EARN</p>
              </div>
              <div className="text-right max-w-[235px] pt-1">
                <div className="flex items-center justify-end gap-2 text-[#4C7C2B]">
                  <ShieldCheck size={21} strokeWidth={1.8} />
                  <p className="text-[11px] font-bold tracking-[0.18em]">YOUR JOURNEY</p>
                </div>
                <p className="mt-2 text-[10px] font-medium tracking-[0.22em] text-[#7A8274]">RIDE RECEIPT</p>
              </div>
            </div>

            <div className="px-16 flex-1 z-10 relative">
              <div className="pb-7 border-b border-[#E7EAE3]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF4E2] flex items-center justify-center">
                    <Receipt size={19} className="text-[#4C7C2B]" />
                  </div>
                  <h2 className="text-[25px] font-bold tracking-tight">Ride Receipt</h2>
                </div>
                <div className="pl-[52px] text-[13px] text-[#68706A] space-y-1">
                  <p>Receipt No: <span className="font-semibold text-[#202820]">{bookingId || "RYD-XXXXX"}</span></p>
                  <p>Date: {new Date().toLocaleString()}</p>
                </div>
              </div>

              <div className="py-7 border-b border-[#E7EAE3]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF4E2] flex items-center justify-center">
                    <MapPin size={19} className="text-[#4C7C2B]" />
                  </div>
                  <h2 className="text-[20px] font-bold">Journey Details</h2>
                </div>
                <div className="pl-[52px] text-[13px] text-[#68706A] space-y-2">
                  <p>Category: <span className="font-semibold text-[#202820]">{ride.name}</span></p>
                  <p>Distance: <span className="font-semibold text-[#202820]">{distanceKm?.toFixed(1)} km</span></p>
                  <p>Duration: <span className="font-semibold text-[#202820]">{durationMin} mins</span></p>
                </div>
              </div>

              <div className="py-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF4E2] flex items-center justify-center">
                    <CreditCard size={19} className="text-[#4C7C2B]" />
                  </div>
                  <h2 className="text-[20px] font-bold">Fare Breakdown</h2>
                </div>
                <div className="pl-[52px] text-[13px] text-[#68706A] space-y-3">
                  <div className="flex justify-between w-full max-w-[520px]">
                    <span>Base Fare</span>
                    <span className="font-semibold text-[#202820]">{formatKsh(ride.base)}</span>
                  </div>
                  <div className="flex justify-between w-full max-w-[520px]">
                    <span>Distance &amp; fare adjustment ({distanceKm?.toFixed(1)} km)</span>
                    <span className="font-semibold text-[#202820]">{formatKsh(Math.max(0, ride.price - ride.base))}</span>
                  </div>
                </div>
              </div>

              <div className="ml-[52px] bg-[#EDF6E7] rounded-xl px-6 py-5 flex justify-between items-center max-w-[520px]">
                <span className="text-[17px] font-bold text-[#202820]">Total Paid</span>
                <span className="text-[20px] font-bold text-[#3E7222]">{formatKsh(ride.price)}</span>
              </div>
            </div>

            <svg className="absolute bottom-0 left-0 w-full h-[190px] pointer-events-none" viewBox="0 0 794 190" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 84C95 37 153 150 267 137s167-91 278-63 156 35 249-21v137H0Z" fill="#F2F7EE" />
              <path d="M0 111c103-56 160 65 271 54s170-92 280-63 149 28 243-20" fill="none" stroke="#E3EEDB" strokeWidth="10" />
              <path d="M0 139c100-53 159 48 273 40s173-82 282-56 146 24 239-16" fill="none" stroke="#EAF2E5" strokeWidth="8" />
            </svg>
            <div className="absolute bottom-9 left-0 w-full flex items-center justify-center z-10">
              <div className="w-12 h-px bg-[#DDE5D7] mr-4" />
              <p className="text-[11px] font-medium tracking-wide text-[#8B9387]">Thank you for riding with RydEx.</p>
              <div className="w-12 h-px bg-[#DDE5D7] ml-4" />
            </div>
            <div className="absolute bottom-12 right-12 text-[#75A84B] opacity-15 pointer-events-none">
              <Car size={104} strokeWidth={1.15} />
            </div>

          </div>
        </div>
        {/* ========================================================
            END HIDDEN RECEIPT TEMPLATE
            ======================================================== */}


        {/* Visible UI */}
        <div className="text-center mb-6">
          <CheckCircle2 size={56} className="text-lime mx-auto mb-3" />
          <h2 className="text-3xl font-bold text-white mb-1">Ride Completed</h2>
          <p className="text-white/50 text-sm">Thank you for riding with RydEx</p>
        </div>

        <div className="bg-surface border border-white/10 rounded-2xl p-5 space-y-4 mb-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Receipt className="text-lime" size={20} /> Receipt
            </div>
            <button 
              onClick={downloadReceipt}
              disabled={isGenerating}
              className="flex items-center gap-1.5 text-xs font-semibold bg-lime text-ink hover:brightness-110 px-3 py-1.5 rounded-full transition disabled:opacity-50"
            >
              <Download size={14} /> {isGenerating ? "Generating..." : "Download PDF"}
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-white/70">
              <span>{ride.name} Base Fare</span>
              <span>{formatKsh(ride.base)}</span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>Distance &amp; fare adjustment ({distanceKm?.toFixed(1)} km)</span>
              <span>{formatKsh(Math.max(0, ride.price - ride.base))}</span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>Time ({durationMin} min)</span>
              <span>Included</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-3 flex justify-between items-center">
            <span className="text-lg font-bold text-white">Total Paid</span>
            <span className="text-2xl font-bold text-lime">{formatKsh(ride.price)}</span>
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <Button className="w-full" onClick={onGoBack}>
            Book Another Ride
          </Button>
          <Button variant="outline" className="w-full text-white/70 border-white/10 hover:bg-white/5" onClick={onGoBack}>
            <ArrowLeft size={16} /> Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className={`border rounded-2xl p-6 mb-6 text-center ${status === "searching" ? "bg-white/5 border-white/10" : "bg-lime/10 border-lime/20"}`}>
        <h2 className={`text-2xl font-bold mb-1 ${status === "searching" ? "text-white" : "text-lime"}`}>
          {status === "searching"
            ? "Finding your driver..."
            : status === "matched"
              ? "Driver is on the way"
              : "Ride in progress"}
        </h2>
        <p className="text-white/70 text-sm">
          {status === "searching"
            ? "Please wait a moment"
            : status === "matched"
              ? `Arriving in ${eta} min`
              : "Pickup confirmed. Follow the route to your destination."}
        </p>
      </div>

      {status !== "searching" && driver && (
        <>
          <div className="flex items-center gap-4 bg-ink lg:bg-surface border border-white/10 rounded-2xl p-4 mb-6">
            <img src={driver.avatar} alt={driver.name} className="w-16 h-16 rounded-full border-2 border-lime bg-surface" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">{driver.name}</h3>
              <div className="flex items-center gap-1 text-sm text-white/70">
                <Star size={14} className="text-lime fill-lime" />
                <span>{driver.rating.toFixed(1)}</span>
              </div>
            </div>
            <button className="w-12 h-12 rounded-full bg-lime/20 flex items-center justify-center text-lime hover:bg-lime/30 transition">
              <Phone size={20} />
            </button>
          </div>

          <div className="flex items-center justify-between bg-ink lg:bg-surface border border-white/10 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                {driver.type === "bike"
                  ? <Bike size={20} className="text-white" />
                  : <Car size={20} className="text-white" />}
              </div>
              <div>
                <p className="font-semibold text-white">{driver.car}</p>
                <p className="text-xs text-white/50">{driver.color}</p>
              </div>
            </div>
            <div className="bg-white text-ink font-bold px-3 py-1 rounded-md text-sm tracking-wider">
              {driver.plate}
            </div>
          </div>
        </>
      )}

      <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/50">Total Fare</span>
          <span className="text-xl font-bold text-white">{formatKsh(ride.price)}</span>
        </div>

        {status === "searching" ? (
          <Button variant="danger" className="w-full" onClick={onCancel}>
            Cancel Search
          </Button>
        ) : status === "matched" ? (
          showCancelConfirm ? (
            <div className="space-y-2">
              <p className="text-sm text-center text-red-400 mb-2">Are you sure you want to cancel?</p>
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setShowCancelConfirm(false)}>
                  No, keep ride
                </Button>
                <Button variant="danger" className="flex-1" onClick={onCancel}>
                  Yes, cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-center text-sm text-white/60">When you meet your driver, confirm pickup.</p>
              <Button variant="primary" className="w-full" onClick={onConfirmPickup}>
                <CheckCircle2 size={18} /> Confirm pickup
              </Button>
              <Button variant="outline" className="w-full text-red-400 border-red-400/20 hover:bg-red-400/10" onClick={() => setShowCancelConfirm(true)}>
                Cancel Ride
              </Button>
            </div>
          )
        ) : (
          <Button variant="primary" className="w-full" onClick={() => onComplete(true)}>
            <CheckCircle2 size={18} /> Complete Ride
          </Button>
        )}
      </div>
    </div>
  );
}
