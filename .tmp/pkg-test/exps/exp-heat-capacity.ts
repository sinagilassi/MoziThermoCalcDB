import type { Temperature } from "mozithermodb-settings";
import {
  Cp_IG,
  Cp_IG_NASA7_polynomial,
  Cp_IG_NASA9_polynomial,
  Cp_IG_polynomial,
  Cp_IG_shomate,
} from "mozithermocalcdb";

const T: Temperature = { value: 500, unit: "K" };
const TRange: [Temperature, Temperature] = [
  { value: 200, unit: "K" },
  { value: 1200, unit: "K" },
];

console.log("Cp_IG_polynomial:", Cp_IG_polynomial(
  25.0, 1.0e-2, -1.0e-5, 2.0e-9, 1.0e5,
  T,
  TRange,
));

console.log("Cp_IG_NASA7_polynomial:", Cp_IG_NASA7_polynomial(
  3.78245636, -2.99673416e-3, 9.84730201e-6, -9.68129509e-9, 3.24372837e-12, -1063.94356, 3.65767573,
  T,
  TRange,
));

console.log("Cp_IG_NASA9_polynomial:", Cp_IG_NASA9_polynomial(
  1.0e4, -2.0e2, 3.5, 1.0e-3, -2.0e-7, 3.0e-11, -1.0e-15, -1200, 5,
  T,
  TRange,
));

console.log("Cp_IG_shomate:", Cp_IG_shomate(
  30.09200, 6.832514, 6.793435, -2.534480, 0.082139,
  T,
  TRange,
));

console.log("Cp_IG dispatcher NASA7:", Cp_IG("NASA7", {
  temperature: T,
  temperature_range: TRange,
  a1: 3.78245636,
  a2: -2.99673416e-3,
  a3: 9.84730201e-6,
  a4: -9.68129509e-9,
  a5: 3.24372837e-12,
}));

console.log("Cp_IG dispatcher NASA9:", Cp_IG("NASA9", {
  temperature: T,
  temperature_range: TRange,
  a1: 1.0e4,
  a2: -2.0e2,
  a3: 3.5,
  a4: 1.0e-3,
  a5: -2.0e-7,
  a6: 3.0e-11,
  a7: -1.0e-15,
}));

console.log("Cp_IG dispatcher SHOMATE:", Cp_IG("SHOMATE", {
  temperature: T,
  temperature_range: TRange,
  A: 30.09200,
  B: 6.832514,
  C: 6.793435,
  D: -2.534480,
  E: 0.082139,
}));
