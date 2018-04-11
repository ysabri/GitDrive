import { addTS } from "../../controller/state-updater";
import { GRepository } from "../../model/app/g-repository";
import { TopicSpace } from "../../model/app/topicspace";
import { User } from "../../model/app/user";
import { Commit } from "../../model/git/commit";
import { writeRepoInfo } from "../../util/metafile";
import { createWorkSpaces } from "../../util/repo-creation";
import { writeUserFile } from "../../util/repo-creation";
import { checkoutBranch, commit, getCommit, orphanCheckout } from "../git";
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
): Promise<[GRepository, TopicSpace]> {
    // check that the new TS name doesn't exist already in the repo
    if (repo.topicSpaces.some((value) => {
        return value.name === name;
    })) {
        throw Error(`The name: ${name} exists already in repo: ${repo.name}`);
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

    return [newRepo, newTS];
}
