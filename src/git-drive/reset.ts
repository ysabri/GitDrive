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
 * using the given type.
 * TODO: look into the windows command length, since it is only 32767 chars,
 * and it is really easy to get that much with paths.
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

    const resetArgs = getRestArgs(mode, targetRef);

    const args = [...resetArgs, "--", ...paths];

    await git(args, repo.path);

}
