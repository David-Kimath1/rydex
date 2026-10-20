import test from "node:test";
import assert from "node:assert/strict";
import { calculateFares } from "../src/utils/fareCalculator.js";

test("calculates fares using KSh 10 increments and category minimums", () => {
  const fares = calculateFares(1);
  const boda = fares.find((fare) => fare.id === "boda");

  assert.equal(boda.price, 80);
  assert.equal(fares.find((fare) => fare.id === "economy").price, 140);
  assert.ok(fares.every((fare) => fare.price >= fare.base));
  assert.ok(fares.every((fare) => fare.price % 10 === 0));
});

test("keeps the Boda fare at or below 90% of the same-route Economy fare", () => {
  for (const distanceKm of [0.1, 1, 5, 15, 100]) {
    const fares = calculateFares(distanceKm);
    const boda = fares.find((fare) => fare.id === "boda");
    const economy = fares.find((fare) => fare.id === "economy");

    assert.ok(boda.price <= Math.floor((economy.price * 0.9) / 10) * 10);
  }
});

test("rejects invalid route distances instead of returning misleading fares", () => {
  for (const distance of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => calculateFares(distance), RangeError);
  }
});
