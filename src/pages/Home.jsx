import { useState, useCallback, useRef, useMemo } from "react";
import { ArrowUpDown, ArrowRight, Bike, CarFront, Car, Van, Gem, MapPin, Clock3, Users, LocateFixed, Navigation } from "lucide-react";
import LocationInput from "../components/booking/LocationInput";
import MapView from "../components/map/MapView";
import Button from "../components/ui/Button";
import DriverPanel from "../components/booking/DriverPanel";
import { calculateFares, formatKsh } from "../utils/fareCalculator";
import { generateBookingRef } from "../utils/formatters";
import { saveRide } from "../services/storage";
import { MOCK_DRIVERS, getNearbyVehicles } from "../data/drivers";
import { reverseGeocode } from "../utils/mapHelpers";

const RIDE_ICONS = {
  boda: Bike,
  economy: CarFront,
  comfort: Car,
  xl: Van,
  premium: Gem,
};

export default function Home() {
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  
  const [routeData, setRouteData] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState("");
  const routeRequestId = useRef(0);
  const [fares, setFares] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const confirmRideButtonRef = useRef(null);
  
  const [isFocusingDest, setIsFocusingDest] = useState(false);
  const [activeSelection, setActiveSelection] = useState("pickup");

  const [bookingStatus, setBookingStatus] = useState("idle");
  const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [assignedDriver, setAssignedDriver] = useState(null);
  const [eta, setEta] = useState(3);
  const nearbyVehicles = useMemo(
    () => getNearbyVehicles(selectedRide, pickup),
    [selectedRide, pickup]
  );

  const handleSelectRide = (ride) => {
    setSelectedRide(ride);
    requestAnimationFrame(() => {
      confirmRideButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const clearRoute = () => {
    routeRequestId.current += 1;
    setRouteData(null);
    setFares([]);
    setSelectedRide(null);
    setRouteError("");
    setLoadingRoute(false);
  };

  const fetchRouteAndFares = useCallback(async (startLoc, endLoc) => {
    if (!startLoc || !endLoc) return;

    const requestId = ++routeRequestId.current;
    setLoadingRoute(true);
    setSelectedRide(null);
    setRouteData(null);
    setFares([]);
    setRouteError("");

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${startLoc.lng},${startLoc.lat};${endLoc.lng},${endLoc.lat}?overview=full&geometries=geojson&alternatives=true`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Routing service returned ${res.status}.`);
      const data = await res.json();

      if (data.code === "Ok" && data.routes?.length > 0) {
        const fastestRoute = data.routes.sort((a, b) => a.duration - b.duration)[0];
        const distanceKm = fastestRoute.distance / 1000;
        const durationMin = Math.ceil(fastestRoute.duration / 60);
        const coords = fastestRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

        if (requestId !== routeRequestId.current) return;
        if (!Number.isFinite(distanceKm) || distanceKm <= 0 || coords.length < 2) {
          throw new Error("Routing service returned an invalid route.");
        }
        setRouteData({ distanceKm, durationMin, coords });
        setFares(calculateFares(distanceKm));
      } else {
        throw new Error(data.message || "No driving route was found between these locations.");
      }
    } catch (error) {
      if (requestId !== routeRequestId.current) return;
      console.error("Routing failed", error);
      setRouteError("We couldn't calculate a reliable road route. Please try again.");
    } finally {
      if (requestId === routeRequestId.current) setLoadingRoute(false);
    }
  }, []);

  const handlePickupChange = (location) => {
    setPickup(location);
    clearRoute();
    if (location && destination) fetchRouteAndFares(location, destination);
  };

  const handleDestinationChange = (location) => {
    setDestination(location);
    clearRoute();
    if (pickup && location) fetchRouteAndFares(pickup, location);
  };

  const handleSeePrices = () => {
    if (routeData || loadingRoute) return;
    fetchRouteAndFares(pickup, destination);
  };

  const handleMapClick = async (lat, lng) => {
    if (bookingStatus !== "idle") return; 

    const loc = await reverseGeocode(lat, lng);
    
    if (activeSelection === 'pickup') {
      handlePickupChange(loc);
    } else {
      handleDestinationChange(loc);
    }
  };

  const handleSwap = () => {
    const newPickup = destination;
    const newDest = pickup;
    setPickup(newPickup);
    setDestination(newDest);
    clearRoute();
    if (newPickup && newDest) fetchRouteAndFares(newPickup, newDest);
  };

  const handleConfirmRide = () => {
    if (!selectedRide || !routeData) return;
    
    setBookingStatus("searching");
    
    setTimeout(() => {
      // Filter drivers based on selected ride type (bike vs car)
      const availableDrivers = MOCK_DRIVERS.filter(d => d.type === selectedRide.type);
      const driverPool = availableDrivers.length > 0 ? availableDrivers : MOCK_DRIVERS;
      const driver = driverPool[Math.floor(Math.random() * driverPool.length)];
      
      const newEta = selectedRide.type === 'bike' ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 5) + 2;
      
      const bookingData = {
        id: generateBookingRef(),
        date: new Date().toISOString(),
        pickup,
        destination,
        ride: selectedRide,
        distanceKm: routeData.distanceKm,
        durationMin: routeData.durationMin,
        status: "matched",
      };

      setAssignedDriver(driver);
      setEta(newEta);
      setCurrentBooking(bookingData);
      setBookingStatus("matched");
    }, 3000);
  };

  const handleCancel = () => {
    if (currentBooking) {
      saveRide({ ...currentBooking, status: "cancelled" });
    }
    setBookingStatus("idle");
    setCurrentBooking(null);
    setAssignedDriver(null);
  };

  const handleConfirmPickup = () => {
    setBookingStatus("in_ride");
    setCurrentBooking((booking) => booking ? { ...booking, status: "in_progress" } : booking);
  };

  const handleComplete = (playChime = false) => {
    if (playChime) {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio play blocked", e));
      
      if (currentBooking) {
        saveRide({ ...currentBooking, status: "completed" });
      }
      setBookingStatus("completed");
    } else {
      resetFlow();
    }
  };

  const resetFlow = () => {
    setBookingStatus("idle");
    setCurrentBooking(null);
    setAssignedDriver(null);
    setPickup(null);
    setDestination(null);
    clearRoute();
    setActiveSelection("pickup");
  };

  return (
    <div className="relative h-[calc(100dvh-64px)] w-full overflow-hidden bg-ink">
      
      <div className="absolute inset-0 p-0">
        <MapView 
          pickup={pickup} 
          destination={destination} 
          routeCoords={routeData?.coords} 
          isSearching={bookingStatus === "searching"}
          isFocusingDest={isFocusingDest}
          selectedRide={selectedRide}
          nearbyVehicles={nearbyVehicles}
          bookingStatus={bookingStatus}
          onMapClick={handleMapClick}
          activeSelection={activeSelection}
        />
        {bookingStatus === "idle" && !selectedRide && (
          <div className="absolute bottom-[74%] lg:bottom-6 left-1/2 -translate-x-1/2 z-[400] bg-ink/80 backdrop-blur border border-white/10 px-4 py-2 rounded-full pointer-events-none text-xs text-white/70 flex items-center gap-2 shadow-lg hidden sm:flex">
            <MapPin size={14} className="text-lime" /> Click anywhere on the map to set your location
          </div>
        )}
      </div>

      <div className={`absolute bottom-2 left-2 right-2 mx-auto ${isBookingSheetOpen ? "max-h-[58dvh]" : "max-h-14"} w-full max-w-2xl bg-ink/95 backdrop-blur-xl border border-white/10 flex flex-col z-10 shadow-2xl overflow-hidden rounded-3xl transition-[max-height] duration-500 ease-in-out`}>
        <button
          type="button"
          aria-expanded={isBookingSheetOpen}
          aria-label={isBookingSheetOpen ? "Collapse ride booking panel" : "Open ride booking panel"}
          onClick={() => setIsBookingSheetOpen((open) => !open)}
          className="flex w-full shrink-0 items-center justify-center px-4 py-4 text-white"
        >
          <span className="h-1 w-10 rounded-full bg-white/35" />
        </button>

        <div className={`${isBookingSheetOpen ? "max-h-[calc(58dvh-56px)] opacity-100" : "pointer-events-none max-h-0 opacity-0"} overflow-y-auto hide-scrollbar transition-[max-height,opacity] duration-500 ease-in-out`}>
        <div className="px-4 pb-5 sm:p-6 space-y-4 sm:space-y-6">
          {bookingStatus === "idle" ? (
            <>
              <div className="flex items-center justify-between lg:block">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Book A Ryd?
                  </h1>
                </div>
                {pickup && (
                  <span className="flex items-center gap-1.5 rounded-full bg-lime/10 px-2.5 py-1.5 text-[11px] font-medium text-lime lg:hidden">
                    <LocateFixed size={13} /> Pickup set
                  </span>
                )}
              </div>

              <div className="relative rounded-2xl bg-white/[0.04] p-3">
                <div className="absolute left-[26px] top-[37px] bottom-[37px] border-l border-dashed border-white/25" />
                <div className="space-y-2.5">
                  <LocationInput 
                    placeholder="Pickup location" 
                    value={pickup} 
                    onChange={handlePickupChange} 
                    isPickup={true}
                    allowCurrentLocation={true}
                    onFocus={() => {
                      setIsFocusingDest(false);
                      setActiveSelection("pickup");
                    }}
                  />
                  <LocationInput 
                    placeholder="Where to?" 
                    value={destination} 
                    onChange={handleDestinationChange} 
                    iconColor="text-white"
                    allowCurrentLocation={false}
                    onFocus={() => {
                      setIsFocusingDest(true);
                      setActiveSelection("destination");
                    }}
                  />
                </div>
                
                <button 
                  onClick={handleSwap}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-surface lg:bg-ink border border-white/10 hover:bg-white/10 rounded-full transition z-20"
                  aria-label="Swap locations"
                >
                  <ArrowUpDown size={16} />
                </button>
              </div>

              {!routeData && (
                <Button 
                  className="w-full" 
                  onClick={handleSeePrices}
                  disabled={!pickup || !destination || loadingRoute}
                >
                  {loadingRoute ? "Calculating route..." : routeError ? "Try again" : "See prices"}
                  {!loadingRoute && <ArrowRight size={18} />}
                </Button>
              )}

              {routeError && (
                <p role="alert" className="text-sm text-red-400">{routeError}</p>
              )}

              {fares.length > 0 && routeData && (
                <div className="space-y-3 pt-3 border-t border-white/10 pb-2 lg:pb-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-white/60"><Navigation size={13} /> {routeData.distanceKm.toFixed(1)} km</span>
                    <span className="flex items-center gap-1.5 text-white/60"><Clock3 size={13} /> {routeData.durationMin} min</span>
                  </div>

                  <div className="space-y-3">
                    {fares.map((ride) => {
                      const RideIcon = RIDE_ICONS[ride.id] ?? CarFront;
                      return (
                      <button
                        key={ride.id}
                        onClick={() => handleSelectRide(ride)}
                        className={`w-full text-left px-3 py-3 sm:p-4 rounded-2xl border transition-all flex items-center justify-between ${
                          selectedRide?.id === ride.id 
                            ? "border-lime bg-lime/5" 
                            : "border-white/10 hover:border-white/30 bg-ink lg:bg-surface"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex-shrink-0 flex items-center justify-center ${
                            selectedRide?.id === ride.id ? "bg-lime text-ink" : "bg-white/[0.07] text-lime"
                          }`}>
                            <RideIcon size={23} strokeWidth={1.8} aria-hidden="true" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white flex items-center gap-2">
                              {ride.name}
                            </h3>
                            <p className="text-[11px] text-white/50 flex items-center gap-1.5 mt-1">
                              <Users size={12} /> {ride.capacity} {ride.capacity === 1 ? "seat" : "seats"}
                              <span className="text-white/25">·</span>
                              {ride.desc}
                            </p>
                          </div>
                        </div>
                        <div className="text-right pl-2">
                          <p className="font-bold text-white whitespace-nowrap">{formatKsh(ride.price)}</p>
                          <p className="text-[10px] text-white/40 mt-1">fare estimate</p>
                        </div>
                      </button>
                      );
                    })}
                  </div>

                  <div ref={confirmRideButtonRef} className="pt-1 pb-1">
                    <Button
                      className="w-full"
                      disabled={!selectedRide}
                      onClick={handleConfirmRide}
                    >
                      Confirm {selectedRide ? selectedRide.name : "ride"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <DriverPanel 
              status={bookingStatus}
              driver={assignedDriver}
              ride={selectedRide}
              eta={eta}
              distanceKm={routeData?.distanceKm}
              durationMin={routeData?.durationMin}
              bookingId={currentBooking?.id}
              onCancel={handleCancel}
              onComplete={handleComplete}
              onConfirmPickup={handleConfirmPickup}
              onGoBack={() => handleComplete(false)}
            />
          )}

        </div>
      </div>
      </div>

    </div>
  );
}
