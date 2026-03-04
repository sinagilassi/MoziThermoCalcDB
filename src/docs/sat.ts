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
/**
 * Calculates the vapor pressure for a given component at a specified temperature using the provided model source.
 *
 * @param component - The chemical component for which vapor pressure is calculated.
 * @param model_source - The source of thermodynamic model parameters.
 * @param temperature - The temperature at which vapor pressure is evaluated.
 * @param component_key - The key used to identify the component in the model source (default: "Name-Formula").
 * @returns The calculated vapor pressure as a CustomProperty, or null if an error occurs.
 */
const calc_VaPrCore = (
  component: Component,
  model_source: ModelSource,
  temperature: Temperature,
  component_key: ComponentKey = "Name-Formula",
): CustomProperty | null => {
  try {
    // NOTE: Initialize source
    const source = new Source(model_source, component_key);

    // NOTE: Initialize vapor pressure calculator
    const vapr = new ComponentVaporPressure(component, source, component_key);

    // NOTE: Calculate vapor pressure
    return vapr.calc_VaPr(temperature);
  } catch (error) {
    logError(`Error calculating vapor pressure for component '${component.name}'`, error);
    return null;
  }
};

/**
 * Calculates the vapor pressure for a given component over a range of temperatures using the provided model source.
 *
 * @param component - The chemical component for which vapor pressure is calculated.
 * @param model_source - The source of thermodynamic model parameters.
 * @param temperatures - Array of temperatures at which vapor pressure is evaluated.
 * @param component_key - The key used to identify the component in the model source (default: "Name-Formula").
 * @returns Array of vapor pressure results as CustomProperty, or null if an error occurs.
 */
const calc_VaPr_rangeCore = (
  component: Component,
  model_source: ModelSource,
  temperatures: Temperature[],
  component_key: ComponentKey = "Name-Formula",
): CustomProperty[] | null => {
  try {
    // NOTE: Initialize source
    const source = new Source(model_source, component_key);

    // NOTE: Initialize vapor pressure calculator
    const vapr = new ComponentVaporPressure(component, source, component_key);

    // NOTE: Calculate vapor pressure range
    return vapr.calc_VaPr_range(temperatures);
  } catch (error) {
    logError(`Error calculating vapor pressure range for component '${component.name}'`, error);
    return null;
  }
};

// SECTION: Enthalpy of Vaporization
/**
 * Calculates the enthalpy of vaporization for a given component at a specified temperature using the provided model source.
 *
 * @param component - The chemical component for which enthalpy of vaporization is calculated.
 * @param model_source - The source of thermodynamic model parameters.
 * @param temperature - The temperature at which enthalpy of vaporization is evaluated.
 * @param component_key - The key used to identify the component in the model source (default: "Name-Formula").
 * @returns The calculated enthalpy of vaporization as a CustomProperty, or null if an error occurs.
 */
const calc_EnVapCore = (
  component: Component,
  model_source: ModelSource,
  temperature: Temperature,
  component_key: ComponentKey = "Name-Formula",
): CustomProperty | null => {
  try {
    // NOTE: Initialize source
    const source = new Source(model_source, component_key);

    // NOTE: Initialize vapor pressure calculator
    const vapr = new ComponentVaporPressure(component, source, component_key);

    // NOTE: Calculate enthalpy of vaporization
    return vapr.calc_EnVap_Clapeyron(temperature);
  } catch (error) {
    logError(`Error calculating enthalpy of vaporization for component '${component.name}'`, error);
    return null;
  }
};

/**
 * Calculates the enthalpy of vaporization for a given component over a range of temperatures using the provided model source.
 *
 * @param component - The chemical component for which enthalpy of vaporization is calculated.
 * @param model_source - The source of thermodynamic model parameters.
 * @param temperatures - Array of temperatures at which enthalpy of vaporization is evaluated.
 * @param component_key - The key used to identify the component in the model source (default: "Name-Formula").
 * @returns Array of enthalpy of vaporization results as CustomProperty, or null if an error occurs.
 */
const calc_EnVap_rangeCore = (
  component: Component,
  model_source: ModelSource,
  temperatures: Temperature[],
  component_key: ComponentKey = "Name-Formula",
): CustomProperty[] | null => {
  try {
    // NOTE: Initialize source
    const source = new Source(model_source, component_key);

    // NOTE: Initialize vapor pressure calculator
    const vapr = new ComponentVaporPressure(component, source, component_key);

    // NOTE: Calculate enthalpy of vaporization range
    return vapr.calc_EnVap_Clapeyron_range(temperatures);
  } catch (error) {
    logError(`Error calculating enthalpy of vaporization range for component '${component.name}'`, error);
    return null;
  }
};

// SECTION: Saturated Temperature
/**
 * Calculates the saturated temperature for a given component at a specified pressure using the provided model source.
 *
 * @param component - The chemical component for which saturated temperature is calculated.
 * @param model_source - The source of thermodynamic model parameters.
 * @param pressure - The pressure at which saturated temperature is evaluated.
 * @param temperature_guess - Optional initial guess for the temperature.
 * @param T_bracket - Optional bracket for temperature search as [min, max].
 * @param method - Numerical method to use (default: "auto").
 * @param tol - Tolerance for convergence (default: 1e-6).
 * @param max_iter - Maximum number of iterations (default: 50).
 * @param h - Optional step size for numerical differentiation.
 * @param component_key - The key used to identify the component in the model source (default: "Name-Formula").
 * @returns The calculated saturated temperature as a CustomProperty, or null if an error occurs.
 */
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
    // NOTE: Initialize source
    const source = new Source(model_source, component_key);

    // NOTE: Initialize vapor pressure calculator
    const vapr = new ComponentVaporPressure(component, source, component_key);

    // NOTE: Calculate saturated temperature
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
/**
 * Calculates the sensitivity of vapor pressure with respect to temperature for a given component at a specified temperature.
 *
 * @param component - The chemical component for which vapor pressure sensitivity is calculated.
 * @param model_source - The source of thermodynamic model parameters.
 * @param temperature - The temperature at which sensitivity is evaluated.
 * @param component_key - The key used to identify the component in the model source (default: "Name-Formula").
 * @returns The calculated sensitivity as a CustomProperty, or null if an error occurs.
 */
const calc_VaPr_sensitivityCore = (
  component: Component,
  model_source: ModelSource,
  temperature: Temperature,
  component_key: ComponentKey = "Name-Formula",
): CustomProperty | null => {
  try {
    // NOTE: Initialize source
    const source = new Source(model_source, component_key);

    // NOTE: Initialize vapor pressure calculator
    const vapr = new ComponentVaporPressure(component, source, component_key);

    // NOTE: Calculate vapor pressure sensitivity
    return vapr.calc_dPsat__dT(temperature);
  } catch (error) {
    logError(`Error calculating vapor pressure sensitivity for component '${component.name}'`, error);
    return null;
  }
};

/**
 * Calculates the sensitivity of vapor pressure with respect to temperature for a given component over a range of temperatures.
 *
 * @param component - The chemical component for which vapor pressure sensitivity is calculated.
 * @param model_source - The source of thermodynamic model parameters.
 * @param temperatures - Array of temperatures at which sensitivity is evaluated.
 * @param component_key - The key used to identify the component in the model source (default: "Name-Formula").
 * @returns Array of sensitivity results as CustomProperty, or null if an error occurs.
 */
const calc_VaPr_sensitivity_rangeCore = (
  component: Component,
  model_source: ModelSource,
  temperatures: Temperature[],
  component_key: ComponentKey = "Name-Formula",
): CustomProperty[] | null => {
  try {
    // NOTE: Initialize source
    const source = new Source(model_source, component_key);

    // NOTE: Initialize vapor pressure calculator
    const vapr = new ComponentVaporPressure(component, source, component_key);

    // NOTE: Calculate vapor pressure sensitivity range
    return vapr.calc_dPsat__dT_range(temperatures);
  } catch (error) {
    logError(`Error calculating vapor pressure sensitivity range for component '${component.name}'`, error);
    return null;
  }
};


// SECTION: Exported Functions with Timing
export const calc_VaPr = timeItFn(calc_VaPrCore, { label: "calc_VaPr" });
export const calc_VaPr_range = timeItFn(calc_VaPr_rangeCore, { label: "calc_VaPr_range" });
export const calc_EnVap = timeItFn(calc_EnVapCore, { label: "calc_EnVap" });
export const calc_EnVap_range = timeItFn(calc_EnVap_rangeCore, { label: "calc_EnVap_range" });
export const calc_T_sat = timeItFn(calc_T_satCore, { label: "calc_T_sat" });
export const calc_VaPr_sensitivity = timeItFn(calc_VaPr_sensitivityCore, { label: "calc_VaPr_sensitivity" });
export const calc_VaPr_sensitivity_range = timeItFn(calc_VaPr_sensitivity_rangeCore, { label: "calc_VaPr_sensitivity_range" });
