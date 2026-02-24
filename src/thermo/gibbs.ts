import type { CustomProperty, Temperature } from "mozithermodb-settings";
import { GiEn_IG_SYMBOL } from "../configs/thermo-props";
import {
  DEFAULT_R_J_MOLK,
  type ThermoSeriesResult as _ThermoSeriesResult,
  buildCustomProperty,
  isTemperature,
  maybeLogMessage,
  toKelvin,
  toUnit,
  validateTemperatureRangeInclusive,
} from "./_shared";
import type { En_IG_Method } from "./enthalpy";
import { calc_En_IG } from "./enthalpy";
import { calc_Ent_IG } from "./entropy";

type TemperatureRange = [Temperature, Temperature];
export type GibbsSeriesResult = _ThermoSeriesResult;
export type G_IG_Method = En_IG_Method;

type GibbsBaseOptions = {
  temperature_range?: TemperatureRange;
  output_unit?: string;
  universal_gas_constant?: number;
  message?: string;
} & Record<string, unknown>;

export const GiFrEn_IG = (
  method: G_IG_Method,
  options: { temperature: Temperature } & GibbsBaseOptions,
): CustomProperty | null => {
  const {
    temperature,
    temperature_range,
    output_unit,
    universal_gas_constant = DEFAULT_R_J_MOLK,
    message,
    ...coeffs
  } = options;

  try {
    if (!isTemperature(temperature)) {
      console.error("Invalid temperature input. Must be of type Temperature.");
      return null;
    }
    const T = toKelvin(temperature);
    if (!validateTemperatureRangeInclusive(T, temperature_range)) return null;

    const tempK: Temperature = { value: T, unit: "K" };

    const H = calc_En_IG(method, {
      temperature: tempK,
      temperature_range,
      output_unit: "J/mol",
      universal_gas_constant,
      ...coeffs,
    });
    if (!H) return null;

    const S = calc_Ent_IG(method, {
      temperature: tempK,
      temperature_range,
      output_unit: "J/mol.K",
      universal_gas_constant,
      ...coeffs,
    });
    if (!S) return null;

    let G = H.value - T * S.value;
    let unit = "J/mol";
    if (output_unit) {
      G = toUnit(G, "J/mol", output_unit);
      unit = output_unit;
    }

    maybeLogMessage("Ideal gas Gibbs free energy calculation successful", message);
    return buildCustomProperty(G, unit, GiEn_IG_SYMBOL);
  } catch (error) {
    console.error(`Error in ideal gas Gibbs free energy calculation: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

export const GiFrEn_IG_ranges = (
  method: G_IG_Method,
  options: { temperatures: Temperature[] } & GibbsBaseOptions,
): GibbsSeriesResult | null => {
  const {
    temperatures,
    temperature_range,
    output_unit,
    universal_gas_constant = DEFAULT_R_J_MOLK,
    message,
    ...coeffs
  } = options;
  try {
    if (!Array.isArray(temperatures) || !temperatures.every(isTemperature)) {
      console.error("temperatures must be an array of valid Temperature values.");
      return null;
    }
    const xs: number[] = [];
    const ys: number[] = [];
    for (const temperature of temperatures) {
      const Tk = toKelvin(temperature);
      xs.push(Tk);
      const g = GiFrEn_IG(method, {
        temperature: { value: Tk, unit: "K" },
        temperature_range,
        output_unit,
        universal_gas_constant,
        ...coeffs,
      });
      ys.push(g?.value ?? 0);
    }
    maybeLogMessage("Ideal gas Gibbs free energy range calculation successful", message);
    return { values: { x: xs, y: ys }, unit: output_unit ?? "J/mol" };
  } catch (error) {
    console.error(`Error in ideal gas Gibbs free energy range calculation: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

export const dGiFrEn_IG = (
  method: G_IG_Method,
  options: { T_initial: Temperature; T_final: Temperature } & GibbsBaseOptions,
): CustomProperty | null => {
  const {
    T_initial,
    T_final,
    temperature_range,
    output_unit,
    universal_gas_constant = DEFAULT_R_J_MOLK,
    message,
    ...coeffs
  } = options;
  try {
    const gi = GiFrEn_IG(method, {
      temperature: T_initial,
      temperature_range,
      output_unit,
      universal_gas_constant,
      ...coeffs,
    });
    if (!gi) return null;
    const gf = GiFrEn_IG(method, {
      temperature: T_final,
      temperature_range,
      output_unit,
      universal_gas_constant,
      ...coeffs,
    });
    if (!gf) return null;
    maybeLogMessage("Ideal gas Gibbs free energy change calculation successful", message);
    return buildCustomProperty(gf.value - gi.value, output_unit ?? "J/mol", "dGiEn_IG");
  } catch (error) {
    console.error(`Error in ideal gas Gibbs free energy change calculation: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};
