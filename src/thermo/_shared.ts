import * as mozicuc from "mozicuc";
import type { CustomProp, CustomProperty, Pressure, Temperature } from "mozithermodb-settings";

export type ThermoSeriesResult = {
  values: { x: number[]; y: number[] };
  unit: string;
};

export const DEFAULT_R_J_MOLK = 8.31446261815324;

const _convertFromTo = (
  (mozicuc as unknown as { convertFromTo?: unknown }).convertFromTo ??
  (mozicuc as unknown as { default?: { convertFromTo?: unknown } }).default?.convertFromTo
) as ((value: number, fromUnit: string, toUnit: string) => number) | undefined;

if (typeof _convertFromTo !== "function") {
  throw new Error(
    "mozicuc.convertFromTo is unavailable. This is likely a package ESM/CJS export mismatch.",
  );
}

export const convertFromTo = _convertFromTo;

export const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export const isTemperature = (value: unknown): value is Temperature =>
  typeof value === "object" &&
  value !== null &&
  isFiniteNumber((value as Temperature).value) &&
  typeof (value as Temperature).unit === "string";

export const isPressure = (value: unknown): value is Pressure =>
  typeof value === "object" &&
  value !== null &&
  isFiniteNumber((value as Pressure).value) &&
  typeof (value as Pressure).unit === "string";

export type CustomPropLike = Pick<CustomProp, "value" | "unit"> | Pick<CustomProperty, "value" | "unit">;

export const isCustomPropLike = (value: unknown): value is CustomPropLike =>
  typeof value === "object" &&
  value !== null &&
  isFiniteNumber((value as { value?: unknown }).value) &&
  typeof (value as { unit?: unknown }).unit === "string";

export const convertValue = (value: number, fromUnit: string, toUnit: string): number =>
  fromUnit === toUnit ? value : convertFromTo(value, fromUnit, toUnit);

export const toKelvin = (temperature: Temperature): number => {
  if (!isTemperature(temperature)) {
    throw new Error("Invalid temperature input. Must be of type Temperature.");
  }
  return convertValue(temperature.value, temperature.unit.trim(), "K");
};

export const toPressureUnit = (pressure: Pressure, toUnit: string): number => {
  if (!isPressure(pressure)) {
    throw new Error("Invalid pressure input. Must be of type Pressure.");
  }
  return convertValue(pressure.value, pressure.unit.trim(), toUnit);
};

export const toUnit = (value: number, fromUnit: string, toUnitLabel: string): number =>
  convertValue(value, fromUnit, toUnitLabel);

export const validateTemperatureRangeInclusive = (
  temperatureK: number,
  temperatureRange?: [Temperature, Temperature],
): boolean => {
  if (!temperatureRange) return true;
  const [tLow, tHigh] = temperatureRange;
  if (!isTemperature(tLow) || !isTemperature(tHigh)) {
    console.error("Temperature range must contain valid Temperature values.");
    return false;
  }
  const lowK = toKelvin(tLow);
  const highK = toKelvin(tHigh);
  if (!(lowK <= temperatureK && temperatureK <= highK)) {
    console.warn(
      `Temperature ${temperatureK} K is out of the specified range [${lowK} K, ${highK} K].`,
    );
    return false;
  }
  return true;
};

export const linspace = (start: number, end: number, points: number): number[] => {
  if (!Number.isFinite(points)) return [];
  const n = Math.max(0, Math.trunc(points));
  if (n === 0) return [];
  if (n === 1) return [start];
  const step = (end - start) / (n - 1);
  return Array.from({ length: n }, (_, i) => start + step * i);
};

export const buildCustomProperty = (value: number, unit: string, symbol: string): CustomProperty => ({
  value,
  unit,
  symbol,
});

export const areAllFiniteNumbers = (values: unknown[]): values is number[] => values.every(isFiniteNumber);

export const maybeLogMessage = (prefix: string, message?: string | null): void => {
  if (message != null) {
    console.log(`${prefix}${message}`);
  }
};

