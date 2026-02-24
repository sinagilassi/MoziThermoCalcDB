import { describe, expect, it } from "vitest";
import {
  Cp_IG,
  Cp_IG_NASA7_polynomial,
  En_IG_NASA7_polynomial,
  S_IG_NASA7_polynomial,
  dEn_IG_NASA7_polynomial,
  dS_IG_NASA7_polynomial,
  GiFrEn_IG,
  dGiFrEn_IG,
  rackett,
} from "../index";

const T300 = { value: 300, unit: "K" } as const;
const T500 = { value: 500, unit: "K" } as const;

describe("thermo ports", () => {
  it("calculates NASA7 enthalpy/entropy and delta consistency", () => {
    const coeffs = { a1: 3.5, a2: 1e-3, a3: -2e-6, a4: 5e-9, a5: -1e-12, a6: -1000, a7: 2 };

    const h300 = En_IG_NASA7_polynomial(
      coeffs.a1, coeffs.a2, coeffs.a3, coeffs.a4, coeffs.a5, coeffs.a6, coeffs.a7, T300,
    );
    const h500 = En_IG_NASA7_polynomial(
      coeffs.a1, coeffs.a2, coeffs.a3, coeffs.a4, coeffs.a5, coeffs.a6, coeffs.a7, T500,
    );
    const dh = dEn_IG_NASA7_polynomial(
      coeffs.a1, coeffs.a2, coeffs.a3, coeffs.a4, coeffs.a5, coeffs.a6, coeffs.a7, T300, T500,
    );

    expect(h300).not.toBeNull();
    expect(h500).not.toBeNull();
    expect(dh).not.toBeNull();
    expect(dh!.value).toBeCloseTo(h500!.value - h300!.value, 8);

    const s300 = S_IG_NASA7_polynomial(
      coeffs.a1, coeffs.a2, coeffs.a3, coeffs.a4, coeffs.a5, coeffs.a6, coeffs.a7, T300,
    );
    const s500 = S_IG_NASA7_polynomial(
      coeffs.a1, coeffs.a2, coeffs.a3, coeffs.a4, coeffs.a5, coeffs.a6, coeffs.a7, T500,
    );
    const ds = dS_IG_NASA7_polynomial(
      coeffs.a1, coeffs.a2, coeffs.a3, coeffs.a4, coeffs.a5, coeffs.a6, coeffs.a7, T300, T500,
    );

    expect(s300).not.toBeNull();
    expect(s500).not.toBeNull();
    expect(ds).not.toBeNull();
    expect(ds!.value).toBeCloseTo(s500!.value - s300!.value, 8);
  });

  it("calculates Gibbs via H - T*S consistently", () => {
    const coeffs = { a1: 3.5, a2: 1e-3, a3: -2e-6, a4: 5e-9, a5: -1e-12, a6: -1000, a7: 2 };
    const h = En_IG_NASA7_polynomial(
      coeffs.a1, coeffs.a2, coeffs.a3, coeffs.a4, coeffs.a5, coeffs.a6, coeffs.a7, T300, undefined, "J/mol",
    );
    const s = S_IG_NASA7_polynomial(
      coeffs.a1, coeffs.a2, coeffs.a3, coeffs.a4, coeffs.a5, coeffs.a6, coeffs.a7, T300, undefined, "J/mol.K",
    );
    const g = GiFrEn_IG("NASA7", { temperature: T300, ...coeffs });
    const dg = dGiFrEn_IG("NASA7", { T_initial: T300, T_final: T500, ...coeffs });

    expect(h && s && g && dg).toBeTruthy();
    expect(g!.value).toBeCloseTo(h!.value - T300.value * s!.value, 8);
  });

  it("calculates heat capacity and dispatcher route", () => {
    const direct = Cp_IG_NASA7_polynomial(3.5, 1e-3, 0, 0, 0, 0, 0, T300);
    const routed = Cp_IG("NASA7", { temperature: T300, a1: 3.5, a2: 1e-3, a3: 0, a4: 0, a5: 0 });

    expect(direct).not.toBeNull();
    expect(routed).not.toBeNull();
    expect(routed!.value).toBeCloseTo(direct!.value, 12);
    expect(Cp_IG("NASA7", { temperature: T300, a1: 1 })).toBeNull();
  });

  it("calculates Rackett density and handles MW units", () => {
    const rho = rackett(
      { value: 300, unit: "K" },
      { value: 647.096, unit: "K" },
      { value: 220.64, unit: "bar" },
      { value: 18.01528, unit: "g/mol" },
      { value: 0.229, unit: "" },
    );

    expect(rho).not.toBeNull();
    expect(rho!.unit).toBe("kg/m3");
    expect(rho!.value).toBeGreaterThan(0);
  });
});

