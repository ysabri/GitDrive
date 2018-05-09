import { addWS } from "../../controller/state-updater";
import {
    GRepository,
    IChangeList,
    TopicSpace,
    User,
    WorkSpace,
} from "../../model/app";
import { Branch } from "../../model/git";
import {
    writeRepoInfo,
    writeUserFile,
} from "../../util";
import {
    checkoutAndCreateBranch,
    checkoutBranch,
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
): Promise<[GRepository, WorkSpace]> {
    // check if the user in the topicspace already, each user has only one
    // workspace per topicspace
    const exists = topicSpace.users.filter((usr) => {
        return usr.name === user.name;
    });
    if (exists.length > 0) {
        throw new Error(`[createWorkSpace] User: ${user.name} exists already` +
            ` in topicSpace: ${topicSpace.name}`);
    }
    // checkout a temp branch that will get renamed once the workspace is made
    await checkoutAndCreateBranch(repo, "temp", basedOn.tip.SHA);
    // mixed reset to the global first commit in the topicspace,
    // this means that the state we reset-ed from is un-staged now
    await reset(repo, topicSpace.firstCommit.SHA, ResetMode.Mixed);

    await writeRepoInfo(repo);
    // re-write the user file to match the user of the workspace
    await writeUserFile(user.name + " " + user.email, repo.path);
    // commit, it will stage everything in the process
    await commit(repo, user.name, user.email,
        `First revision for ${user.name}'s workspace: `,
        ``);
    // check if the commit was made
    const firstCommit = await getCommit(repo, "temp");
    if (!firstCommit) {
        throw new Error(`[createWorkSpace] First commit for user ${user.name}`
        + "cannot be found");
    }

    const emptyChangeList: IChangeList = {};
    const tempWS = new WorkSpace(firstCommit.SHA, null, firstCommit,
        [firstCommit], emptyChangeList, basedOn.tip.SHA);
    await renameBranch(repo, new Branch("temp", null, firstCommit) , tempWS.name);
    user.addWorkspace(tempWS);

    const newRepo = await addWS(repo, topicSpace, tempWS, user);

    await checkoutBranch(repo, repo.metaBranch);
    await writeRepoInfo(newRepo);
    await commit(newRepo, "Meta-User", "NA", "Meta Commit", "");

    return [newRepo, tempWS];
}
