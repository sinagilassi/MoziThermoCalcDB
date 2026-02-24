export type SolverResult = {
  root: number;
  converged: boolean;
  iterations: number;
};

const square = (x: number) => x * x;

export const leastSquaresSolve = (
  fn: (x: number) => number,
  guess: number,
  bounds?: [number, number],
  tol = 1e-6,
  maxIter = 50,
): SolverResult => {
  const g = (x: number) => square(fn(x));

  if (bounds) {
    let [a, b] = bounds;
    if (a > b) [a, b] = [b, a];

    const phi = (1 + Math.sqrt(5)) / 2;
    const resphi = 2 - phi;

    let c = b - resphi * (b - a);
    let d = a + resphi * (b - a);
    let gc = g(c);
    let gd = g(d);

    for (let i = 0; i < maxIter; i += 1) {
      if (Math.abs(b - a) <= tol || Math.min(gc, gd) <= tol) {
        const root = gc < gd ? c : d;
        return { root, converged: true, iterations: i + 1 };
      }

      if (gc < gd) {
        b = d;
        d = c;
        gd = gc;
        c = b - resphi * (b - a);
        gc = g(c);
      } else {
        a = c;
        c = d;
        gc = gd;
        d = a + resphi * (b - a);
        gd = g(d);
      }
    }

    const root = gc < gd ? c : d;
    return { root, converged: false, iterations: maxIter };
  }

  let x = guess;
  let step = Math.max(1, Math.abs(guess) * 0.1);
  let best = g(x);

  for (let i = 0; i < maxIter; i += 1) {
    if (best <= tol) {
      return { root: x, converged: true, iterations: i + 1 };
    }

    const xPlus = x + step;
    const xMinus = x - step;
    const gPlus = g(xPlus);
    const gMinus = g(xMinus);

    if (gPlus < best) {
      x = xPlus;
      best = gPlus;
      continue;
    }

    if (gMinus < best) {
      x = xMinus;
      best = gMinus;
      continue;
    }

    step *= 0.5;
    if (step <= tol) {
      return { root: x, converged: best <= tol, iterations: i + 1 };
    }
  }

  return { root: x, converged: best <= tol, iterations: maxIter };
};
