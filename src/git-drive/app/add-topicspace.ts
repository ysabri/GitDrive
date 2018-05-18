import {
    GRepository,
    TopicSpace,
    User,
} from "../../model/app";
import { Commit } from "../../model/git";
import {
    createWorkSpaces,
    writeRepoInfo,
    writeUserFile,
} from "../../util";
import { addTS } from "../controller/state-updater";
import {
    checkoutBranch,
    commit,
    getCommit,
    orphanCheckout,
} from "../git";
/**
 * Create a new topicspace in a repo. And adds new users to the repo if they do
 * not exist already.
 * @param repo The repo to create topicspace in
 * @param users The users to add to the topicspace, they can be new users
 * @param origin The commit the new topicspace state will be based on
 * @param name The name of the new topicspace.
 */
export async function createTopicSpace(
    repo: GRepository,
    users: ReadonlyArray<User>,
    origin: Commit,
    name: string,
): Promise<{repo: GRepository, topicspace: TopicSpace}> {
    // check that the new TS name doesn't exist already in the repo
    if (repo.topicSpaces.some((value) => {
        return value.name === name;
    })) {
        throw Error(`[createTopicSpace] The topicspace name: ${name}`
        + ` exists already in repo: ${repo.name}`);
    }
    // check for duplicate users
    const dupUsers = users.every((usr, i, arr) => {
        return arr.filter((val) => {
            return usr.name === val.name;
        }).length === 1;
    });
    if (!dupUsers) {
        throw new Error("[createTopicSpace] Users must have unique names" +
         ". The array passed has duplicate users");
    }
    // create the branch
    await orphanCheckout(repo, "temp", origin.SHA);

    await writeRepoInfo(repo);
    // write the user file
    await writeUserFile("GLOBAL USER", repo.path);
    // make the first commit
    const res = await commit(repo,
        "GLOBAL USER",
        "testEmail@gmail.com",
        `First revision in the TopicSpace:${name}`,
        "",
    );
    if (!res) {
        throw new Error(`[createTopicSpace] failed to create the first commit` +
        `on TopicSpace: ${name}`);
    }

    // check if the first commit was made by getting it
    const firstCommit = await getCommit(repo, "temp");
    if (!firstCommit) {
        throw new Error("[createTopicSpace] getCommit couldn't find the first "
        + "commit under HEAD");
    }

    // create workspaces on top of the first commit
    const workspaces = await createWorkSpaces(repo, users, firstCommit, "temp");
    const newTS = new TopicSpace(name,
        users, workspaces, firstCommit, origin);

    const newRepo = await addTS(repo, newTS);

    await checkoutBranch(newRepo, newRepo.metaBranch);
    await writeRepoInfo(newRepo);
    await commit(newRepo, "Meta-User", "NA", "Meta Commit", "");

    return {repo: newRepo, topicspace: newTS};
}
