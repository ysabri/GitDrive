import { IGitExecutionOptions as GExecOption, IGitResult as GResult } from "dugite";
export interface ITest {
    testing: string;
}
/**
 * Wrapper around the dugite exec process in order to extended if desired.
 * The function will always return a result even if the git process failed
 * to execute.
 * @param args          The arguments to pass to the git process.
 * @param cwd           The current working directory path for the command
 *                      being executed (this will not be needed for all the
 *                      commands).
 * @param ExecOptions   A bunch of environment, stdin, std  encoding, buffer
 *                      size, callback after spawn options for the when the
 *                      git process gets executed.
 */
export declare function git(args: string[], cwd: string, ExecOptions?: GExecOption): Promise<GResult>;
