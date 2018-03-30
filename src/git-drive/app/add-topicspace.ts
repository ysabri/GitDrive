import { GRepository } from "../../model/app/g-repository";
import { TopicSpace } from "../../model/app/topicspace";
import { User } from "../../model/app/user";
import { Commit } from "../../model/git/commit";
import { createWorkSpaces, writeUserFile } from "../../util/repo-creation";
import { commit, getCommit, orphanCheckout } from "../git";

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
): Promise<TopicSpace> {
    // create the branch
    await orphanCheckout(repo, "temp", origin.SHA);
    // write the user file
    await writeUserFile("GLOBAL USER", repo.path);
    // make the first commit
    const res = await commit(repo,
        "GLOBAL USER",
        "testEmail@gmail.com",
        `First revision in the TopicSpace:${name}`,
        "",
    );
    let firstCommit: Commit | null;
    // check if the first commit was made by getting it
    if (!res) {
        throw new Error(`[createTopicSpace] failed to create the first commit` +
        `on TopicSpace: ${name}`);
    } else {
        firstCommit = await getCommit(repo, "temp");
    }
    // create workspaces on top of the first commit
    if (!firstCommit) {
        throw new Error("[createTopicSpace] getCommit couldn't find the first "
            + "commit under HEAD");
    } else {
        const workspaces = await createWorkSpaces(repo, users, firstCommit, "temp");
        const newTS = new TopicSpace(name,
            users, workspaces, firstCommit, origin);
        return newTS;
    }
}
