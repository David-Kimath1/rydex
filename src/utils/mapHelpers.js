export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
      headers: {
        'Accept-Language': 'en'
      }
    });
    const data = await res.json();
    
    if (data && data.display_name) {
      // Get the most specific part of the address
      const parts = data.display_name.split(',');
      const name = parts.length > 1 ? `${parts[0].trim()}, ${parts[1].trim()}` : parts[0].trim();
      return {
        id: `map-${Date.now()}`,
        name: name,
        lat,
        lng
      };
    }
  } catch (error) {
    console.warn("Reverse geocoding failed", error);
  }
  
  // Fallback if API fails or is rate-limited
  return {
    id: `map-${Date.now()}`,
    name: `Dropped Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    lat,
    lng
  };
}
