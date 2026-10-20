const RIDES_KEY = "rydex_rides";

export function getRides() {
  try {
    const data = localStorage.getItem(RIDES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to parse ride history", error);
    return [];
  }
}

export function saveRide(ride) {
  try {
    const rides = getRides();
    const updated = [ride, ...rides];
    localStorage.setItem(RIDES_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error("Failed to save ride", error);
    return false;
  }
}

export function clearRides() {
  localStorage.removeItem(RIDES_KEY);
}
