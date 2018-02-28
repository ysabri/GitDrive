import {Repository} from "../model/repository";
import {git, overrideCredentialHelper } from "./core-git";

/**
 * Push the certain branch to remote repo origin, the one and only remote.
 * This will also set-up-upstream for the local branch if it is not setup.
 * We should always setup the up-streams once a remote is added.
 * Also this will rely on the value under config for the remote url info,
 * check the documentation for push for more on this.
 * TODO: add progress callbacks
 * TODO: figure out authentication.
 * TODO: error logging.
 * @param repo repo where to perform the push
 * @param localBranch the local branch to push
 */
export async function pushBranch(
    repo: Repository,
    localBranch: string,

): Promise<void> {
    const args = [...overrideCredentialHelper,
        "push",
        "-u",
        "origin",
        localBranch];

    await git(args, repo.path);
}

/**
 * Push all the branches to remote origin, the one and only.
 * TODO: refer to the pushBranch todos.
 * @param repo repo where to push all the branches
 */
export async function pushAll(
    repo: Repository,
): Promise<void> {
    const args = [...overrideCredentialHelper,
    "push",
    "--all",
    "-u",
    "origin"];

    await git(args, repo.path);
}
