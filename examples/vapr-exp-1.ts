import type { Pressure, Temperature } from "mozithermodb-settings";
// ! LOCALS
import { antoine, wagner } from "../src";

const temperature: Temperature = { value: 350, unit: "K" };
const temperatureRange: [Temperature, Temperature] = [
  { value: 300, unit: "K" },
  { value: 500, unit: "K" }
];

const antoineLog10 = antoine(
  8.07131,
  1730.63,
  233.426,
  temperature,
  temperatureRange,
  "mmHg",
  "log10",
  "Antoine (log10) example"
);

const antoineLn = antoine(
  16.262,
  3799.89,
  -46.41,
  temperature,
  temperatureRange,
  "Pa",
  "ln",
  "Antoine (ln) example"
);

const criticalTemperature: Temperature = { value: 647.1, unit: "K" };
const criticalPressure: Pressure = { value: 22_064_000, unit: "Pa" };

const wagnerResult = wagner(
  -7.85951783,
  1.84408259,
  -11.7866497,
  22.6807411,
  temperature,
  criticalTemperature,
  criticalPressure,
  temperatureRange,
  "Pa",
  "Wagner example"
);

const badTemperature = { value: Number.NaN, unit: "K" } as Temperature;
const invalidResult = antoine(8, 1500, 200, badTemperature, temperatureRange, "kPa");

console.log("Antoine log10:", antoineLog10);
console.log("Antoine ln:", antoineLn);
console.log("Wagner:", wagnerResult);
console.log("Invalid input (expect null):", invalidResult);
