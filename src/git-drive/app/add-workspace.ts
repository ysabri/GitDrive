import { GRepository } from "../../model/app/g-repository";
import { TopicSpace } from "../../model/app/topicspace";
import { User } from "../../model/app/user";
import { IChangeList, WorkSpace } from "../../model/app/workspace";
import { Branch } from "../../model/git/branch";
import { writeUserFile } from "../../util/repo-creation";
import {
    checkoutAndCreateBranch,
    commit,
    getCommit,
    renameBranch,
    reset,
    ResetMode,
} from "../git";

/**
 * Create a workspace for our new user
 * TODO: add the option to start either from the global state or a clean slate
 * @param repo where to create the workspace
 * @param user the new user of the workspace
 * @param topicSpace the topicspace to create the workspace in
 * @param basedOn The workspace this new workspace is based on
 */
export async function createWorkSpace(
    repo: GRepository,
    user: User,
    topicSpace: TopicSpace,
    basedOn: WorkSpace,
): Promise<WorkSpace> {
    // check if the user has a topicspace already, each user has only one
    // workspace per topicspace
    const exists = topicSpace.users.filter((usr) => {
        return usr.name === user.name;
    });
    if (exists.length > 0) {
        throw new Error(`[createWorkSpace] User: ${user.name} exists already` +
            ` in topicSpace: ${topicSpace.name}`);
    }
    // checkout a temp branch that will get renamed one the workspace is made
    await checkoutAndCreateBranch(repo, "temp", basedOn.tip.SHA);
    // mixed reset to the global first commit in the topicspace,
    // this means that the state we reset-ed from is un-staged now
    await reset(repo, topicSpace.firstCommit.SHA, ResetMode.Mixed);
    // re-write the user file to match the user of the workspace
    await writeUserFile(user.name + " " + user.email, repo.path);
    // commit, it will stage everything in the process
    await commit(repo, user.name, user.email,
        `First revision for ${user.name}'s workspace: `,
        ``);
    // check if the commit was made
    const firstCommit = await getCommit(repo, "temp");
    if (firstCommit) {
        const emptyChangeList: IChangeList = {};
        const tempWS = new WorkSpace(firstCommit.SHA, null, firstCommit,
            [firstCommit], emptyChangeList, basedOn.tip.SHA);
        await renameBranch(repo, new Branch("temp", null, firstCommit) , tempWS.name);
        user.workSpaces[tempWS.name] = tempWS;
        return tempWS;
    } else {
        throw new Error(`[createWorkSpace] First commit for user ${user.name}`
        + "cannot be found");
    }
}
