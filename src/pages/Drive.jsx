import { useState } from "react";
import { DollarSign, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";
import Button from "../components/ui/Button";

export default function Drive() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", vehicle: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.vehicle) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-ink text-white py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-10 sm:space-y-16">
        
        <div className="text-center max-w-2xl mx-auto space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Drive with <span className="text-lime">RydEx</span>
          </h1>
          <p className="text-white/60 text-base sm:text-lg">
            Earn money on your schedule. Turn your car into an opportunity and join the future of urban mobility.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {[
            { icon: DollarSign, title: "Competitive Earnings", desc: "Get paid fairly for every trip with transparent pricing." },
            { icon: Clock, title: "Flexible Hours", desc: "Drive whenever it suits you. No shifts, no bosses." },
            { icon: ShieldCheck, title: "Safety readiness", desc: "Driver verification, emergency response, and insurance workflows must be in place before launch." }
          ].map((item, i) => (
            <div key={i} className="bg-surface border border-white/10 rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-lime/10 flex items-center justify-center">
                <item.icon size={24} className="text-lime" />
              </div>
              <h3 className="font-bold text-lg">{item.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="max-w-xl mx-auto bg-surface border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8">
          {submitted ? (
            <div className="text-center space-y-4 py-8 animate-in fade-in zoom-in-95">
              <CheckCircle2 size={56} className="text-lime mx-auto" />
              <h2 className="text-2xl font-bold">Thank you</h2>
              <p className="text-white/60 text-sm sm:text-base">
                Thanks for your interest, {formData.name}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">Apply to Drive</h2>
                <p className="text-white/50 text-sm mt-1">Share your details to express interest in driving with RydEx.</p>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-ink border border-white/10 rounded-xl px-4 py-3 text-white focus:border-lime focus:outline-none"
                  placeholder="e.g. John Kamau"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1.5">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-ink border border-white/10 rounded-xl px-4 py-3 text-white focus:border-lime focus:outline-none"
                  placeholder="e.g. +254 700 000 000"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1.5">Vehicle Make & Model</label>
                <input 
                  type="text" 
                  required
                  value={formData.vehicle}
                  onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                  className="w-full bg-ink border border-white/10 rounded-xl px-4 py-3 text-white focus:border-lime focus:outline-none"
                  placeholder="e.g. Toyota Premio 2018"
                />
              </div>

              <Button type="submit" className="w-full mt-2">
                Submit Application
              </Button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
