// This code was refactored from: https://github.com/desktop/desktop project,
// at this link:
// https://github.com/desktop/desktop/blob/master/app/src/lib/git/spawn.ts
// and it was mainly written by: https://github.com/shiftkey

// This was not edited much in terms of functionality, I just got rid of the
// things we do not use.

import { GitProcess } from "dugite";

// tslint:disable-next-line:interface-over-type-literal
export type ProcessOutput = {
  output: Buffer,
  error: Buffer,
};

/**
 * Spawn a Git process and buffer the stdout and stderr streams, deferring
 * all processing work to the caller.
 *
 * @param args Array of strings to pass to the Git executable.
 * @param path The path to execute the command from.
 * @param stdOutMaxLength  An optional maximum number of bytes to read from stdout.
 *                         If the process writes more than this number of bytes it
 *                         will be killed silently and the truncated output is
 *                         returned.
 */
export function spawnAndComplete(
  args: string[],
  path: string,
  stdOutMaxLength?: number,
): Promise<ProcessOutput> {
    return new Promise<ProcessOutput>((resolve, reject) => {
        const process = GitProcess.spawn(args, path);
        let totalStdoutLength = 0;
        let killSignalSent = false;

        const stdoutChunks = new Array<Buffer>();
        process.stdout.on("data", (chunk: Buffer) => {
            if (!stdOutMaxLength || totalStdoutLength < stdOutMaxLength) {
            stdoutChunks.push(chunk);
            totalStdoutLength += chunk.length;
            }

            if (
            stdOutMaxLength &&
            totalStdoutLength >= stdOutMaxLength &&
            !killSignalSent
            ) {
            process.kill();
            killSignalSent = true;
            }
        });

        const stderrChunks = new Array<Buffer>();
        process.stderr.on("data", (chunk: Buffer) => {
            stderrChunks.push(chunk);
        });

        process.on("error", (err) => {
            // for unhandled errors raised by the process, let's surface this in the
            // promise and make the caller handle it
            reject(err);
        });

        process.on("close", (code, signal) => {
            const stdout = Buffer.concat(
            stdoutChunks,
            stdOutMaxLength
                ? Math.min(stdOutMaxLength, totalStdoutLength)
                : totalStdoutLength,
            );

            const stderr = Buffer.concat(stderrChunks);

            // mimic the experience of GitProcess.exec for handling known codes when
            // the process terminates
            let exitCodes;
            if (args[args.length - 2] === "/dev/null") {
                exitCodes = new Set([0, 1]);
            } else {
                exitCodes = new Set([0]);
            }

            if (exitCodes.has(code) || signal) {
            resolve({
                error: stderr,
                output: stdout,
            });
            return;
            } else {
            reject(
                new Error(
                `Git returned an unexpected exit code '${code}' which should be handled by the caller.'`,
                ),
            );
            }
        });
    });
}
