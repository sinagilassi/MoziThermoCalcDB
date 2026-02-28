import type { Pressure, Temperature } from "mozithermodb-settings";
import { rackett } from "mozithermocalcdb";

const T: Temperature = { value: 298.15, unit: "K" };
const Tc: Temperature = { value: 647.096, unit: "K" };
const Pc: Pressure = { value: 220.64, unit: "bar" };

const waterDensity = rackett(
  T,
  Tc,
  Pc,
  { value: 18.01528, unit: "g/mol" },
  { value: 0.229, unit: "" },
);

const waterDensityKgPerMol = rackett(
  T,
  Tc,
  Pc,
  { value: 0.01801528, unit: "kg/mol" },
  { value: 0.229, unit: "" },
);

const invalidMw = rackett(
  T,
  Tc,
  Pc,
  { value: 18.01528, unit: "lb/mol" },
  { value: 0.229, unit: "" },
);

console.log("Rackett density (MW in g/mol):", waterDensity);
console.log("Rackett density (MW in kg/mol):", waterDensityKgPerMol);
console.log("Rackett invalid MW unit (expect null):", invalidMw);
