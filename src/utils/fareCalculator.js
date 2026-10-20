export const RIDE_CATEGORIES = [
  { 
    id: "boda", 
    name: "RydEx Boda", 
    base: 50, 
    rate: 25, 
    capacity: 1, 
    desc: "Quick trips through the city",
    type: "bike",
  },
  { 
    id: "economy", 
    name: "RydEx Economy", 
    base: 100, 
    rate: 35, 
    capacity: 4, 
    desc: "Affordable everyday rides",
    type: "car",
  },
  { 
    id: "comfort", 
    name: "RydEx Comfort", 
    base: 150, 
    rate: 45, 
    capacity: 4, 
    desc: "Newer cars, extra legroom",
    type: "car",
  },
  { 
    id: "xl", 
    name: "RydEx XL", 
    base: 200, 
    rate: 60, 
    capacity: 6, 
    desc: "Larger cars for groups",
    type: "car",
  },
  { 
    id: "premium", 
    name: "RydEx Premium", 
    base: 300, 
    rate: 80, 
    capacity: 4, 
    desc: "Luxury vehicles, top-rated drivers",
    type: "car",
  },
];

const FARE_ROUNDING_INCREMENT = 10;
const BODA_ECONOMY_MAX_RATIO = 0.9;

function roundFare(amount) {
  return Math.round(amount / FARE_ROUNDING_INCREMENT) * FARE_ROUNDING_INCREMENT;
}

export function calculateFares(distanceKm) {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    throw new RangeError("Distance must be a positive, finite number of kilometers.");
  }

  const fares = RIDE_CATEGORIES.map((category) => ({
    ...category,
    price: Math.max(category.base, roundFare(category.base + distanceKm * category.rate)),
  }));

  const boda = fares.find((fare) => fare.id === "boda");
  const economy = fares.find((fare) => fare.id === "economy");
  const bodaCeiling = Math.floor((economy.price * BODA_ECONOMY_MAX_RATIO) / FARE_ROUNDING_INCREMENT)
    * FARE_ROUNDING_INCREMENT;

  boda.price = Math.min(boda.price, bodaCeiling);
  boda.cappedAtEconomyRatio = boda.price < roundFare(boda.base + distanceKm * boda.rate);

  return fares;
}

export function formatKsh(amount) {
  return `KSh ${amount.toLocaleString()}`;
}
