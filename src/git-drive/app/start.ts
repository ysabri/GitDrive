import {
    copy,
    pathExists,
} from "fs-extra";
import { join } from "path";
import {
    GRepository,
    TopicSpace,
    User,
} from "../../model/app";
import {
    Commit,
    Repository,
} from "../../model/git";
import {
    createWorkSpaces,
    writeRepoInfo,
    writeUserFile,
} from "../../util";
import {
    commit,
    getCommit,
    isGitRepository,
    orphanCheckout,
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
    // check if the path exists
    if (!(await pathExists(path))) {
        throw new Error("[startRepo] The path doesn't exist: " + path);
    }
    // check if the path is a repo root
    if ((await isGitRepository(path))) {
        throw new Error(`[startRepo] ${path} already has a git repo`);
    }
    const dupUsers = users.every((usr, i, arr) => {
        return arr.filter((val) => {
            return usr.name === val.name;
        }).length === 1;
    });
    if (!dupUsers) {
        throw new Error("[startRepo] Users must have unique names" +
         ". The array passed has duplicate users");
    }
    // init the repo, with name basename(path)
    await init(path);

    // copy the global default .gitignore for the first commit ever
    await copy(ignoreDir, join(path, ".gitignore"));

    // write the inital global .CURRENT_USER file
    await writeUserFile("GLOBAL USER", path);

    // temp obj to do operations on
    const repo = new Repository(path);

    // create the first commit
    const res = await commit(repo,
        "GLOBAL USER",
        "testEmail@gmail.com",
        `First revision for:Main:in repo:${repo.name}`,
        `This revision adds the initial default .gitignore file along with any files in: ${repo.path}`);

    // check if commit was a success and get it's info
    let firstCommit: Commit | null;
    if (!res) {
        throw new Error("[startRepo] commit failed as it returned false");
    }

    firstCommit = await getCommit(repo, "master");
    if (!firstCommit) {
        throw new Error(`[startRepo] getCommit couldn't find the first` +
        " commit under HEAD");
    }

    const workspaces = await createWorkSpaces(repo, users, firstCommit, "master");
    const mainTopicSpace = new TopicSpace("Main",
        users, workspaces, firstCommit, undefined);
    const usersCopy = users.map((value) => {
        return value;
    });
    // The tip should already be checked-out
    await orphanCheckout(repo, "GH", workspaces[workspaces.length - 1].tip.SHA);
    const gRepo = new GRepository(path, [mainTopicSpace], usersCopy, "GH");
    await writeRepoInfo(gRepo);
    await commit(gRepo, "Meta-User", "NA", "Meta Commit", "");

    return gRepo;
}
