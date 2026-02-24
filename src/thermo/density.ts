import type { CustomProp, CustomProperty, Pressure, Temperature } from "mozithermodb-settings";
import { buildCustomProperty, isCustomPropLike, isPressure, isTemperature, toKelvin, toPressureUnit } from "./_shared";

export const rackett = (
  temperature: Temperature,
  critical_temperature: Temperature,
  critical_pressure: Pressure,
  molecular_weight: Pick<CustomProp | CustomProperty, "value" | "unit">,
  critical_compressibility: Pick<CustomProp | CustomProperty, "value" | "unit">,
  message?: string,
): CustomProperty | null => {
  try {
    if (!isTemperature(temperature) || !isTemperature(critical_temperature)) {
      console.error("Invalid temperature input. Must be of type Temperature.");
      return null;
    }
    if (!isPressure(critical_pressure)) {
      console.error("Invalid critical pressure input. Must be of type Pressure.");
      return null;
    }
    if (!isCustomPropLike(molecular_weight) || !isCustomPropLike(critical_compressibility)) {
      console.error("Invalid custom property input for molecular weight or compressibility.");
      return null;
    }

    if (temperature.value <= 0 || critical_temperature.value <= 0) {
      console.warn("Temperature values must be greater than zero.");
      return null;
    }
    if (critical_pressure.value <= 0) {
      console.warn("Critical pressure must be greater than zero.");
      return null;
    }

    const T = toKelvin(temperature);
    const Tc = toKelvin(critical_temperature);
    const PcBar = toPressureUnit(critical_pressure, "bar");

    let mw = Number(molecular_weight.value);
    const mwUnit = molecular_weight.unit;
    if (mwUnit === "g/mol" || mwUnit === "kg/kmol") {
      mw /= 1000;
    } else if (mwUnit !== "kg/mol") {
      console.warn(`Unsupported molecular weight unit: ${mwUnit}. Expected 'kg/mol'.`);
      return null;
    }

    const zc = Number(critical_compressibility.value);
    if (!Number.isFinite(zc)) {
      console.error("Critical compressibility must be numeric.");
      return null;
    }

    const R = 8.31446261815324e-5; // bar·m^3/mol·K
    const Tr = T / Tc;
    const exponent = 1 + (1 - Tr) ** (2 / 7);
    const vSat = (R * Tc / PcBar) * zc ** exponent; // m^3/mol
    const rho = mw / vSat; // kg/m3

    if (message != null) {
      console.log(`Rackett density calculation successful${message}`);
    }

    return buildCustomProperty(rho, "kg/m3", "rho_LIQ");
  } catch (error) {
    console.error(`Error in rackett calculation: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};
