import type { CustomProperty, Temperature } from "mozithermodb-settings";
import {
  DEFAULT_R_J_MOLK,
  type ThermoSeriesResult as _ThermoSeriesResult,
  buildCustomProperty,
  isFiniteNumber,
  isTemperature,
  linspace,
  maybeLogMessage,
  toKelvin,
  toUnit,
  validateTemperatureRangeInclusive,
} from "./_shared";

type TemperatureRange = [Temperature, Temperature];
export type EntropySeriesResult = _ThermoSeriesResult;
export type S_IG_Method = "NASA7" | "NASA9" | "Shomate";

const ENTROPY_SYMBOL = "Ent_IG";

const validateCoeffMap = (coeffs: Record<string, unknown>): boolean => {
  for (const [name, value] of Object.entries(coeffs)) {
    if (!isFiniteNumber(value)) {
      console.error(`Coefficient ${name} is not a valid number: ${String(value)}`);
      return false;
    }
  }
  return true;
};

const seriesFromRange = <TArgs extends unknown[]>(
  calcFn: (...args: [...TArgs, Temperature, TemperatureRange | undefined, string | undefined, number | undefined, string | undefined]) => CustomProperty | null,
  coeffArgs: TArgs,
  T_low: Temperature,
  T_high: Temperature,
  T_points: number,
  temperature_range: TemperatureRange | undefined,
  output_unit: string | undefined,
  universal_gas_constant: number | undefined,
  message: string | undefined,
  defaultUnit: string,
  messagePrefix: string,
): EntropySeriesResult | null => {
  try {
    if (!isTemperature(T_low) || !isTemperature(T_high)) {
      console.error("T_low and T_high must be valid Temperature values.");
      return null;
    }
    const lowK = toKelvin(T_low);
    const highK = toKelvin(T_high);
    const xs = linspace(lowK, highK, T_points);
    const ys: number[] = [];

    for (const T of xs) {
      const res = calcFn(...coeffArgs, { value: T, unit: "K" }, temperature_range, output_unit, universal_gas_constant, undefined);
      ys.push(res?.value ?? 0);
    }

    maybeLogMessage(messagePrefix, message);
    return { values: { x: xs, y: ys }, unit: output_unit ?? defaultUnit };
  } catch (error) {
    console.error(`Error in entropy range calculation: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

const seriesFromTemperatures = <TArgs extends unknown[]>(
  calcFn: (...args: [...TArgs, Temperature, TemperatureRange | undefined, string | undefined, number, string | undefined]) => CustomProperty | null,
  coeffArgs: TArgs,
  temperatures: Temperature[],
  temperature_range: TemperatureRange | undefined,
  output_unit: string | undefined,
  universal_gas_constant: number,
  message: string | undefined,
  defaultUnit: string,
  messagePrefix: string,
): EntropySeriesResult | null => {
  try {
    if (!Array.isArray(temperatures) || !temperatures.every(isTemperature)) {
      console.error("temperatures must be an array of valid Temperature values.");
      return null;
    }
    const xs: number[] = [];
    const ys: number[] = [];
    for (const temp of temperatures) {
      const T = toKelvin(temp);
      const res = calcFn(...coeffArgs, { value: T, unit: "K" }, temperature_range, output_unit, universal_gas_constant, undefined);
      xs.push(T);
      ys.push(res?.value ?? 0);
    }
    maybeLogMessage(messagePrefix, message);
    return { values: { x: xs, y: ys }, unit: output_unit ?? defaultUnit };
  } catch (error) {
    console.error(`Error in entropy list calculation: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

export const S_IG_NASA9_polynomial = (
  a1: number,
  a2: number,
  a3: number,
  a4: number,
  a5: number,
  a6: number,
  a7: number,
  b1: number,
  b2: number,
  temperature: Temperature,
  temperature_range?: TemperatureRange,
  output_unit?: string,
  universal_gas_constant: number = DEFAULT_R_J_MOLK,
  message?: string,
): CustomProperty | null => {
  try {
    if (!isTemperature(temperature)) {
      console.error("Invalid temperature input. Must be of type Temperature.");
      return null;
    }
    if (!validateCoeffMap({ a1, a2, a3, a4, a5, a6, a7, b1, b2 })) return null;
    const T = toKelvin(temperature);
    if (!validateTemperatureRangeInclusive(T, temperature_range)) return null;

    let value = universal_gas_constant * (
      -a1 / (2 * T ** 2) -
      a2 / T +
      a3 * Math.log(T) +
      a4 * T +
      (a5 / 2) * T ** 2 +
      (a6 / 3) * T ** 3 +
      (a7 / 4) * T ** 4 +
      b2
    );
    let unit = "J/mol.K";
    if (output_unit) {
      value = toUnit(value, "J/mol.K", output_unit);
      unit = output_unit;
    }
    maybeLogMessage("Ideal gas entropy calculation using NASA-9 successful", message);
    return buildCustomProperty(value, unit, ENTROPY_SYMBOL);
  } catch (error) {
    console.error(`Error in ideal gas entropy calculation: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

export const S_IG_NASA9_polynomial_range = (
  a1: number,
  a2: number,
  a3: number,
  a4: number,
  a5: number,
  a6: number,
  a7: number,
  b1: number,
  b2: number,
  T_low: Temperature,
  T_high: Temperature,
  T_points = 10,
  temperature_range?: TemperatureRange,
  output_unit?: string,
  universal_gas_constant: number = DEFAULT_R_J_MOLK,
  message?: string,
): EntropySeriesResult | null =>
  seriesFromRange(
    S_IG_NASA9_polynomial,
    [a1, a2, a3, a4, a5, a6, a7, b1, b2],
    T_low,
    T_high,
    T_points,
    temperature_range,
    output_unit,
    universal_gas_constant,
    message,
    "J/mol.K",
    "Integral ideal gas entropy calculation over range using NASA-9 successful",
  );

export const S_IG_NASA9_polynomial_ranges = (
  a1: number,
  a2: number,
  a3: number,
  a4: number,
  a5: number,
  a6: number,
  a7: number,
  b1: number,
  b2: number,
  temperatures: Temperature[],
  temperature_range?: TemperatureRange,
  output_unit?: string,
  universal_gas_constant: number = DEFAULT_R_J_MOLK,
  message?: string,
): EntropySeriesResult | null =>
  seriesFromTemperatures(
    S_IG_NASA9_polynomial,
    [a1, a2, a3, a4, a5, a6, a7, b1, b2],
    temperatures,
    temperature_range,
    output_unit,
    universal_gas_constant,
    message,
    "J/mol.K",
    "Ideal gas entropy calculation over range using NASA-9 successful",
  );

export const dS_IG_NASA9_polynomial = (
  a1: number,
  a2: number,
  a3: number,
  a4: number,
  a5: number,
  a6: number,
  a7: number,
  b1: number,
  b2: number,
  T_initial: Temperature,
  T_final: Temperature,
  temperature_range?: TemperatureRange,
  output_unit?: string,
  universal_gas_constant: number = DEFAULT_R_J_MOLK,
  message?: string,
): CustomProperty | null => {
  try {
    const initial = S_IG_NASA9_polynomial(a1, a2, a3, a4, a5, a6, a7, b1, b2, T_initial, temperature_range, output_unit, universal_gas_constant);
    if (!initial) return null;
    const final = S_IG_NASA9_polynomial(a1, a2, a3, a4, a5, a6, a7, b1, b2, T_final, temperature_range, output_unit, universal_gas_constant);
    if (!final) return null;
    maybeLogMessage("Entropy change calculation using NASA-9 successful", message);
    return buildCustomProperty(final.value - initial.value, output_unit ?? "J/mol.K", "dEnt_IG");
  } catch (error) {
    console.error(`Error in entropy change calculation: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

export const S_IG_shomate = (
  A: number,
  B: number,
  C: number,
  D: number,
  E: number,
  F: number,
  G: number,
  temperature: Temperature,
  temperature_range?: TemperatureRange,
  output_unit?: string,
  message?: string,
): CustomProperty | null => {
  try {
    if (!isTemperature(temperature)) {
      console.error("Invalid temperature input. Must be of type Temperature.");
      return null;
    }
    if (!validateCoeffMap({ A, B, C, D, E, F, G })) return null;
    const T = toKelvin(temperature);
    if (!validateTemperatureRangeInclusive(T, temperature_range)) return null;

    const t = T / 1000;
    let value = A * Math.log(t) + B * t + C * t ** 2 / 2 + D * t ** 3 / 3 - E / (2 * t ** 2) + G;
    let unit = "J/mol.K";
    if (output_unit) {
      value = toUnit(value, "J/mol.K", output_unit);
      unit = output_unit;
    }
    maybeLogMessage("Ideal gas entropy calculation using Shomate equation successful", message);
    return buildCustomProperty(value, unit, ENTROPY_SYMBOL);
  } catch (error) {
    console.error(`Error in ideal gas entropy calculation: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

export const S_IG_shomate_range = (
  A: number,
  B: number,
  C: number,
  D: number,
  E: number,
  F: number,
  G: number,
  T_low: Temperature,
  T_high: Temperature,
  T_points = 10,
  temperature_range?: TemperatureRange,
  output_unit?: string,
  message?: string,
): EntropySeriesResult | null =>
  seriesFromRange(
    S_IG_shomate as unknown as (...args: [number, number, number, number, number, number, number, Temperature, TemperatureRange | undefined, string | undefined, number | undefined, string | undefined]) => CustomProperty | null,
    [A, B, C, D, E, F, G],
    T_low,
    T_high,
    T_points,
    temperature_range,
    output_unit,
    undefined,
    message,
    "J/mol.K",
    "Integral ideal gas entropy calculation over range using Shomate equation successful",
  );

export const S_IG_NASA7_polynomial = (
  a1: number,
  a2: number,
  a3: number,
  a4: number,
  a5: number,
  a6: number,
  a7: number,
  temperature: Temperature,
  temperature_range?: TemperatureRange,
  output_unit?: string,
  universal_gas_constant: number = DEFAULT_R_J_MOLK,
  message?: string,
): CustomProperty | null => {
  try {
    if (!isTemperature(temperature)) {
      console.error("Invalid temperature input. Must be of type Temperature.");
      return null;
    }
    if (!validateCoeffMap({ a1, a2, a3, a4, a5, a6, a7 })) return null;
    const T = toKelvin(temperature);
    if (!validateTemperatureRangeInclusive(T, temperature_range)) return null;

    let value = universal_gas_constant * (
      a1 * Math.log(T) +
      a2 * T +
      a3 * T ** 2 / 2 +
      a4 * T ** 3 / 3 +
      a5 * T ** 4 / 4 +
      a7
    );
    let unit = "J/mol.K";
    if (output_unit) {
      value = toUnit(value, "J/mol.K", output_unit);
      unit = output_unit;
    }
    maybeLogMessage("Ideal gas entropy calculation using NASA-7 successful", message);
    return buildCustomProperty(value, unit, ENTROPY_SYMBOL);
  } catch (error) {
    console.error(`Error in ideal gas entropy calculation (NASA7): ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

export const S_IG_NASA7_polynomial_range = (
  a1: number,
  a2: number,
  a3: number,
  a4: number,
  a5: number,
  a6: number,
  a7: number,
  T_low: Temperature,
  T_high: Temperature,
  T_points = 10,
  temperature_range?: TemperatureRange,
  output_unit?: string,
  universal_gas_constant: number = DEFAULT_R_J_MOLK,
  message?: string,
): EntropySeriesResult | null =>
  seriesFromRange(
    S_IG_NASA7_polynomial,
    [a1, a2, a3, a4, a5, a6, a7],
    T_low,
    T_high,
    T_points,
    temperature_range,
    output_unit,
    universal_gas_constant,
    message,
    "J/mol.K",
    "Integral ideal gas entropy over range using NASA-7 successful",
  );

export const S_IG_NASA7_polynomial_ranges = (
  a1: number,
  a2: number,
  a3: number,
  a4: number,
  a5: number,
  a6: number,
  a7: number,
  temperatures: Temperature[],
  temperature_range?: TemperatureRange,
  output_unit?: string,
  universal_gas_constant: number = DEFAULT_R_J_MOLK,
  message?: string,
): EntropySeriesResult | null =>
  seriesFromTemperatures(
    S_IG_NASA7_polynomial,
    [a1, a2, a3, a4, a5, a6, a7],
    temperatures,
    temperature_range,
    output_unit,
    universal_gas_constant,
    message,
    "J/mol.K",
    "Ideal gas entropy calculation over range using NASA-7 successful",
  );

export const dS_IG_NASA7_polynomial = (
  a1: number,
  a2: number,
  a3: number,
  a4: number,
  a5: number,
  a6: number,
  a7: number,
  T_initial: Temperature,
  T_final: Temperature,
  temperature_range?: TemperatureRange,
  output_unit?: string,
  universal_gas_constant: number = DEFAULT_R_J_MOLK,
  message?: string,
): CustomProperty | null => {
  try {
    const initial = S_IG_NASA7_polynomial(a1, a2, a3, a4, a5, a6, a7, T_initial, temperature_range, output_unit, universal_gas_constant);
    if (!initial) return null;
    const final = S_IG_NASA7_polynomial(a1, a2, a3, a4, a5, a6, a7, T_final, temperature_range, output_unit, universal_gas_constant);
    if (!final) return null;
    maybeLogMessage("Entropy change calculation using NASA-7 successful", message);
    return buildCustomProperty(final.value - initial.value, output_unit ?? "J/mol.K", "dEnt_IG");
  } catch (error) {
    console.error(`Error in entropy change calculation (NASA7): ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

const _require_coeffs = (
  coeffs: Record<string, unknown>,
  required: readonly string[],
): Record<string, unknown> | null => {
  const missing = required.filter((k) => !(k in coeffs));
  if (missing.length) {
    console.error(`Missing coefficients for Ent_IG: ${missing.join(", ")}. Required: ${required.join(", ")}`);
    return null;
  }
  return Object.fromEntries(required.map((k) => [k, coeffs[k]]));
};

type CalcEntIgOptions = {
  temperature: Temperature;
  temperature_range?: TemperatureRange;
  output_unit?: string;
  universal_gas_constant?: number;
  message?: string;
} & Record<string, unknown>;

export const calc_Ent_IG = (method: S_IG_Method, options: CalcEntIgOptions): CustomProperty | null => {
  const {
    temperature,
    temperature_range,
    output_unit,
    universal_gas_constant = DEFAULT_R_J_MOLK,
    message,
    ...coeffs
  } = options;

  try {
    if (method === "NASA7") {
      const req = ["a1", "a2", "a3", "a4", "a5", "a6", "a7"] as const;
      const pack = _require_coeffs(coeffs, req);
      if (!pack) return null;
      return S_IG_NASA7_polynomial(
        pack.a1 as number, pack.a2 as number, pack.a3 as number, pack.a4 as number, pack.a5 as number, pack.a6 as number, pack.a7 as number,
        temperature, temperature_range, output_unit, universal_gas_constant, message,
      );
    }
    if (method === "NASA9") {
      const req = ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "b1", "b2"] as const;
      const pack = _require_coeffs(coeffs, req);
      if (!pack) return null;
      return S_IG_NASA9_polynomial(
        pack.a1 as number, pack.a2 as number, pack.a3 as number, pack.a4 as number, pack.a5 as number, pack.a6 as number, pack.a7 as number, pack.b1 as number, pack.b2 as number,
        temperature, temperature_range, output_unit, universal_gas_constant, message,
      );
    }
    if (method === "Shomate") {
      const req = ["A", "B", "C", "D", "E", "F", "G"] as const;
      const pack = _require_coeffs(coeffs, req);
      if (!pack) return null;
      return S_IG_shomate(
        pack.A as number, pack.B as number, pack.C as number, pack.D as number, pack.E as number, pack.F as number, pack.G as number,
        temperature, temperature_range, output_unit, message,
      );
    }
    console.error(`Unsupported S_IG method: ${String(method)}`);
    return null;
  } catch (error) {
    console.error(`Error in S_IG dispatcher: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};
