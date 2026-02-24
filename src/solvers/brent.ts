export type SolverResult = {
  root: number;
  converged: boolean;
  iterations: number;
};

export const brentSolve = (
  fn: (x: number) => number,
  a: number,
  b: number,
  tol = 1e-6,
  maxIter = 50,
): SolverResult => {
  let fa = fn(a);
  let fb = fn(b);

  if (!Number.isFinite(fa) || !Number.isFinite(fb)) {
    return { root: (a + b) / 2, converged: false, iterations: 0 };
  }

  if (fa === 0) return { root: a, converged: true, iterations: 0 };
  if (fb === 0) return { root: b, converged: true, iterations: 0 };

  if (fa * fb > 0) {
    return { root: (a + b) / 2, converged: false, iterations: 0 };
  }

  let left = a;
  let right = b;
  let fLeft = fa;
  let fRight = fb;
  let s = (left + right) / 2;

  for (let iter = 0; iter < maxIter; iter += 1) {
    // Secant step
    const denom = fRight - fLeft;
    if (denom !== 0) {
      s = right - (fRight * (right - left)) / denom;
    } else {
      s = (left + right) / 2;
    }

    const min = Math.min(left, right);
    const max = Math.max(left, right);
    if (!Number.isFinite(s) || s <= min || s >= max) {
      s = (left + right) / 2;
    }

    const fs = fn(s);
    if (!Number.isFinite(fs)) {
      return { root: s, converged: false, iterations: iter + 1 };
    }

    if (Math.abs(fs) <= tol || Math.abs(right - left) <= tol) {
      return { root: s, converged: true, iterations: iter + 1 };
    }

    if (fLeft * fs < 0) {
      right = s;
      fRight = fs;
    } else {
      left = s;
      fLeft = fs;
    }
  }

  return { root: s, converged: false, iterations: maxIter };
};
