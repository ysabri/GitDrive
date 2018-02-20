import {
    GitProcess,
    IGitExecutionOptions as GExecOption,
    IGitResult as GResult,
} from "dugite";
/**
 * Defining our own error to include more information about the cause of
 * the errors. Not used for now, it will be once the error handlers are
 * implemented.
 */
export class GError extends Error {

    /** args that made the command fail */
    public readonly args: ReadonlyArray<string>;

    public constructor(errorMsg: string | null, args: ReadonlyArray<string>) {
        // this assumes that the errorMsg is defined for now, this has to
        // to either be callable from another class or get parsed through a
        // a function that will guarantee its value to be defined
        super(errorMsg || "An Error was called based on exist status != 0");

        this.name = "internalGitError";
        this.args = args;
    }
    public toString(): string {
        return super.toString() + " " + this.args.toString();
    }
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
export async function git(
    args: string[],
    cwd: string,
    ExecOptions?: GExecOption,
): Promise<GResult> {
    const cmdOptions = {...ExecOptions};
    // await un-warps the promise here returning the object
    const execPromise = await GitProcess.exec(args, cwd, cmdOptions);

    return execPromise;
}
