export type TimeItFnOptions = {
  label?: string;
  log?: (message: string, durationMs: number) => void;
  enabled?: boolean;
};

const defaultLogger = (message: string) => {
  console.log(message);
};

const nowMs = () => {
  const perf = typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance
    : null;
  return perf ? perf.now() : Date.now();
};

export const timeItFn = <Args extends unknown[], R>(
  fn: (...args: Args) => R,
  options: TimeItFnOptions = {},
): ((...args: Args) => R) => {
  const { label, log = defaultLogger, enabled = true } = options;

  return (...args: Args): R => {
    if (!enabled) {
      return fn(...args);
    }

    const start = nowMs();
    const result = fn(...args);

    const finish = (end: number) => {
      const durationMs = end - start;
      const name = label ?? fn.name ?? "function";
      log(`[timeIt] ${name}: ${durationMs.toFixed(3)} ms`, durationMs);
    };

    const isPromiseLike = (value: unknown): value is Promise<unknown> =>
      !!value && typeof (value as Promise<unknown>).then === "function";

    if (isPromiseLike(result)) {
      return result.finally(() => finish(nowMs())) as R;
    }

    finish(nowMs());
    return result;
  };
};
