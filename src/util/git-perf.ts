// tslint:disable-next-line:no-var-requires
const now = require("performance-now");

/** Measure an async git operation. */
export async function measure<T>(
  cmd: string,
  fn: () => Promise<T>,
): Promise<T> {

  // tslint:disable-next-line:no-console
  console.log(`Executing ${cmd}`);
  const startTime = now();

  try {
    return await fn();
  } finally {
    if (startTime) {
      const rawTime = now() - startTime;
      const timeInSeconds = (rawTime / 1000).toFixed(3);
      // tslint:disable-next-line:no-console
      console.log(`Executing ${cmd} (took ${timeInSeconds}s)`);
    }

  }
}
