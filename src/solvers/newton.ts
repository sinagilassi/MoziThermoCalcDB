export type SolverResult = {
  root: number;
  converged: boolean;
  iterations: number;
};

export const newtonSolve = (
  fn: (x: number) => number,
  fnPrime: (x: number) => number,
  x0: number,
  tol = 1e-6,
  maxIter = 50,
): SolverResult => {
  let x = x0;
  let f = fn(x);

  for (let i = 0; i < maxIter; i += 1) {
    if (!Number.isFinite(f)) {
      return { root: x, converged: false, iterations: i };
    }
    if (Math.abs(f) <= tol) {
      return { root: x, converged: true, iterations: i };
    }

    const fp = fnPrime(x);
    if (!Number.isFinite(fp) || fp === 0) {
      return { root: x, converged: false, iterations: i };
    }

    const step = f / fp;
    const xNext = x - step;

    if (!Number.isFinite(xNext)) {
      return { root: x, converged: false, iterations: i };
    }

    if (Math.abs(xNext - x) <= tol) {
      return { root: xNext, converged: true, iterations: i + 1 };
    }

    x = xNext;
    f = fn(x);
  }

  return { root: x, converged: false, iterations: maxIter };
};
