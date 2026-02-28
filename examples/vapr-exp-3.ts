import type { Component, Temperature } from "mozithermodb-settings";
import { ComponentSchema } from "mozithermodb-settings";
import type { ConfigArgMap, ConfigParamMap, ConfigRetMap, Eq, RawThermoRecord } from "mozithermodb";
import { buildComponentData, buildComponentsEquation, createEq } from "mozithermodb";

// ! LOCALS
import {
    calc_EnVap_range,
    calc_VaPr_range,
    calc_VaPr_sensitivity_range,
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

const vpEq = createEq(
    params,
    args,
    ret,
    eq,
    "Antoine Vapor Pressure",
    "log10(P) = A - B / (T + C)"
);

const modelSource = {
    dataSource: buildComponentData(component, data, ["Name-Formula"], true, "Name-Formula"),
    equationSource: buildComponentsEquation([component], vpEq, [data], ["Name-Formula"], true, "Name-Formula"),
};

// SECTION: Range inputs for sat.ts range methods
const temperatures: Temperature[] = [
    { value: 320, unit: "K" },
    { value: 340, unit: "K" },
    { value: 360, unit: "K" },
    { value: 380, unit: "K" },
];

console.log("Temperatures:", temperatures);

const vaprRange = calc_VaPr_range(component, modelSource, temperatures);
console.log("VaPr range:", vaprRange);

const envapRange = calc_EnVap_range(component, modelSource, temperatures);
console.log("EnVap range:", envapRange);

const sensitivityRange = calc_VaPr_sensitivity_range(component, modelSource, temperatures);
console.log("dPsat/dT range:", sensitivityRange);
