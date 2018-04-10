// import { existsSync } from "fs";
import { copy, pathExists } from "fs-extra";
import { join } from "path";
import { GRepository } from "../../model/app/g-repository";
import { TopicSpace } from "../../model/app/topicspace";
import { User } from "../../model/app/user";
import {  } from "../../model/app/workspace";
import { Commit } from "../../model/git/commit";
// import { writeRepoInfo } from "../../util/metafile";
import { commitRepoInfo, createWorkSpaces, writeUserFile } from "../../util/repo-creation";
// import { createWorkSpaces, writeUserFile } from "../../util/repo-creation";

import {    commit,
            getCommit,
            isGitRepository,
        } from "../git";
import init from "../git/init";

// path to the global .gitignore file
export const ignoreDir: string = join(__dirname, "../../../static/.gitignore");
/**
 * Create a repo with the given users. This will add any files/folders in path
 * to the repo. The name of the repo is the basename(path).
 * @param path where to create the repo
 * @param users the authors at the beginning of the repo
 */
export async function startRepo(
    path: string,
    users: ReadonlyArray<User>,
): Promise<GRepository> {

    if (!(await pathExists(path))) {
        throw new Error("[startRepo] The path doesn't exist: " + path);
    }

    if ((await isGitRepository(path))) {
        throw new Error(`[startRepo] ${path} already has a git repo`);
    }

    // init the repo, with name basename(path)
    await init(path);

    // copy the global default .gitignore for the first commit ever
    await copy(ignoreDir, join(path, ".gitignore"));

    // write the inital global .CURRENT_USER file
    await writeUserFile("GLOBAL USER", path);

    // temp obj to do operations on
    const GRepo = new GRepository(path, [], users);

    // await writeRepoInfo(GRepo);

    // create the first commit
    const res = await commit(GRepo,
        "GLOBAL USER",
        "testEmail@gmail.com",
        `First revision for:Main:in repo:${GRepo.name}`,
        `This revision adds the initial default .gitignore file along with any files in: ${GRepo.path}`);

    // check if commit was a success and get it's info
    let firstCommit: Commit | null;
    if (res) {
        firstCommit = await getCommit(GRepo, "master");
    } else {
        throw new Error("[startRepo] commit failed as it returned false");
    }
    if (!firstCommit) {
        throw new Error(`[startRepo] getCommit couldn't find the first` +
        " commit under HEAD");
    } else {
        const workspaces = await createWorkSpaces(GRepo, users, firstCommit, "master");
        const mainTopicSpace = new TopicSpace("Main",
            users, workspaces, firstCommit, undefined);
        const usersCopy = users.map((value) => {
            return value;
        });
        const newRepo = new GRepository(path, [mainTopicSpace], usersCopy);
        // return new GRepository(path, [mainTopicSpace], usersCopy);
        // commit the protbuf info into each workspace for the first topicspace
        return await commitRepoInfo(newRepo, 0);
    }
}
