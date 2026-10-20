import { useState } from "react";
import { Building2, Plane, Users, CheckCircle2 } from "lucide-react";
import Button from "../components/ui/Button";

export default function Business() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ company: "", email: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.company || !formData.email) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-ink text-white py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-10 sm:space-y-16">
        
        <div className="text-center max-w-2xl mx-auto space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            RydEx for <span className="text-lime">Business</span>
          </h1>
          <p className="text-white/60 text-base sm:text-lg">
            Streamline your company's travel. Provide reliable, safe, and seamless transport for your employees and clients.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {[
            { icon: Building2, title: "Employee Commutes", desc: "Centralized billing and scheduling for daily staff transport." },
            { icon: Plane, title: "Executive Travel", desc: "Premium airport transfers and client pickups with top-rated drivers." },
            { icon: Users, title: "Group Transport", desc: "Book XL vehicles for team events, conferences, and offsites." }
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
                Thanks for your interest, {formData.company}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">Partner with Us</h2>
                <p className="text-white/50 text-sm mt-1">Tell us about your organization’s transport needs.</p>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1.5">Company Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full bg-ink border border-white/10 rounded-xl px-4 py-3 text-white focus:border-lime focus:outline-none"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1.5">Work Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-ink border border-white/10 rounded-xl px-4 py-3 text-white focus:border-lime focus:outline-none"
                  placeholder="e.g. travel@acmecorp.com"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1.5">How can we help? (Optional)</label>
                <textarea 
                  rows="3"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-ink border border-white/10 rounded-xl px-4 py-3 text-white focus:border-lime focus:outline-none resize-none"
                  placeholder="Tell us about your transport needs..."
                ></textarea>
              </div>

              <Button type="submit" className="w-full mt-2">
                Send Enquiry
              </Button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
