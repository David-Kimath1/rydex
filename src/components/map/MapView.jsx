import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pickupIcon = L.divIcon({
  className: "bg-transparent",
  html: `<div class="map-dot-loader"><div class="circle"><div class="dot"></div><div class="outline"></div></div></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const destIcon = L.divIcon({
  className: "bg-transparent",
  html: `<div class="map-pin-loader"></div>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42]
});

function MapController({
  pickup,
  destination,
  routeCoords,
  isFocusingDest,
  selectedRide,
  nearbyVehicles,
  bookingStatus,
}) {
  const map = useMap();

  useEffect(() => {
    const mobileMap = window.matchMedia("(max-width: 1023px)").matches;
    const mobileBottomPadding = mobileMap ? Math.min(window.innerHeight * 0.58, 460) : 50;

    if (bookingStatus === "in_ride" && routeCoords?.length > 0) {
      map.fitBounds(L.latLngBounds(routeCoords), {
        paddingTopLeft: [50, 50],
        paddingBottomRight: [50, mobileBottomPadding],
      });
    } else if (selectedRide && pickup) {
      const vehiclePoints = nearbyVehicles.map((vehicle) => vehicle.position);
      const locations = [[pickup.lat, pickup.lng], ...vehiclePoints];
      map.fitBounds(L.latLngBounds(locations), {
        paddingTopLeft: [45, 45],
        paddingBottomRight: [45, mobileBottomPadding],
        maxZoom: 15,
      });
    } else if (routeCoords && routeCoords.length > 0) {
      map.fitBounds(L.latLngBounds(routeCoords), {
        paddingTopLeft: [50, 50],
        paddingBottomRight: [50, mobileBottomPadding],
      });
    } else if (pickup && destination) {
      map.fitBounds(L.latLngBounds([pickup.lat, pickup.lng], [destination.lat, destination.lng]), {
        paddingTopLeft: [50, 50],
        paddingBottomRight: [50, mobileBottomPadding],
      });
    } else if (pickup) {
      map.setView([pickup.lat, pickup.lng], 14);
    } else if (destination) {
      map.setView([destination.lat, destination.lng], 14);
    } else if (isFocusingDest) {
      map.setView([-1.2863, 36.8172], 11);
    }
  }, [pickup, destination, routeCoords, map, isFocusingDest, selectedRide, nearbyVehicles, bookingStatus]);

  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function MapView({ 
  pickup, 
  destination, 
  routeCoords, 
  isSearching, 
  isFocusingDest, 
  selectedRide,
  nearbyVehicles = [],
  bookingStatus,
  onMapClick,
  activeSelection 
}) {
  const center = [-1.2863, 36.8172];
  const [mapType, setMapType] = useState("satellite");

  const cursorClass = activeSelection === 'pickup' 
    ? 'cursor-pickup' 
    : activeSelection === 'destination' 
      ? 'cursor-destination' 
      : '';

  return (
    <div className={`w-full h-full min-h-[300px] rounded-2xl overflow-hidden relative z-0 border border-white/10 ${mapType === 'standard' ? 'map-standard' : ''} ${cursorClass}`}>
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        {mapType === "standard" && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        {mapType === "satellite" && (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}
        
        {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />}
        {destination && <Marker position={[destination.lat, destination.lng]} icon={destIcon} />}
        {selectedRide && bookingStatus === "idle" && nearbyVehicles.map((vehicle, index) => (
          <Marker
            key={vehicle.id}
            position={vehicle.position}
            icon={L.divIcon({
              className: "nearby-vehicle-icon",
              html: `<div class="nearby-vehicle-marker" role="img" aria-label="${vehicle.name} option ${index + 1}">${vehicle.marker}</div>`,
              iconSize: [34, 34],
              iconAnchor: [17, 17],
            })}
            title={`${vehicle.name} option ${index + 1}`}
          />
        ))}
        
        {routeCoords && routeCoords.length > 0 && (
          <>
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: "#0B0B0B", weight: 9, opacity: 0.85, lineCap: "round" }}
          />
          <Polyline 
            positions={routeCoords} 
            pathOptions={{ color: "#B7F34A", weight: 5, opacity: 0.95, lineCap: "round" }} 
          />
          </>
        )}

        <MapController
          pickup={pickup}
          destination={destination}
          routeCoords={routeCoords}
          isFocusingDest={isFocusingDest}
          selectedRide={selectedRide}
          nearbyVehicles={nearbyVehicles}
          bookingStatus={bookingStatus}
        />
        
        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
      </MapContainer>

      <div className="absolute top-4 right-4 z-[400] bg-surface/90 backdrop-blur border border-white/10 rounded-xl p-1 flex flex-col gap-1 shadow-lg">
        <button onClick={() => setMapType("standard")} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${mapType === 'standard' ? 'bg-lime text-ink' : 'text-white/70 hover:bg-white/10'}`}>Standard</button>
        <button onClick={() => setMapType("satellite")} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${mapType === 'satellite' ? 'bg-lime text-ink' : 'text-white/70 hover:bg-white/10'}`}>Satellite</button>
      </div>

      {selectedRide && bookingStatus === "idle" && nearbyVehicles.length > 0 && (
        <div className="absolute top-4 left-4 z-[400] rounded-xl border border-white/10 bg-surface/90 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur">
          {nearbyVehicles.length} {selectedRide.name} options nearby
        </div>
      )}

      {isSearching && (
        <div className="absolute inset-0 z-[1000] bg-ink/70 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none">
          <div className="loader map-dot-loader scale-150">
            <div className="circle"><div className="dot"></div><div className="outline"></div></div>
          </div>
          <p className="mt-8 text-lime font-semibold animate-pulse text-lg">Finding your driver...</p>
        </div>
      )}
    </div>
  );
}
