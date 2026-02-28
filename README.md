# MoziThermoCalcDB 🧪

[![npm](https://img.shields.io/npm/v/mozithermocalcdb)](https://www.npmjs.com/package/mozithermocalcdb)
[![npm downloads](https://img.shields.io/npm/dm/mozithermocalcdb?color=brightgreen)](https://www.npmjs.com/package/mozithermocalcdb)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

A TypeScript library for thermodynamic property calculations — vapor pressure, ideal-gas enthalpy, entropy, Gibbs free energy, heat capacity, and liquid density.


## 📦 Install

```bash
npm install mozithermocalcdb
```

## ⚡ Quick Start

```ts
import {
  antoine,
  En_IG_NASA7_polynomial,
  S_IG_NASA7_polynomial,
  Cp_IG_NASA7_polynomial,
  GiFrEn_IG,
} from "mozithermocalcdb";

const T = { value: 300, unit: "K" };

// Vapor pressure via Antoine equation
const P = antoine(8.07131, 1730.63, 233.426, T, undefined, "mmHg", "log10");

// Ideal-gas enthalpy, entropy, heat capacity (NASA7)
const H  = En_IG_NASA7_polynomial(3.5, 1e-3, -2e-6, 5e-9, -1e-12, -1000, 2, T);
const S  = S_IG_NASA7_polynomial( 3.5, 1e-3, -2e-6, 5e-9, -1e-12, -1000, 2, T);
const Cp = Cp_IG_NASA7_polynomial(3.5, 1e-3, -2e-6, 5e-9, -1e-12,     0, 0, T);

// Gibbs free energy dispatcher
const G = GiFrEn_IG("NASA7", {
  temperature: T,
  a1: 3.5, a2: 1e-3, a3: -2e-6, a4: 5e-9, a5: -1e-12, a6: -1000, a7: 2,
});

console.log({ P, H, S, Cp, G });
```

---

## 🌡️ Vapor Pressure

### `antoine` — Antoine equation

```
log₁₀(P) = A − B / (T + C)    (base: "log10")
ln(P)     = A − B / (T + C)    (base: "ln")
```

```ts
import { antoine } from "mozithermocalcdb";

const P = antoine(
  A, B, C,          // Antoine constants
  temperature,      // Temperature object { value, unit }
  temperatureRange, // Optional [Tmin, Tmax] validity range
  outputUnit,       // Optional pressure unit label
  base,             // "log10" (default) | "ln"
);
// Returns: CustomProperty | null
```

> ⚠️ No automatic unit conversion is applied — the caller is responsible for ensuring constants and units are consistent.

---

### `wagner` — Wagner equation

```
ln(P / Pc) = [A·τ + B·τ^1.5 + C·τ^2.5 + D·τ^5] / (1 − τ)
τ = 1 − T / Tc
```

```ts
import { wagner } from "mozithermocalcdb";

const P = wagner(
  A, B, C, D,           // Wagner constants
  temperature,          // Current temperature
  criticalTemperature,  // Tc
  criticalPressure,     // Pc
  temperatureRange,     // Optional [Tmin, Tmax]
  outputUnit,           // Optional output unit label
);
// Returns: CustomProperty | null
// Requires: T < Tc
```

---

## 🔥 Ideal-Gas Enthalpy

All functions return `CustomProperty | null`. Default output unit: **J/mol**.

### NASA 7-coefficient polynomial

```
H = R·T·(a1 + a2·T/2 + a3·T²/3 + a4·T³/4 + a5·T⁴/5 + a6/T)
```

```ts
import {
  En_IG_NASA7_polynomial,         // single point
  En_IG_NASA7_polynomial_range,   // evenly-spaced temperature range → series
  En_IG_NASA7_polynomial_ranges,  // arbitrary temperature array → series
  dEn_IG_NASA7_polynomial,        // ΔH = H(T_final) − H(T_initial)
} from "mozithermocalcdb";

// Single point
const H = En_IG_NASA7_polynomial(a1, a2, a3, a4, a5, a6, a7, temperature);

// Range (returns { values: { x: number[], y: number[] }, unit: string })
const series = En_IG_NASA7_polynomial_range(a1, a2, a3, a4, a5, a6, a7, T_low, T_high, T_points);

// Sensible heat effect
const dH = dEn_IG_NASA7_polynomial(a1, a2, a3, a4, a5, a6, a7, T_initial, T_final);
```

### NASA 9-coefficient polynomial

```
H = R·(−a1/T + a2·ln(T) + a3·T + a4·T²/2 + a5·T³/3 + a6·T⁴/4 + a7·T⁵/5 + b1)
```

```ts
import { En_IG_NASA9_polynomial, dEn_IG_NASA9_polynomial } from "mozithermocalcdb";

const H  = En_IG_NASA9_polynomial(a1, a2, a3, a4, a5, a6, a7, b1, b2, temperature);
const dH = dEn_IG_NASA9_polynomial(a1, a2, a3, a4, a5, a6, a7, b1, b2, T_initial, T_final);
```

### Shomate equation

```
H = A·t + B·t²/2 + C·t³/3 + D·t⁴/4 − E/t + F     (t = T / 1000)
```

```ts
import { En_IG_shomate, En_IG_shomate_range } from "mozithermocalcdb";

const H      = En_IG_shomate(A, B, C, D, E, F, G, temperature);  // Default: kJ/mol
const series = En_IG_shomate_range(A, B, C, D, E, F, G, T_low, T_high, T_points);
```

### Dispatcher

```ts
import { calc_En_IG } from "mozithermocalcdb";

const H = calc_En_IG("NASA7", { temperature: T, a1, a2, a3, a4, a5, a6, a7 });
const H = calc_En_IG("NASA9", { temperature: T, a1, a2, a3, a4, a5, a6, a7, b1, b2 });
const H = calc_En_IG("Shomate", { temperature: T, A, B, C, D, E, F, G });
```

---

## 🌀 Ideal-Gas Entropy

Default output unit: **J/mol·K**.

### NASA7

```
S = R·(a1·ln(T) + a2·T + a3·T²/2 + a4·T³/3 + a5·T⁴/4 + a7)
```

```ts
import {
  S_IG_NASA7_polynomial,
  S_IG_NASA7_polynomial_range,
  dS_IG_NASA7_polynomial,
} from "mozithermocalcdb";
```

### NASA9

```
S = R·(−a1/(2·T²) − a2/T + a3·ln(T) + a4·T + a5·T²/2 + a6·T³/3 + a7·T⁴/4 + b2)
```

```ts
import { S_IG_NASA9_polynomial, dS_IG_NASA9_polynomial } from "mozithermocalcdb";
```

### Shomate

```
S = A·ln(t) + B·t + C·t²/2 + D·t³/3 − E/(2·t²) + G     (t = T / 1000)
```

```ts
import { S_IG_shomate, S_IG_shomate_range } from "mozithermocalcdb";
```

### Dispatcher

```ts
import { calc_Ent_IG } from "mozithermocalcdb";

const S = calc_Ent_IG("NASA7",   { temperature: T, a1, a2, a3, a4, a5, a6, a7 });
const S = calc_Ent_IG("NASA9",   { temperature: T, a1, a2, a3, a4, a5, a6, a7, b1, b2 });
const S = calc_Ent_IG("Shomate", { temperature: T, A, B, C, D, E, F, G });
```

---

## ⚗️ Gibbs Free Energy

Computed as **G = H − T·S** using the enthalpy and entropy functions above. Default output unit: **J/mol**.

```ts
import { GiFrEn_IG, GiFrEn_IG_ranges, dGiFrEn_IG } from "mozithermocalcdb";

// Single temperature
const G = GiFrEn_IG("NASA7", {
  temperature: T,
  a1, a2, a3, a4, a5, a6, a7,
});

// Multiple temperatures (series)
const series = GiFrEn_IG_ranges("NASA7", {
  temperatures: [T1, T2, T3],
  a1, a2, a3, a4, a5, a6, a7,
});

// ΔG = G(T_final) − G(T_initial)
const dG = dGiFrEn_IG("NASA7", {
  T_initial,
  T_final,
  a1, a2, a3, a4, a5, a6, a7,
});
```

Available methods: `"NASA7"` | `"NASA9"` | `"Shomate"`

---

## 🌡️ Heat Capacity

Default output unit: **J/mol·K**.

### Generic polynomial

```
Cp = A + B·T + C·T² + D·T³ + E/T²
```

```ts
import { Cp_IG_polynomial } from "mozithermocalcdb";

const Cp = Cp_IG_polynomial(A, B, C, D, E, temperature);
```

### NASA7 / NASA9 / Shomate

```ts
import {
  Cp_IG_NASA7_polynomial,  // Cp = R·(a1 + a2·T + a3·T² + a4·T³ + a5·T⁴)
  Cp_IG_NASA9_polynomial,  // Cp = R·(a1·T⁻² + a2·T⁻¹ + a3 + a4·T + … + a7·T⁴)
  Cp_IG_shomate,           // Cp = A + B·t + C·t² + D·t³ + E/t²  (t = T/1000)
} from "mozithermocalcdb";
```

### Dispatcher

```ts
import { Cp_IG } from "mozithermocalcdb";

const Cp = Cp_IG("NASA7",   { temperature: T, a1, a2, a3, a4, a5, a6, a7 });
const Cp = Cp_IG("NASA9",   { temperature: T, a1, a2, a3, a4, a5, a6, a7, b1, b2 });
const Cp = Cp_IG("SHOMATE", { temperature: T, A, B, C, D, E });
```

---

## 💧 Liquid Density — Rackett Correlation

```
Tr  = T / Tc
exp = 1 + (1 − Tr)^(2/7)
Vs  = (R·Tc / Pc) · Zc^exp
ρ   = MW / Vs
```

Output unit: **kg/m³**.

```ts
import { rackett } from "mozithermocalcdb";

const rho = rackett(
  temperature,             // Current temperature
  critical_temperature,    // Tc
  critical_pressure,       // Pc  (bar recommended; R = 8.314×10⁻⁵ bar·m³/mol·K)
  molecular_weight,        // MW  — accepts g/mol, kg/mol, or kg/kmol
  critical_compressibility // Zc
);
// Returns CustomProperty | null  (symbol: "rho_LIQ", unit: "kg/m³")
```

---

## 🔬 Advanced: `ComponentVaporPressure`

The `ComponentVaporPressure` class (in `src/core/vp.ts`) adds root-finding solvers on top of the basic Antoine/Wagner equations. It is not exported from the main entry point.

### Root-finding methods

| Method | Requires | Notes |
|---|---|---|
| `"newton"` | `temperatureGuess` | Fast near the root |
| `"brentq"` | `T_bracket` | Robust bracketed method |
| `"bisect"` | `T_bracket` | Simple, guaranteed convergence |
| `"least_squares"` | `temperatureGuess` | Optional bounds |
| `"auto"` | — | Uses `brentq` if bracket given, else `newton` |

### Available calculations

| Method | Returns | Unit |
|---|---|---|
| `calc_VaPr(T)` | Saturation pressure | Pa |
| `calc_VaPr_range(Ts)` | Psat array | Pa |
| `calc_TeVaPr(P, ...)` | Saturation temperature | K |
| `calc_EnVap_Clapeyron(T)` | Enthalpy of vaporisation | J/mol |
| `calc_dPsat__dT(T)` | dP/dT | Pa/K |

### Example

```ts
import { ComponentVaporPressure } from "mozithermocalcdb/core"; // internal path

const component = { Name: "Water", Formula: "H2O", State: "liquid" };
const source = { datasource: { ... }, equationsource: { ... } };

const vp = new ComponentVaporPressure(component, source);

// Saturation pressure
const Psat = vp.calc_VaPr({ value: 373.15, unit: "K" });

// Saturation temperature at 1 atm (bracketed search)
const Tsat = vp.calc_TeVaPr(
  { value: 101325, unit: "Pa" },
  undefined,
  [{ value: 300, unit: "K" }, { value: 500, unit: "K" }],
  "brentq"
);

// Enthalpy of vaporisation via Clausius-Clapeyron
const dHvap = vp.calc_EnVap_Clapeyron({ value: 373.15, unit: "K" });
```

---

## 🔢 Numerical Solvers

Internal solvers used by `ComponentVaporPressure`:

| Solver | Algorithm | Requirements |
|---|---|---|
| `newtonSolve(fn, fnPrime, x0)` | Newton-Raphson | Initial guess + derivative |
| `bisectSolve(fn, a, b)` | Bisection | Bracketed interval `[a, b]` where f(a)·f(b) < 0 |
| `brentSolve(fn, a, b)` | Brent's method | Bracketed interval (faster than bisection) |
| `leastSquaresSolve(fn, guess, bounds?)` | Minimise f(x)² | Guess; optional `[min, max]` bounds |

All solvers return `{ root: number, converged: boolean, iterations: number }`.

---


## 📄 License

Licensed under the Apache-2.0 License. See `LICENSE`.

## ❓ FAQ

For questions, contact Sina Gilassi on [LinkedIn](https://www.linkedin.com/in/sina-gilassi/).

## 👨‍💻 Author

- [@sinagilassi](https://github.com/sinagilassi)
