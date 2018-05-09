import {
    GRepository,
    User,
    WorkSpace,
} from "../../model/app";
import { Commit } from "../../model/git";
import { writeRepoInfo } from "../../util/metafile";
import {
    commit,
    fetchAll,
    getCommit,
    getStatus,
    pushBranch,
} from "../git";
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
    workspace: WorkSpace,
    user: User,
    summary: string,
    body: string,
): Promise<WorkSpace> {
    // TODO: add this back with the new array
    // get the branch and check if user owns it
    // const userBranch = getVal(user.workSpaces, workspace.name);
    // if (!userBranch) {
    //     throw new Error("[sync] User: " + user.name + " does not own the WorkSpace: "
    //         + workspace.name);
    // }
    // see if branch exists by getting its tip commit, I could do the same
    // thing using for-each-ref

    // check if the tip commit belongs to user, something got really messed up
    // if this error gets thrown.
    if (workspace.tip.committer.name !== user.name) {
        throw new Error("[sync] Based on the tip commit, user: " + user.name +
            " doesn't own workspace: " + workspace.name);
    }
    // check if the current checked out branch is the one that belong to user
    // i.e check if the caller messed up
    const status = await getStatus(repo);
    if (status.currentBranch !== workspace.name) {
        throw new Error("[sync] The current checked-out branch is not the one "
            + "that belongs to user: " + user.name);
    }

    await writeRepoInfo(repo);

    await commit(repo, user.name, user.email, summary, body);
    const newCommitArr: Commit[] = workspace.commits as Commit[];
    const newTip = await getCommit(repo, workspace.name);
    if (newTip && newTip.SHA === workspace.tip.SHA) {
        throw new Error(`[sync] Could not commit on ${user.name}'s branch`);
    } else if (newTip)  {
        newCommitArr.push(newTip);
    } else {
        throw new Error("[sync] Branch: " + workspace.name + " doesn't exit" +
        " or was deleted from repository: " + repo.name +
        " right after committing");
    }
    if (workspace.remoteUpstream) {
        // push the changes
        await pushBranch(repo, workspace.name);
        // pull the other branches
        await fetchAll(repo);
    }
    return new WorkSpace(workspace.name,
        workspace.remoteUpstream, newTip, newCommitArr, workspace.changeList,
        workspace.originCommit);
}
