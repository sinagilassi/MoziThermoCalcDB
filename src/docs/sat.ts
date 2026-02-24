import type { Component, ComponentKey, CustomProperty, Pressure, Temperature } from "mozithermodb-settings";
import type { ModelSource } from "mozithermodb";
import { Source } from "mozithermodb";

// ! LOCALS
import { ComponentVaporPressure } from "@/core/vp";
import { timeItFn } from "@/utils";

const logError = (message: string, error: unknown) => {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(`${message}: ${detail}`);
};

// SECTION: Vapor Pressure
const calc_VaPrCore = (
  component: Component,
  model_source: ModelSource,
  temperature: Temperature,
  component_key: ComponentKey = "Name-Formula",
): CustomProperty | null => {
  try {
    const source = new Source(model_source, component_key);
    const vapr = new ComponentVaporPressure(component, source, component_key);
    return vapr.calc_VaPr(temperature);
  } catch (error) {
    logError(`Error calculating vapor pressure for component '${component.name}'`, error);
    return null;
  }
};

const calc_VaPr_rangeCore = (
  component: Component,
  model_source: ModelSource,
  temperatures: Temperature[],
  component_key: ComponentKey = "Name-Formula",
): CustomProperty[] | null => {
  try {
    const source = new Source(model_source, component_key);
    const vapr = new ComponentVaporPressure(component, source, component_key);
    return vapr.calc_VaPr_range(temperatures);
  } catch (error) {
    logError(`Error calculating vapor pressure range for component '${component.name}'`, error);
    return null;
  }
};

// SECTION: Enthalpy of Vaporization
const calc_EnVapCore = (
  component: Component,
  model_source: ModelSource,
  temperature: Temperature,
  component_key: ComponentKey = "Name-Formula",
): CustomProperty | null => {
  try {
    const source = new Source(model_source, component_key);
    const vapr = new ComponentVaporPressure(component, source, component_key);
    return vapr.calc_EnVap_Clapeyron(temperature);
  } catch (error) {
    logError(`Error calculating enthalpy of vaporization for component '${component.name}'`, error);
    return null;
  }
};

const calc_EnVap_rangeCore = (
  component: Component,
  model_source: ModelSource,
  temperatures: Temperature[],
  component_key: ComponentKey = "Name-Formula",
): CustomProperty[] | null => {
  try {
    const source = new Source(model_source, component_key);
    const vapr = new ComponentVaporPressure(component, source, component_key);
    return vapr.calc_EnVap_Clapeyron_range(temperatures);
  } catch (error) {
    logError(`Error calculating enthalpy of vaporization range for component '${component.name}'`, error);
    return null;
  }
};

// SECTION: Saturated Temperature
const calc_T_satCore = (
  component: Component,
  model_source: ModelSource,
  pressure: Pressure,
  temperature_guess?: Temperature,
  T_bracket?: [Temperature, Temperature],
  method: string = "auto",
  tol: number = 1e-6,
  max_iter: number = 50,
  h?: number,
  component_key: ComponentKey = "Name-Formula",
): CustomProperty | null => {
  try {
    const source = new Source(model_source, component_key);
    const vapr = new ComponentVaporPressure(component, source, component_key);
    return vapr.calc_TeVaPr(
      pressure,
      temperature_guess,
      T_bracket,
      method,
      tol,
      max_iter,
      h,
    );
  } catch (error) {
    logError(`Error calculating saturated temperature for component '${component.name}'`, error);
    return null;
  }
};

// SECTION: Vapor Pressure Sensitivity
const calc_VaPr_sensitivityCore = (
  component: Component,
  model_source: ModelSource,
  temperature: Temperature,
  component_key: ComponentKey = "Name-Formula",
): CustomProperty | null => {
  try {
    const source = new Source(model_source, component_key);
    const vapr = new ComponentVaporPressure(component, source, component_key);
    return vapr.calc_dPsat__dT(temperature);
  } catch (error) {
    logError(`Error calculating vapor pressure sensitivity for component '${component.name}'`, error);
    return null;
  }
};

const calc_VaPr_sensitivity_rangeCore = (
  component: Component,
  model_source: ModelSource,
  temperatures: Temperature[],
  component_key: ComponentKey = "Name-Formula",
): CustomProperty[] | null => {
  try {
    const source = new Source(model_source, component_key);
    const vapr = new ComponentVaporPressure(component, source, component_key);
    return vapr.calc_dPsat__dT_range(temperatures);
  } catch (error) {
    logError(`Error calculating vapor pressure sensitivity range for component '${component.name}'`, error);
    return null;
  }
};

export const calc_VaPr = timeItFn(calc_VaPrCore, { label: "calc_VaPr" });
export const calc_VaPr_range = timeItFn(calc_VaPr_rangeCore, { label: "calc_VaPr_range" });
export const calc_EnVap = timeItFn(calc_EnVapCore, { label: "calc_EnVap" });
export const calc_EnVap_range = timeItFn(calc_EnVap_rangeCore, { label: "calc_EnVap_range" });
export const calc_T_sat = timeItFn(calc_T_satCore, { label: "calc_T_sat" });
export const calc_VaPr_sensitivity = timeItFn(calc_VaPr_sensitivityCore, { label: "calc_VaPr_sensitivity" });
export const calc_VaPr_sensitivity_range = timeItFn(calc_VaPr_sensitivity_rangeCore, { label: "calc_VaPr_sensitivity_range" });
