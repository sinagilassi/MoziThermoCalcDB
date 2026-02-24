import type { CustomProperty, Temperature } from "mozithermodb-settings";
import { Cp_IG_SYMBOL } from "../configs/thermo-props";
import {
  DEFAULT_R_J_MOLK,
  buildCustomProperty,
  isFiniteNumber,
  isTemperature,
  toKelvin,
  validateTemperatureRangeInclusive,
} from "./_shared";

type TemperatureRange = [Temperature, Temperature];
export type Cp_IG_Method = "NASA7" | "NASA9" | "SHOMATE";

const validateCoeffs = (coeffs: unknown[], labels?: string[]): boolean => {
  for (let i = 0; i < coeffs.length; i += 1) {
    if (!isFiniteNumber(coeffs[i])) {
      const label = labels?.[i] ?? `${i}`;
      console.error(`Coefficient ${label} is not a valid number: ${String(coeffs[i])}`);
      return false;
    }
  }
  return true;
};

const validateRawTemperatureRangeInclusive = (
  temperature: Temperature,
  temperatureRange?: TemperatureRange,
): boolean => {
  if (!temperatureRange) return true;
  const [tMin, tMax] = temperatureRange;
  if (!isTemperature(tMin) || !isTemperature(tMax)) {
    console.error("Temperature range must contain valid Temperature values.");
    return false;
  }
  if (!(tMin.value <= temperature.value && temperature.value <= tMax.value)) {
    console.warn(
      `Temperature ${temperature.value} ${temperature.unit} is out of the valid range (${tMin.value} ${tMin.unit} - ${tMax.value} ${tMax.unit})`,
    );
    return false;
  }
  return true;
};

export const Cp_IG_polynomial = (
  A: number,
  B: number,
  C: number,
  D: number,
  E: number,
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
    if (!validateCoeffs([A, B, C, D, E])) return null;
    if (!validateRawTemperatureRangeInclusive(temperature, temperature_range)) return null;

    const T = temperature.value;
    const cp = A + B * T + C * T ** 2 + D * T ** 3 + E / T ** 2;
    if (message != null) console.log(`Ideal gas heat capacity calculation successful,${message}`);
    return buildCustomProperty(cp, output_unit ?? "N/A", Cp_IG_SYMBOL);
  } catch (error) {
    console.error(`Error in heat capacity calculation: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

export const Cp_IG_NASA9_polynomial = (
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
    if (!validateCoeffs([a1, a2, a3, a4, a5, a6, a7, b1, b2])) return null;
    const T = toKelvin(temperature);
    if (!validateTemperatureRangeInclusive(T, temperature_range)) return null;

    const cp = universal_gas_constant * (
      a1 * T ** -2 +
      a2 * T ** -1 +
      a3 +
      a4 * T +
      a5 * T ** 2 +
      a6 * T ** 3 +
      a7 * T ** 4
    );
    if (message != null) console.log(`Ideal gas heat capacity calculation successful,${message}`);
    return buildCustomProperty(cp, output_unit ?? "J/mol.K", Cp_IG_SYMBOL);
  } catch (error) {
    console.error(`Error in heat capacity calculation: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

export const Cp_IG_shomate = (
  A: number,
  B: number,
  C: number,
  D: number,
  E: number,
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
    if (!validateCoeffs([A, B, C, D, E])) return null;
    const T = temperature.unit === "K" ? temperature.value : toKelvin(temperature);
    if (
      temperature_range &&
      !validateRawTemperatureRangeInclusive(
        { value: T, unit: "K" },
        [
          temperature_range[0].unit === "K" ? temperature_range[0] : { value: toKelvin(temperature_range[0]), unit: "K" },
          temperature_range[1].unit === "K" ? temperature_range[1] : { value: toKelvin(temperature_range[1]), unit: "K" },
        ],
      )
    ) {
      return null;
    }

    const t = T / 1000.0;
    const cp = A + B * t + C * t ** 2 + D * t ** 3 + E / t ** 2;
    if (message != null) console.log(`Ideal gas heat capacity calculation successful,${message}`);
    return buildCustomProperty(cp, output_unit ?? "J/mol.K", Cp_IG_SYMBOL);
  } catch (error) {
    console.error(`Error in heat capacity calculation: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

export const Cp_IG_NASA7_polynomial = (
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
    if (!validateCoeffs([a1, a2, a3, a4, a5, a6, a7])) return null;
    const T = toKelvin(temperature);
    if (!validateTemperatureRangeInclusive(T, temperature_range)) return null;

    const cp = universal_gas_constant * (
      a1 + a2 * T + a3 * T ** 2 + a4 * T ** 3 + a5 * T ** 4
    );
    if (message != null) console.log(`Ideal gas heat capacity calculation successful,${message}`);
    return buildCustomProperty(cp, output_unit ?? "J/mol.K", Cp_IG_SYMBOL);
  } catch (error) {
    console.error(`Error in heat capacity calculation: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

type CpDispatcherBase = {
  temperature: Temperature;
  temperature_range?: TemperatureRange;
  output_unit?: string;
  universal_gas_constant?: number;
  message?: string;
};

export const Cp_IG = (
  method: Cp_IG_Method,
  options: CpDispatcherBase & Record<string, unknown>,
): CustomProperty | null => {
  const {
    temperature,
    temperature_range,
    output_unit,
    universal_gas_constant = DEFAULT_R_J_MOLK,
    message,
    ...coeffs
  } = options;
  const methodU = method.toUpperCase();

  try {
    if (methodU === "NASA7") {
      const required = ["a1", "a2", "a3", "a4", "a5"] as const;
      const missing = required.filter((k) => !(k in coeffs));
      if (missing.length) {
        console.error(`NASA7 Cp requires coefficients: ${required.join(", ")}. Missing: ${missing.join(", ")}`);
        return null;
      }
      return Cp_IG_NASA7_polynomial(
        coeffs.a1 as number,
        coeffs.a2 as number,
        coeffs.a3 as number,
        coeffs.a4 as number,
        coeffs.a5 as number,
        (coeffs.a6 as number) ?? 0,
        (coeffs.a7 as number) ?? 0,
        temperature,
        temperature_range,
        output_unit,
        universal_gas_constant,
        message,
      );
    }

    if (methodU === "NASA9") {
      const required = ["a1", "a2", "a3", "a4", "a5", "a6", "a7"] as const;
      const missing = required.filter((k) => !(k in coeffs));
      if (missing.length) {
        console.error(`NASA9 Cp requires coefficients: ${required.join(", ")}. Missing: ${missing.join(", ")}`);
        return null;
      }
      return Cp_IG_NASA9_polynomial(
        coeffs.a1 as number,
        coeffs.a2 as number,
        coeffs.a3 as number,
        coeffs.a4 as number,
        coeffs.a5 as number,
        coeffs.a6 as number,
        coeffs.a7 as number,
        (coeffs.b1 as number) ?? 0,
        (coeffs.b2 as number) ?? 0,
        temperature,
        temperature_range,
        output_unit,
        universal_gas_constant,
        message,
      );
    }

    if (methodU === "SHOMATE") {
      const required = ["A", "B", "C", "D", "E"] as const;
      const missing = required.filter((k) => !(k in coeffs));
      if (missing.length) {
        console.error(`Shomate Cp requires coefficients: ${required.join(", ")}. Missing: ${missing.join(", ")}`);
        return null;
      }
      return Cp_IG_shomate(
        coeffs.A as number,
        coeffs.B as number,
        coeffs.C as number,
        coeffs.D as number,
        coeffs.E as number,
        temperature,
        temperature_range,
        output_unit,
        message,
      );
    }

    console.error(`Unknown Cp_IG method: ${method}. Allowed: 'NASA7', 'NASA9', 'SHOMATE'`);
    return null;
  } catch (error) {
    console.error(`Error in Cp_IG dispatcher: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};
