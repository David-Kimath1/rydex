export const MOCK_DRIVERS = [
  {
    id: "d1",
    name: "John Kamau",
    gender: "male",
    rating: 4.9,
    car: "Toyota Premio",
    color: "Silver",
    plate: "KDA 456X",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John&top=shortHairShortFlat&facialHair=beardLight&backgroundColor=B7F34A",
    type: "car"
  },
  {
    id: "d2",
    name: "Mary Wanjiku",
    gender: "female",
    rating: 5.0,
    car: "Mazda Demio",
    color: "White",
    plate: "KCB 123Y",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mary&top=longHairCurvy&backgroundColor=B7F34A",
    type: "car"
  },
  {
    id: "d3",
    name: "David Ochieng",
    gender: "male",
    rating: 4.8,
    car: "Nissan Note",
    color: "Black",
    plate: "KDG 789Z",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David&top=shortHairDreads01&backgroundColor=B7F34A",
    type: "car"
  },
  {
    id: "b1",
    name: "Peter Mwangi",
    gender: "male",
    rating: 4.9,
    car: "Boxer BM150",
    color: "Red",
    plate: "KMDF 123A",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Peter&top=shortHairShortWaved&facialHair=beardMedium&backgroundColor=B7F34A",
    type: "bike"
  },
];

const NEARBY_VEHICLES = [
  { id: "nearby-1", offset: [-0.006, -0.008] },
  { id: "nearby-2", offset: [0.004, -0.011] },
  { id: "nearby-3", offset: [-0.003, 0.009] },
  { id: "nearby-4", offset: [0.008, 0.004] },
];

export function getNearbyVehicles(ride, pickup) {
  if (!ride || !pickup) return [];

  const categoryMarkers = {
    boda: "B",
    economy: "E",
    comfort: "C",
    xl: "XL",
    premium: "P",
  };

  return NEARBY_VEHICLES.map((vehicle) => ({
    ...vehicle,
    type: ride.type,
    name: ride.name,
    marker: categoryMarkers[ride.id] || "R",
    position: [
      pickup.lat + vehicle.offset[0],
      pickup.lng + vehicle.offset[1],
    ],
  }));
}
