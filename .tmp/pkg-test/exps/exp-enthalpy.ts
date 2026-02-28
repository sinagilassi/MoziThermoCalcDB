import type { Temperature } from "mozithermodb-settings";
import {
  En_IG_NASA7_polynomial,
  En_IG_NASA7_polynomial_range,
  En_IG_NASA9_polynomial,
  En_IG_shomate,
  calc_En_IG,
  dEn_IG_NASA7_polynomial,
} from "mozithermocalcdb";

const T: Temperature = { value: 500, unit: "K" };
const TRange: [Temperature, Temperature] = [
  { value: 200, unit: "K" },
  { value: 1200, unit: "K" },
];

// Example NASA7 coefficients (demo only)
const nasa7 = {
  a1: 3.78245636,
  a2: -2.99673416e-3,
  a3: 9.84730201e-6,
  a4: -9.68129509e-9,
  a5: 3.24372837e-12,
  a6: -1063.94356,
  a7: 3.65767573,
};

// Example NASA9 coefficients (demo only)
const nasa9 = {
  a1: 1.0e4,
  a2: -2.0e2,
  a3: 3.5,
  a4: 1.0e-3,
  a5: -2.0e-7,
  a6: 3.0e-11,
  a7: -1.0e-15,
  b1: -1.2e3,
  b2: 5.0,
};

// Example Shomate coefficients (demo only)
const shomate = {
  A: 30.09200,
  B: 6.832514,
  C: 6.793435,
  D: -2.534480,
  E: 0.082139,
  F: -250.8810,
  G: 223.3967,
};

console.log("En_IG_NASA7_polynomial:", En_IG_NASA7_polynomial(
  nasa7.a1, nasa7.a2, nasa7.a3, nasa7.a4, nasa7.a5, nasa7.a6, nasa7.a7,
  T, TRange, "J/mol"
));

console.log("En_IG_NASA7_polynomial_range:", En_IG_NASA7_polynomial_range(
  nasa7.a1, nasa7.a2, nasa7.a3, nasa7.a4, nasa7.a5, nasa7.a6, nasa7.a7,
  { value: 300, unit: "K" }, { value: 900, unit: "K" }, 5, TRange
));

console.log("dEn_IG_NASA7_polynomial:", dEn_IG_NASA7_polynomial(
  nasa7.a1, nasa7.a2, nasa7.a3, nasa7.a4, nasa7.a5, nasa7.a6, nasa7.a7,
  { value: 300, unit: "K" }, { value: 800, unit: "K" }, TRange
));

console.log("En_IG_NASA9_polynomial:", En_IG_NASA9_polynomial(
  nasa9.a1, nasa9.a2, nasa9.a3, nasa9.a4, nasa9.a5, nasa9.a6, nasa9.a7, nasa9.b1, nasa9.b2,
  T, TRange
));

console.log("En_IG_shomate:", En_IG_shomate(
  shomate.A, shomate.B, shomate.C, shomate.D, shomate.E, shomate.F, shomate.G,
  T, TRange
));

console.log("calc_En_IG (dispatcher NASA7):", calc_En_IG("NASA7", {
  temperature: T,
  temperature_range: TRange,
  output_unit: "J/mol",
  ...nasa7,
}));

console.log("calc_En_IG (dispatcher Shomate):", calc_En_IG("Shomate", {
  temperature: T,
  temperature_range: TRange,
  ...shomate,
}));
