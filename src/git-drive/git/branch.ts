import {
    Branch,
    Repository,
} from "../../model/git";
import { git } from "./core-git";
import { getBranches } from "./for-each-ref";


/**
 * Create a new branch in the repo based on a commit SHA or HEAD.
 * This will be used once upon the creation of a topic-space and
 * upon the addition of the of a user to an existing topic-space.
 * The branch will always be created on top of a commit obj,
 * not any other committish. HEAD has to be explicity specified (not an
 * optional param) to avoid errors when calling the function.
 * @param repo - Repository in which to create the branch
 * @param name - The name of the branch, must be less than 101 chars (for now)
 * @param tip - SHA of the commit obj or HEAD to create the branch at.
 */
export async function createBranch(
    repo: Repository,
    name: string,
    tip: string,
): Promise<Branch | null> {
    if (name.length > 100) {
        throw new Error("[createBranch]: The branch name is longer than" +
            " 100 chars");
    }

    const args = ["branch", name, tip];

    try {
        await git(args, repo.path);
        const branches = await getBranches(repo, `refs/heads/${name}`);
        // I do not see why this would return more than one branch, since names
        // are unique per namespace.
        if (branches.length === 1) {
            return branches[0];
        } else {
            // tslint:disable-next-line:no-console
            console.log("In createBranch: more than one branch found???");
        }
    } catch (err) {
        // For now throw the error, later it should get logged and handled.
        // tslint:disable-next-line:no-console
        console.log(err);
        throw new Error(err);
    }

    return null;
}
/**
 * Create the local equivalent of a remote branch. Unlike createBranch, the
 * method doesn't return a branch object. The reason is this method will be
 * used upon cloning or pull from a remote repo and in both cases the branch
 * object is not needed, what matters is that the branch exists.
 * @param repo Repo where the branch will be created
 * @param name The name of the local counterpart
 * @param remoteRef The remote ref name with the prefix
 */
export async function createBranchFromRemote(
    repo: Repository,
    name: string,
    remoteRef: string,
): Promise<void> {
    if (name.length > 100) {
        throw new Error("[createBranchFromRemote]: Branch name is longer" +
            " than 100 chars");
    }

    const args = ["branch", "--track", "-l", "-f", name, remoteRef];

    await git(args, repo.path);
}
/** Rename the branch given, git will reject and return error if it
 * doesn't exists
 */
export async function renameBranch(
    repo: Repository,
    branch: Branch,
    newName: string,
): Promise<void> {
    if (newName.length > 100) {
        throw new Error("Branch name is longer than 100 chars");
    }
    await git(["branch", "-m", branch.name, newName], repo.path);
}

/**
 * Delete the given branch reference. Will error out if branch doesn't
 * exist.
 * TODO: Add deletion of remote ref too.
 */
export async function deleteBranch(
    repo: Repository,
    branch: Branch,
): Promise<void> {
    // we should not use -D option since our branches will always be merged
    const args = ["branch", "-d", branch.name];
    await git(args, repo.path);
}
