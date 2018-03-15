import { commit } from "git/commit";
import { fetchAll } from "git/fetch";
import { getCommit } from "git/log";
import { pushBranch } from "git/push";
import { getStatus } from "git/status";
import { GRepository } from "models/app/g-repository";
import { User } from "models/app/user";
import { WorkSpace } from "models/app/workspace";
import { getVal } from "utils/getVal";
/**
 * The big sync function, assumes very little but demands a lot.
 * @param repo Repo where the commit, push, fetch will happen
 * @param user The user committing
 * @param workspace The workspace that the commit will be created in
 * @param summary The commit summary
 * @param body The commit message
 */
export async function sync(
    repo: GRepository,
    user: User,
    workspace: WorkSpace,
    summary: string,
    body: string,
): Promise<void> {
    // get the branch and check if user owns it
    const userBranch = getVal(user.workSpaces, workspace.name);
    if (!userBranch) {
        throw new Error("[sync] User: " + user.name + " does not own the WorkSpace: "
            + workspace.name);
    }
    // see if branch exists by getting its tip commit
    const tip = await getCommit(repo, userBranch.name);
    if (!tip) {
        throw new Error("[sync] Branch: " + userBranch.name + " doesn't exit" +
            " or was deleted from repository: " + repo.name);
    }
    // check if the tip commit belongs to user, something got really messed up
    // if this error get thrown.
    if (tip.committer.name !== user.name) {
        throw new Error("[sync] Based on the last commit, user: " + user.name +
            " doesn't own branch: " + userBranch.name + " in WorkSpace: " +
            workspace.name);
    }
    // check if the current checked out branch is the one that belong to user
    // i.e check if the caller messed up
    const status = await getStatus(repo);
    if (status.currentBranch !== userBranch.name) {
        throw new Error("[sync] The current checked-out branch is not the one "
            + "that belongs to user: " + user.name);
    }
    // commit the changes now that everything checks-out :)
    commit(repo, summary, body);
    // push the changes
    pushBranch(repo, userBranch.name);
    // pull the other branches
    fetchAll(repo);
}
