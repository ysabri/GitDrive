import {
    Branch,
    Repository,
} from "../../model/git";
import { git } from "./core-git";

/**
 * Checkout given branch.
 * TODO: figure out what to do for remotes with no locals, for now this
 * should be enough.
 * TODO: add progress callback to the funnction.
 * @param repo The repo where to checkout the branch.
 * @param branch The branch to checkout, not string because the branch
 * has to exist.
 */
export async function checkoutBranch(
    repo: Repository,
    branch: Branch | string,
): Promise<void> {
    let args: string[];
    if (typeof branch === "string") {
        args = ["checkout", branch];
    } else {
        args = ["checkout", branch.name];
    }
    await git(args, repo.path);
}

/**
 * Partially checkout the given paths into the current working tree.
 * There should only be one working tree anyways and this should be done on an
 * empty indexing area.
 * TODO: do the work around for windows here too.
 * @param repo Repo where the checkout will get performed
 * @param paths the list of paths to checkout
 */
export async function partialCheckout(
    repo: Repository,
    targetRef: string,
    paths: ReadonlyArray<string>,
): Promise<void> {
    const args = ["checkout", targetRef, "--", ...paths];
    await git(args, repo.path);
}

/**
 * Creates an orphan branch based on a checkout of the startPoint state,
 * the branch points to no commits.
 * IMPORTANT: I would have created a branch obj but an orphan branch has no tip
 * commit yet. The caller should be responsible for creating the first commit
 * obj on the branch and then the branch obj. Make sure that this is done
 * before checking out any other branch because git for-each-ref will not list
 * the orphan branch unless there is a commit on it since checking out another
 * branch before committing on an orphan branch discards the orphan branch.
 * @param repo Repo where the orphan branch will get created.
 * @param branchName Name of the orphan branch.
 * @param startPoint The SHA to base the orphan checkout on.
 */
export async function orphanCheckout(
    repo: Repository,
    branchName: string,
    startPoint: string,
): Promise<void> {
    // This check has to be done here since a new branch is getting created,
    // and the branch has to adhere to the branch len requirements. Check
    // "git-drive/branch.ts" for more info.
    if (branchName.length > 100) {
        throw new Error("Branch name is longer than 100 chars");
    }
    const args = ["checkout", "--orphan", branchName, startPoint];
    await git(args, repo.path);
}

/**
 * Create and checkout branchname at the current position of HEAD
 * @param repo repo where to checkout the new branch
 * @param branchName the name of the branch to create
 * @param startPoint The SHA of where to create the commit
 */
export async function checkoutAndCreateBranch(
    repo: Repository,
    branchName: string,
    startPoint: string,
): Promise<void> {
    if (branchName.length > 100) {
        throw new Error("Branch name is longer than 100 chars");
    }
    const args = ["checkout", "-b", branchName, startPoint];
    await git(args, repo.path);
}
