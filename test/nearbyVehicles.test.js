import test from "node:test";
import assert from "node:assert/strict";
import { getNearbyVehicles } from "../src/data/drivers.js";

test("returns several nearby markers for the selected ride category", () => {
  const pickup = { lat: -1.2863, lng: 36.8172 };
  const vehicles = getNearbyVehicles(
    { id: "boda", name: "RydEx Boda", type: "bike" },
    pickup
  );

  assert.equal(vehicles.length, 4);
  assert.ok(vehicles.every((vehicle) => vehicle.type === "bike"));
  assert.ok(vehicles.every((vehicle) => vehicle.name === "RydEx Boda"));
  assert.ok(vehicles.every((vehicle) => vehicle.marker === "B"));
  assert.ok(vehicles.every((vehicle) => vehicle.position[0] !== pickup.lat || vehicle.position[1] !== pickup.lng));
});

test("does not show vehicle markers until a ride and pickup are selected", () => {
  assert.deepEqual(getNearbyVehicles(null, { lat: -1, lng: 36 }), []);
  assert.deepEqual(getNearbyVehicles({ id: "economy", type: "car" }, null), []);
});
