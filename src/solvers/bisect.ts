export type SolverResult = {
  root: number;
  converged: boolean;
  iterations: number;
};

export const bisectSolve = (
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
  let mid = (left + right) / 2;

  for (let i = 0; i < maxIter; i += 1) {
    mid = (left + right) / 2;
    const fm = fn(mid);

    if (!Number.isFinite(fm)) {
      return { root: mid, converged: false, iterations: i };
    }

    if (Math.abs(fm) <= tol || Math.abs(right - left) <= tol) {
      return { root: mid, converged: true, iterations: i + 1 };
    }

    if (fa * fm < 0) {
      right = mid;
      fb = fm;
    } else {
      left = mid;
      fa = fm;
    }
  }

  return { root: mid, converged: false, iterations: maxIter };
};
