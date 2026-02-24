import type { Component, Pressure, Temperature } from "mozithermodb-settings";
import { set_component_id, ComponentSchema } from "mozithermodb-settings";
import type { ConfigArgMap, ConfigParamMap, ConfigRetMap, Eq, RawThermoRecord } from "mozithermodb";
import { MoziEquation, Source } from "mozithermodb";

// ! LOCALS
import {
  calc_EnVap,
  calc_T_sat,
  calc_VaPr,
  calc_VaPr_sensitivity,
} from "../src/docs";

// SECTION: Build a simple Antoine vapor pressure equation
type P = "A" | "B" | "C";
type A = "T";
type R = "VaPr";

const params: ConfigParamMap<P> = {
  A: { name: "Antoine A", symbol: "A", unit: "-" },
  B: { name: "Antoine B", symbol: "B", unit: "K" },
  C: { name: "Antoine C", symbol: "C", unit: "K" },
};

const args: ConfigArgMap<A> = {
  T: { name: "Temperature", symbol: "T", unit: "K" },
};

const ret: ConfigRetMap<R> = {
  VaPr: { name: "Vapor Pressure", symbol: "VaPr", unit: "Pa" },
};

const eq: Eq<P, A> = (p, a) => {
  const log10P = p.A.value - p.B.value / (a.T.value + p.C.value);
  const value = 10 ** log10P;
  return { value, unit: "Pa", symbol: "VaPr" };
};

const component = ComponentSchema.parse({
  name: "Water",
  formula: "H2O",
  state: "l",
});

const componentKey = "Name-Formula";
const componentId = set_component_id(component, componentKey);

const data: RawThermoRecord[] = [
  { name: "Name", symbol: "Name", value: component.name, unit: "" },
  { name: "Formula", symbol: "Formula", value: component.formula, unit: "" },
  { name: "State", symbol: "State", value: component.state, unit: "" },
  { name: "Antoine A", symbol: "A", value: 8.07131, unit: "-" },
  { name: "Antoine B", symbol: "B", value: 1730.63, unit: "K" },
  { name: "Antoine C", symbol: "C", value: 233.426, unit: "K" },
  { name: "Tmin", symbol: "Tmin", value: 273.15, unit: "K" },
  { name: "Tmax", symbol: "Tmax", value: 473.15, unit: "K" },
];

const vpEq = new MoziEquation(
  "Antoine",
  params,
  args,
  ret,
  eq,
  "Antoine Vapor Pressure",
  "log10(P) = A - B / (T + C)"
);
vpEq.addData = data;
vpEq.configure();

const dataSource = {
  [componentId]: {
    A: { value: 8.07131, unit: "-", symbol: "A" },
    B: { value: 1730.63, unit: "K", symbol: "B" },
    C: { value: 233.426, unit: "K", symbol: "C" },
  },
};

const equationSource = {
  [componentId]: {
    VaPr: vpEq,
  },
};

const modelSource = { dataSource, equationSource };
const source = new Source(modelSource, componentKey);

// SECTION: Inputs for Tsat at given pressure
const targetPressure: Pressure = { value: 101325, unit: "Pa" };
const temperatureGuess: Temperature = { value: 373.15, unit: "K" };
const bracket: [Temperature, Temperature] = [
  { value: 300, unit: "K" },
  { value: 450, unit: "K" },
];

// SECTION: Different root-finding methods
const tsatNewton = calc_T_sat(component, modelSource, targetPressure, temperatureGuess, bracket, "newton");
console.log("Tsat (newton):", tsatNewton);

const tsatBrent = calc_T_sat(component, modelSource, targetPressure, temperatureGuess, bracket, "brentq");
console.log("Tsat (brentq):", tsatBrent);

const tsatBisect = calc_T_sat(component, modelSource, targetPressure, temperatureGuess, bracket, "bisect");
console.log("Tsat (bisect):", tsatBisect);

const tsatLeastSquares = calc_T_sat(component, modelSource, targetPressure, temperatureGuess, bracket, "least_squares");
console.log("Tsat (least_squares):", tsatLeastSquares);

const tsatAuto = calc_T_sat(component, modelSource, targetPressure, temperatureGuess, bracket, "auto");
console.log("Tsat (auto):", tsatAuto);

const vaprAt350 = calc_VaPr(component, modelSource, { value: 350, unit: "K" });
console.log("VaPr @ 350 K:", vaprAt350);

const envapAt350 = calc_EnVap(component, modelSource, { value: 350, unit: "K" });
console.log("EnVap @ 350 K:", envapAt350);

const sensitivityAt350 = calc_VaPr_sensitivity(component, modelSource, { value: 350, unit: "K" });
console.log("dPsat/dT @ 350 K:", sensitivityAt350);
