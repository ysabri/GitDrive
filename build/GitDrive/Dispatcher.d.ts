import { IGitExecutionOptions as GExecOption, IGitResult as GResult } from "dugite";
/**
 * Defining our own error to include more information about the cause of
 * the errors. Not used for now, it will be once the error handlers are
 * implemented.
 */
export declare class GError extends Error {
    /** args that made the command fail */
    readonly args: ReadonlyArray<string>;
    constructor(errorMsg: string | null, args: ReadonlyArray<string>);
    toString(): string;
}
/**
 * Wrapper around dugite exec process in order to extended on it if desired.
 * The function will fulfil the promise with GResult that will contain any git
 * related errors. Or will reject when the git executable fails to launch,
 * in which case the thrown Error will have a string `code` property. See
 * * `dugite/errors.ts` for some of the known error codes.
 *
 * @param args          The arguments to pass to the git process.
 * @param cwd           The current working directory path for the command
 *                      being executed (this will not be needed for all the
 *                      commands).
 * @param ExecOptions   A bunch of environment, stdin, std  encoding, buffer
 *                      size, callback after spawn options for the when the
 *                      git process gets executed.
 */
export declare function git(args: string[], cwd: string, ExecOptions?: GExecOption): Promise<GResult>;
