// tslint:disable-next-line:no-var-requires
const now = require("performance-now");

// let measuringPerf = false;
// let markID = 0;

// /** Start capturing git performance measurements. */
// export function start() {
//   measuringPerf = true;
// }

// /** Stop capturing git performance measurements. */
// export function stop() {
//   measuringPerf = false;
// }

/** Measure an async git operation. */
export async function measure<T>(
  cmd: string,
  fn: () => Promise<T>,
): Promise<T> {
  // const id = ++markID;

  // tslint:disable-next-line:no-console
  console.log(`Executing ${cmd}`);
  const startTime = now();

  // markBegin(id, cmd);
  try {
    return await fn();
  } finally {
    if (startTime) {
      const rawTime = now() - startTime;
      if (rawTime > 1000) {
        const timeInSeconds = (rawTime / 1000).toFixed(3);
        // tslint:disable-next-line:no-console
        console.log(`Executing ${cmd} (took ${timeInSeconds}s)`);
      }
    }

    // markEnd(id, cmd);
  }
}

// /** Mark the beginning of a git operation. */
// function markBegin(id: number, cmd: string) {
//   if (!measuringPerf) {
//     return;
//   }

//   const markName = `${id}::${cmd}`;
//   window.performance.mark(markName);
// }

// /** Mark the end of a git operation. */
// function markEnd(id: number, cmd: string) {
//   if (!measuringPerf) {
//     return;
//   }

//   const markName = `${id}::${cmd}`;
//   const measurementName = cmd;
//   window.performance.measure(measurementName, markName, "");

//   window.performance.clearMarks(markName);
//   window.performance.clearMeasures(measurementName);
// }
