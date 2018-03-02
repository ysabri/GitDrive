import {Repository} from "../model/repository";
import {assertNever} from "../util/errors-util";
import {git} from "./core-git";

/** The supported reset methods, no hard resets. */
export const enum ResetMode {
    Soft = 0,
    Mixed,
}

/**
 * Expand the args for a reset type.
 * @param mode A rest type we defined
 * @param targetRef A ref to reset to.
 */
function getRestArgs(
    mode: ResetMode,
    targetRef: string,
): string[] {
    switch (mode) {
        case ResetMode.Mixed:
            return ["reset", targetRef];
        case ResetMode.Soft:
            return ["reset", "--soft", targetRef];
        default:
            return assertNever(mode, `An unknown reset type: ${mode}`);
    }
}
/**
 * Reset the indexing area to the state of a the target ref using the
 * given mode.
 * @param repo A repo where the reset will happen
 * @param targetRef A ref to reset to.
 * @param mode A reset type from an exported type we defined.
 */
export async function reset(
    repo: Repository,
    targetRef: string,
    mode: ResetMode,
): Promise<true> {
    const args = getRestArgs(mode, targetRef);
    await git(args, repo.path);
    return true;
}

/**
 * Reset the indexing area state of the paths to the state of the given ref
 * using the given type. The command will take absolute paths, or relative
 * paths that start from the top directory in the repo.
 * For windows, paths will be broken in half if there are too many. The
 * function will also wait for the recursive calls to finish before it returns.
 * @param repo A repo where the reset will happen.
 * @param targetRef A ref to reset to.
 * @param mode A reset type from an exported type we defined.
 * @param paths The paths to reset.
 */
export async function restPath(
    repo: Repository,
    targetRef: string,
    mode: ResetMode,
    paths: ReadonlyArray<string>,
): Promise<void> {
    if (!paths.length) {
        return;
    }

    const firstArgs = getRestArgs(mode, targetRef);

    /**
     * So here is the worst case scenario math behind 124: Given that the total
     * length for a command is 32,767 chars. The max absolute path length is
     * 260.The maximum length for a ref is 127 chars (a branch). And given that
     * "git reset (127 ref chars) -- " is a 141 chars. This leaves 32,767 -
     * 141 = 32,626 chars for the paths. So since each path is separated by a
     * space, then |_32,626 / 261_| - 1 = 124 paths.
     * TODO: make win32 a global variable, asking process every time is not
     * good for performance.
     */
    if (process.platform === "win32" && mode === ResetMode.Mixed) {
        if (paths.length > 124) {
            await slicePathsReset(repo, firstArgs, paths);
        } else {
            const args = [...firstArgs, "--", ...paths];
            await git(args, repo.path);
        }
    } else {
        const args = [...firstArgs, "--", ...paths];
        await git(args, repo.path);
    }


}
/**
 * Helper function that will recursively break paths in half till the length
 * requirement is met, then it will call reset on all the halves.
 */
async function slicePathsReset(
    repo: Repository,
    firstArgs: string[],
    paths: ReadonlyArray<string>,
): Promise<void> {
    // base case.
    if (paths.length < 125) {
        const args = [...firstArgs, "--", ...paths];
        await git(args, repo.path);
        return;
    }
    // first half of paths
    await slicePathsReset(repo, firstArgs, paths.slice(0, paths.length / 2));
    // second half of paths
    await slicePathsReset(repo, firstArgs, paths.slice(paths.length / 2, paths.length));
}

/**
 * Un-stages everything in the indexing area.
 * @param repo Repo to do the reset on.
 */
export async function unstageResetAll(
    repo: Repository,
): Promise<true> {
    const args = ["reset", "--", "."];
    await git(args, repo.path);
    return true;
}
