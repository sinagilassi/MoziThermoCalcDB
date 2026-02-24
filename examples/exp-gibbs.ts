import type { Temperature } from "mozithermodb-settings";
import { GiFrEn_IG, GiFrEn_IG_ranges, dGiFrEn_IG } from "../src";

const TRange: [Temperature, Temperature] = [
  { value: 200, unit: "K" },
  { value: 1200, unit: "K" },
];

const nasa7 = {
  a1: 3.78245636,
  a2: -2.99673416e-3,
  a3: 9.84730201e-6,
  a4: -9.68129509e-9,
  a5: 3.24372837e-12,
  a6: -1063.94356,
  a7: 3.65767573,
};

console.log("GiFrEn_IG (NASA7) @ 500 K:", GiFrEn_IG("NASA7", {
  temperature: { value: 500, unit: "K" },
  temperature_range: TRange,
  ...nasa7,
}));

console.log("GiFrEn_IG_ranges (NASA7):", GiFrEn_IG_ranges("NASA7", {
  temperatures: [
    { value: 300, unit: "K" },
    { value: 400, unit: "K" },
    { value: 500, unit: "K" },
    { value: 600, unit: "K" },
  ],
  temperature_range: TRange,
  ...nasa7,
}));

console.log("dGiFrEn_IG (NASA7, 300->800 K):", dGiFrEn_IG("NASA7", {
  T_initial: { value: 300, unit: "K" },
  T_final: { value: 800, unit: "K" },
  temperature_range: TRange,
  ...nasa7,
}));

const shomate = {
  A: 30.09200,
  B: 6.832514,
  C: 6.793435,
  D: -2.534480,
  E: 0.082139,
  F: -250.8810,
  G: 223.3967,
};

console.log("GiFrEn_IG (Shomate) @ 500 K:", GiFrEn_IG("Shomate", {
  temperature: { value: 500, unit: "K" },
  temperature_range: TRange,
  ...shomate,
}));
