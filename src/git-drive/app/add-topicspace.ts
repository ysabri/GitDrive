import { GRepository } from "../../model/app/g-repository";
import { TopicSpace } from "../../model/app/topicspace";
import { User } from "../../model/app/user";
import { Commit } from "../../model/git/commit";
import { createWorkSpaces, writeUserFile } from "../../util/repo-creation";
import { commit, getCommit, orphanCheckout } from "../git";

export async function createTopicSpace(
    repo: GRepository,
    users: ReadonlyArray<User>,
    origin: Commit,
    name: string,
): Promise<TopicSpace> {
    orphanCheckout(repo, "temp");

    writeUserFile("GLOBAL USER", repo.path);

    const res = await commit(repo,
        "GLOBAL USER",
        "testEmail@gmail.com",
        `First revision for TopicSpace: ${name}`,
        "",
    );
    let firstCommit: Commit | null;

    if (!res) {
        throw new Error(`[createTopicSpace] failed to create the first commit` +
        `on TopicSpace: ${name}`);
    } else {
        firstCommit = await getCommit(repo, "temp");
    }

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
