import { useState } from "react";
import { Search, ChevronDown, HelpCircle, MessageSquare } from "lucide-react";

const FAQS = [
  {
    q: "How do I book a ride?",
    a: "Enter your pickup location and destination in the search fields. Select the ride category that fits your needs, review the fare, and tap 'Confirm' to match with a driver."
  },
  {
    q: "How are the estimated fares calculated?",
    a: "Estimates use the road-route distance, a category base fare, and a per-kilometer rate, rounded to the nearest KSh 10. Boda has a KSh 50 minimum and is capped at 90% of the Economy estimate for the same route."
  },
  {
    q: "How do I cancel a ride?",
    a: "If you need to cancel, tap the 'Cancel Ride' button on the driver tracking screen. Please note that cancellations are subject to our standard policy."
  },
  {
    q: "Where can I see my ride history?",
    a: "Navigate to the 'Activity' tab in the top menu. Here you will find a list of all your past and cancelled trips, along with downloadable receipts."
  },
  {
    q: "How do I install the RydEx app?",
    a: "RydEx is a Progressive Web App. On Android or Desktop Chrome, you can tap the 'Install' button in the navigation bar, or use your browser's 'Add to Home Screen' option."
  },
  {
    q: "Can I use the app offline?",
    a: "Yes, once the app shell has loaded, you can access your ride history and profile offline. Booking a new ride requires an active internet connection."
  }
];

export default function Help() {
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  const filteredFaqs = FAQS.filter(
    (faq) => faq.q.toLowerCase().includes(query.toLowerCase()) || faq.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-ink text-white py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div className="text-center space-y-3">
          <HelpCircle size={48} className="text-lime mx-auto" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">How can we help?</h1>
          <p className="text-white/50 text-sm sm:text-base">Search our knowledge base for answers.</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input 
            type="text"
            placeholder="Search for answers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-surface border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-lime focus:outline-none transition shadow-lg"
          />
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-surface border border-white/10 rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left font-medium hover:bg-white/5 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown 
                    size={20} 
                    className={`text-white/50 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                <div 
                  className={`px-5 pb-5 text-sm text-white/60 leading-relaxed overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 pb-0'
                  }`}
                >
                  {faq.a}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-surface border border-white/10 rounded-2xl">
              <MessageSquare size={32} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/50">No results found for "{query}"</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
