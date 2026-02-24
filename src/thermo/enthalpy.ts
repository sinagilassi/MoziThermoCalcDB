import type { CustomProperty, Temperature } from "mozithermodb-settings";
import { En_IG_SYMBOL } from "../configs/thermo-props";
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
export type EnthalpySeriesResult = _ThermoSeriesResult;
export type En_IG_Method = "NASA7" | "NASA9" | "Shomate";

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
  calcFn: (...args: [...TArgs, Temperature, TemperatureRange | undefined, string | undefined, number, string | undefined]) => CustomProperty | null,
  coeffArgs: TArgs,
  T_low: Temperature,
  T_high: Temperature,
  T_points: number,
  temperature_range: TemperatureRange | undefined,
  output_unit: string | undefined,
  universal_gas_constant: number,
  message: string | undefined,
  defaultUnit: string,
  messagePrefix: string,
): EnthalpySeriesResult | null => {
  try {
    if (!isTemperature(T_low) || !isTemperature(T_high)) {
      console.error("T_low and T_high must be valid Temperature values.");
      return null;
    }
    const tLowK = toKelvin(T_low);
    const tHighK = toKelvin(T_high);
    const xs = linspace(tLowK, tHighK, T_points);
    const ys: number[] = [];

    for (const T of xs) {
      const res = calcFn(...coeffArgs, { value: T, unit: "K" }, temperature_range, output_unit, universal_gas_constant, undefined);
      ys.push(res?.value ?? 0);
    }

    maybeLogMessage(messagePrefix, message);
    return { values: { x: xs, y: ys }, unit: output_unit ?? defaultUnit };
  } catch (error) {
    console.error(`Error in enthalpy range calculation: ${error instanceof Error ? error.message : String(error)}`);
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
): EnthalpySeriesResult | null => {
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
    console.error(`Error in enthalpy list calculation: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

export const En_IG_NASA9_polynomial = (
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
      -a1 / T +
      a2 * Math.log(T) +
      a3 * T +
      (a4 / 2) * T ** 2 +
      (a5 / 3) * T ** 3 +
      (a6 / 4) * T ** 4 +
      (a7 / 5) * T ** 5 +
      b1
    );

    let unit = "J/mol";
    if (output_unit) {
      value = toUnit(value, "J/mol", output_unit);
      unit = output_unit;
    }
    maybeLogMessage("Ideal gas enthalpy calculation using NASA-9 successful,", message);
    return buildCustomProperty(value, unit, En_IG_SYMBOL);
  } catch (error) {
    console.error(`Error in ideal gas enthalpy calculation: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

export const En_IG_NASA9_polynomial_range = (
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
): EnthalpySeriesResult | null =>
  seriesFromRange(
    En_IG_NASA9_polynomial,
    [a1, a2, a3, a4, a5, a6, a7, b1, b2],
    T_low,
    T_high,
    T_points,
    temperature_range,
    output_unit,
    universal_gas_constant,
    message,
    "J/mol",
    "Integral ideal gas enthalpy calculation over range using NASA-9 successful",
  );

export const En_IG_NASA9_polynomial_ranges = (
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
): EnthalpySeriesResult | null =>
  seriesFromTemperatures(
    En_IG_NASA9_polynomial,
    [a1, a2, a3, a4, a5, a6, a7, b1, b2],
    temperatures,
    temperature_range,
    output_unit,
    universal_gas_constant,
    message,
    "J/mol",
    "Ideal gas enthalpy calculation at multiple temperatures using NASA-9 successful",
  );

export const dEn_IG_NASA9_polynomial = (
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
    const initial = En_IG_NASA9_polynomial(a1, a2, a3, a4, a5, a6, a7, b1, b2, T_initial, temperature_range, output_unit, universal_gas_constant);
    if (!initial) return null;
    const final = En_IG_NASA9_polynomial(a1, a2, a3, a4, a5, a6, a7, b1, b2, T_final, temperature_range, output_unit, universal_gas_constant);
    if (!final) return null;
    maybeLogMessage("Sensible heat effect calculation using NASA-9 successful", message);
    return buildCustomProperty(final.value - initial.value, output_unit ?? "J/mol", "dEn_IG");
  } catch (error) {
    console.error(`Error in sensible heat effect calculation: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

export const En_IG_shomate = (
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
  universal_gas_constant: number = DEFAULT_R_J_MOLK,
  message?: string,
): CustomProperty | null => {
  void universal_gas_constant;
  try {
    if (!isTemperature(temperature)) {
      console.error("Invalid temperature input. Must be of type Temperature.");
      return null;
    }
    if (!validateCoeffMap({ A, B, C, D, E, F, G })) return null;
    const T = toKelvin(temperature);
    if (!validateTemperatureRangeInclusive(T, temperature_range)) return null;

    const t = T / 1000;
    let value = A * t + B * t ** 2 / 2 + C * t ** 3 / 3 + D * t ** 4 / 4 - E / t + F;
    let unit = "kJ/mol";
    if (output_unit) {
      value = toUnit(value, "kJ/mol", output_unit);
      unit = output_unit;
    }
    maybeLogMessage("Ideal gas enthalpy calculation using Shomate equation successful", message);
    return buildCustomProperty(value, unit, En_IG_SYMBOL);
  } catch (error) {
    console.error(`Error in ideal gas enthalpy calculation: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

export const En_IG_shomate_range = (
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
  universal_gas_constant: number = DEFAULT_R_J_MOLK,
  message?: string,
): EnthalpySeriesResult | null =>
  seriesFromRange(
    En_IG_shomate,
    [A, B, C, D, E, F, G],
    T_low,
    T_high,
    T_points,
    temperature_range,
    output_unit,
    universal_gas_constant,
    message,
    "kJ/mol",
    "Integral ideal gas enthalpy calculation over range using Shomate equation successful",
  );

export const En_IG_NASA7_polynomial = (
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

    let value = universal_gas_constant * T * (
      a1 +
      a2 * T / 2 +
      a3 * T ** 2 / 3 +
      a4 * T ** 3 / 4 +
      a5 * T ** 4 / 5 +
      a6 / T
    );
    let unit = "J/mol";
    if (output_unit) {
      value = toUnit(value, "J/mol", output_unit);
      unit = output_unit;
    }
    maybeLogMessage("Ideal gas enthalpy calculation using NASA-7 successful", message);
    return buildCustomProperty(value, unit, En_IG_SYMBOL);
  } catch (error) {
    console.error(`Error in ideal gas enthalpy calculation (NASA7): ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

export const En_IG_NASA7_polynomial_range = (
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
): EnthalpySeriesResult | null =>
  seriesFromRange(
    En_IG_NASA7_polynomial,
    [a1, a2, a3, a4, a5, a6, a7],
    T_low,
    T_high,
    T_points,
    temperature_range,
    output_unit,
    universal_gas_constant,
    message,
    "J/mol",
    "Integral ideal gas enthalpy calculation over range using NASA-7 successful",
  );

export const En_IG_NASA7_polynomial_ranges = (
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
): EnthalpySeriesResult | null =>
  seriesFromTemperatures(
    En_IG_NASA7_polynomial,
    [a1, a2, a3, a4, a5, a6, a7],
    temperatures,
    temperature_range,
    output_unit,
    universal_gas_constant,
    message,
    "J/mol",
    "Ideal gas enthalpy calculation at multiple temperatures using NASA-7 successful",
  );

export const dEn_IG_NASA7_polynomial = (
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
    const initial = En_IG_NASA7_polynomial(a1, a2, a3, a4, a5, a6, a7, T_initial, temperature_range, output_unit, universal_gas_constant);
    if (!initial) return null;
    const final = En_IG_NASA7_polynomial(a1, a2, a3, a4, a5, a6, a7, T_final, temperature_range, output_unit, universal_gas_constant);
    if (!final) return null;
    maybeLogMessage("Sensible heat effect calculation using NASA-7 successful", message);
    return buildCustomProperty(final.value - initial.value, output_unit ?? "J/mol", "dEn_IG");
  } catch (error) {
    console.error(`Error in sensible heat effect calculation (NASA7): ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

const _require_coeffs = (
  coeffs: Record<string, unknown>,
  required: readonly string[],
): Record<string, unknown> | null => {
  const missing = required.filter((k) => !(k in coeffs));
  if (missing.length) {
    console.error(`Missing coefficients for En_IG: ${missing.join(", ")}. Required: ${required.join(", ")}`);
    return null;
  }
  return Object.fromEntries(required.map((k) => [k, coeffs[k]]));
};

type CalcEnIgOptions = {
  temperature: Temperature;
  temperature_range?: TemperatureRange;
  output_unit?: string;
  universal_gas_constant?: number;
  message?: string;
} & Record<string, unknown>;

export const calc_En_IG = (method: En_IG_Method, options: CalcEnIgOptions): CustomProperty | null => {
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
      return En_IG_NASA7_polynomial(
        pack.a1 as number, pack.a2 as number, pack.a3 as number, pack.a4 as number, pack.a5 as number, pack.a6 as number, pack.a7 as number,
        temperature, temperature_range, output_unit, universal_gas_constant, message,
      );
    }
    if (method === "NASA9") {
      const req = ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "b1", "b2"] as const;
      const pack = _require_coeffs(coeffs, req);
      if (!pack) return null;
      return En_IG_NASA9_polynomial(
        pack.a1 as number, pack.a2 as number, pack.a3 as number, pack.a4 as number, pack.a5 as number, pack.a6 as number, pack.a7 as number, pack.b1 as number, pack.b2 as number,
        temperature, temperature_range, output_unit, universal_gas_constant, message,
      );
    }
    if (method === "Shomate") {
      const req = ["A", "B", "C", "D", "E", "F", "G"] as const;
      const pack = _require_coeffs(coeffs, req);
      if (!pack) return null;
      return En_IG_shomate(
        pack.A as number, pack.B as number, pack.C as number, pack.D as number, pack.E as number, pack.F as number, pack.G as number,
        temperature, temperature_range, output_unit, universal_gas_constant, message,
      );
    }
    console.error(`Unsupported En_IG method: ${String(method)}`);
    return null;
  } catch (error) {
    console.error(`Error in En_IG dispatcher: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};
