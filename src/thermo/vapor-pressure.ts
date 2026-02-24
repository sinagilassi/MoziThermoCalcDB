// Vapor pressure utilities mirroring private/vapor-pressure/vapor-pressure.py
import type { Pressure, Temperature, CustomProperty } from "mozithermodb-settings";

export type PressureUnit = "Pa" | "kPa" | "MPa" | "bar" | "atm" | "psi" | "mmHg";

type TemperatureRange = [Temperature, Temperature];
type AntoineBase = "log10" | "ln";

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isTemperature = (value: unknown): value is Temperature =>
  typeof value === "object" &&
  value !== null &&
  isFiniteNumber((value as Temperature).value) &&
  typeof (value as Temperature).unit === "string";

const isPressure = (value: unknown): value is Pressure =>
  typeof value === "object" &&
  value !== null &&
  isFiniteNumber((value as Pressure).value) &&
  typeof (value as Pressure).unit === "string";

/**
 * Calculate vapor pressure using the Antoine equation with specified constants.
 *
 * Equation:
 * - log10(P) = A - B / (T + C)  (base: "log10")
 * - ln(P)    = A - B / (T + C)  (base: "ln")
 *
 * Notes:
 * - This mirrors the Python implementation (no unit conversion; output unit is a label).
 * - Returns null on invalid inputs and logs an error to the console.
 *
 * Parameters:
 * - A, B, C: Antoine equation constants.
 * - temperature: Temperature at which to calculate vapor pressure.
 * - temperatureRange: Optional [Tmin, Tmax] range for validity check.
 * - outputUnit: Optional output unit label (no conversion is performed).
 * - base: Logarithmic base ("log10" or "ln"), default is "log10".
 */
export const antoine = (
  A: number,
  B: number,
  C: number,
  temperature: Temperature,
  temperatureRange?: TemperatureRange,
  outputUnit?: PressureUnit,
  base: AntoineBase = "log10",
): CustomProperty | null => {
  try {
    if (!isTemperature(temperature)) {
      console.error("Invalid temperature input. Must be of type Temperature.");
      return null;
    }

    if (A === null || B === null || C === null) {
      console.error("Antoine constants A, B, and C must be provided.");
      return null;
    }

    if (![A, B, C].every(isFiniteNumber)) {
      console.error("Antoine constants A, B, and C must be numeric values.");
      return null;
    }

    const temperatureValue = temperature.value;
    const temperatureUnit = temperature.unit;

    if (temperatureRange) {
      const [Tmin, Tmax] = temperatureRange;
      if (!isTemperature(Tmin) || !isTemperature(Tmax)) {
        console.error("Temperature range must contain valid Temperature values.");
        return null;
      }
      if (!(Tmin.value <= temperatureValue && temperatureValue <= Tmax.value)) {
        console.error(
          `Temperature ${temperatureValue} ${temperatureUnit} is out of the valid range: ` +
          `${Tmin.value} ${Tmin.unit} to ${Tmax.value} ${Tmax.unit}.`
        );
        return null;
      }
    }

    let pressureValue: number;
    if (base === "log10") {
      const logPressure = A - B / (temperatureValue + C);
      pressureValue = 10 ** logPressure;
    } else if (base === "ln") {
      const lnPressure = A - B / (temperatureValue + C);
      pressureValue = Math.exp(lnPressure);
    } else {
      console.error("Invalid base for logarithm. Use 'log10' or 'ln'.");
      return null;
    }

    const pressureUnit = outputUnit ?? "N/A";

    // res
    return {
      value: pressureValue,
      unit: pressureUnit,
      symbol: "VaPr"
    };

  } catch (error) {
    const messageText = error instanceof Error ? error.message : String(error);
    console.error(`Error in Antoine vapor pressure calculation: ${messageText}`);
    return null;
  }
};

/**
 * Calculate vapor pressure using the Wagner equation with specified constants.
 *
 * Equation:
 * - ln(P/Pc) = (A*tau + B*tau^1.5 + C*tau^2.5 + D*tau^5) / (1 - tau)
 * - tau = 1 - (T / Tc)
 *
 * Notes:
 * - Temperature must be below critical temperature (T < Tc).
 * - This mirrors the Python implementation (no unit conversion; output unit is a label).
 * - Returns null on invalid inputs and logs an error to the console.
 *
 * Parameters:
 * - A, B, C, D: Wagner equation constants.
 * - temperature: Temperature at which to calculate vapor pressure.
 * - criticalTemperature: Critical temperature of the substance.
 * - criticalPressure: Critical pressure of the substance.
 * - temperatureRange: Optional [Tmin, Tmax] range for validity check.
 * - outputUnit: Optional output unit label (no conversion is performed).
 */
export const wagner = (
  A: number,
  B: number,
  C: number,
  D: number,
  temperature: Temperature,
  criticalTemperature: Temperature,
  criticalPressure: Pressure,
  temperatureRange?: TemperatureRange,
  outputUnit?: PressureUnit,
): CustomProperty | null => {
  try {
    if (![A, B, C, D].every(isFiniteNumber)) {
      console.error("Wagner constants A, B, C, and D must be numeric values.");
      return null;
    }

    if (!isTemperature(temperature)) {
      console.error("Invalid temperature input. Must be of type Temperature.");
      return null;
    }

    if (!isTemperature(criticalTemperature)) {
      console.error("Invalid critical temperature input. Must be of type Temperature.");
      return null;
    }

    if (!isPressure(criticalPressure)) {
      console.error("Invalid critical pressure input. Must be of type Pressure.");
      return null;
    }

    const T = temperature.value;
    const Tc = criticalTemperature.value;

    if (temperatureRange) {
      const [Tmin, Tmax] = temperatureRange;
      if (!isTemperature(Tmin) || !isTemperature(Tmax)) {
        console.error("Temperature range must contain valid Temperature values.");
        return null;
      }
      if (!(Tmin.value <= T && T <= Tmax.value)) {
        console.error(
          `Temperature ${T} ${temperature.unit} is out of the valid range: ` +
          `${Tmin.value} ${Tmin.unit} to ${Tmax.value} ${Tmax.unit}.`
        );
        return null;
      }
    }

    if (T >= Tc) {
      console.error("Temperature must be less than critical temperature for Wagner equation.");
      return null;
    }

    const Pc = criticalPressure.value;
    const tau = 1 - T / Tc;
    const lnPOverPc = (A * tau + B * tau ** 1.5 + C * tau ** 2.5 + D * tau ** 5) / (1 - tau);
    const pressureValue = Pc * Math.exp(lnPOverPc);
    const pressureUnit = outputUnit ?? "N/A";

    return {
      value: pressureValue,
      unit: pressureUnit,
      symbol: "VaPr"
    }
  } catch (error) {
    const messageText = error instanceof Error ? error.message : String(error);
    console.error(`Error in Wagner vapor pressure calculation: ${messageText}`);
    return null;
  }
};
