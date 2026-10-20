import { useState, useRef, useEffect } from "react";
import { MapPin, Search, LocateFixed, X } from "lucide-react";
import { NAIROBI_LOCATIONS } from "../../data/locations";

export default function LocationInput({
  placeholder,
  value,
  onChange,
  iconColor = "text-white",
  allowCurrentLocation = false,
  isPickup = false,
  onFocus
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(() => ({ value, text: value?.name || "" }));
  const [locationError, setLocationError] = useState("");
  const query = search.value === value ? search.text : value?.name || "";
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = (e) => {
    e.stopPropagation();
    setSearch({ value: null, text: "" });
    onChange(null);
    setIsOpen(false);
  };

  const handleCurrentLocation = () => {
    setLocationError("");
    if (!("geolocation" in navigator)) {
      setLocationError("Location is not supported by this browser. Choose a pickup on the map.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          id: "current",
          name: "Your Location",
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setSearch({ value: loc, text: loc.name });
        onChange(loc);
        setIsOpen(false);
      },
      (error) => {
        const message = error.code === 1
          ? "Location permission was denied. Choose a pickup on the map."
          : "Couldn't determine your location. Try again or choose a pickup on the map.";
        setLocationError(message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const filtered = NAIROBI_LOCATIONS.filter((loc) =>
    loc.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative flex items-center">
        
        {/* Custom Pickup Icon vs Standard Pin */}
        {isPickup ? (
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <div className="map-dot-loader" style={{ transform: 'scale(0.6)' }}>
              <div className="circle"><div className="dot"></div><div className="outline"></div></div>
            </div>
          </div>
        ) : (
          <MapPin size={18} className={`absolute left-4 ${iconColor}`} />
        )}

        <input
          type="text"
          value={query}
          onChange={(e) => {
            const text = e.target.value;
            setSearch({ value: null, text });
            setIsOpen(true);
            if (value) onChange(null);
          }}
          onFocus={() => {
            setIsOpen(true);
            if (onFocus) onFocus();
          }}
          placeholder={placeholder}
          className="w-full bg-ink lg:bg-surface text-white h-12 pl-12 pr-12 rounded-xl border border-white/10 focus:border-lime focus:outline-none transition"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-12 p-1.5 text-grey hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-[1000] w-full mt-2 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto hide-scrollbar">
          
          {allowCurrentLocation && (
            <button
              onClick={handleCurrentLocation}
              className="w-full text-left px-4 py-3 bg-lime/10 hover:bg-lime/20 flex items-center gap-3 transition border-b border-white/5"
            >
              <LocateFixed size={16} className="text-lime" />
              <span className="text-sm font-semibold text-lime">Use Your Location</span>
            </button>
          )}
          {locationError && (
            <p role="alert" className="px-4 py-3 text-xs text-red-400 border-b border-white/5">
              {locationError}
            </p>
          )}

          {filtered.length > 0 ? (
            filtered.map((loc) => (
              <button
                key={loc.id}
                onClick={() => {
                  setSearch({ value: loc, text: loc.name });
                  onChange(loc);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 transition border-b border-white/5 last:border-0"
              >
                <Search size={16} className="text-grey" />
                <span className="text-sm font-medium text-white">{loc.name}</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-grey text-center">No locations found</div>
          )}
        </div>
      )}
    </div>
  );
}
