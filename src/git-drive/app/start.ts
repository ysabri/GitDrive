// import { copyFile, existsSync, writeFile } from "fs";
import { existsSync, writeFile } from "fs";
import { join } from "path";
import { GRepository } from "../../model/app/g-repository";
import { TopicSpace } from "../../model/app/topicspace";
import { User } from "../../model/app/user";
import { IChangeList, WorkSpace } from "../../model/app/workspace";
import { Branch } from "../../model/git/branch";
import { Commit } from "../../model/git/commit";
import {    checkoutBranch,
            commit,
            createBaranch,
            getBranches,
            getCommit,
            git,
            isGitRepository,
            renameBranch,
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

    if (!existsSync(path)) {
        throw new Error("[startRepo] The path doesn't exist: " + path);
    }

    if ((await isGitRepository(path))) {
        throw new Error(`[startRepo] ${path} already has a git repo`);
    }

    // init the repo, with name basename(path)
    await init(path);

    // copy the global default .gitignore for the first commit ever
    // await copyFile(ignoreDir, path + "\\.gitignore", (err) => {
    //     if (err) {
    //         throw err;
    //     }
    // });

    // write the inital global .CURRENT_USER file
    await writeUserFile("GLOBAL USER", path);

    // temp obj to do operations on
    let GRepo = new GRepository(path, [], users);
    // create the first commit
    const res = await commit(GRepo,
        "GLOBAL USER",
        "testEmail@gmail.com",
        `First revision for: ${GRepo.name}`,
        `This revision adds the initial default .gitignore file along with any files in: ${GRepo.path}`);

    // check if commit was a success and get it's info
    let firstCommit: Commit | null;
    if (res) {
        firstCommit = await getCommit(GRepo, "master");
    } else {
        throw new Error("[startRepo] commit failed as it returned false");
    }
    if (!firstCommit) {
        couldntFindCommit("first commit");
    } else {
        const workspaces = await createWorkSpaces(GRepo, users, firstCommit);
        const mainTopicSpace = new TopicSpace("Main",
            users, workspaces, firstCommit, undefined);
        GRepo = new GRepository(path, [mainTopicSpace], users);
        return GRepo;
    }

    // This is what an invalid repo would look like, a repo with no TopicScapes
    // since it has no users.
    // Useful if we want to define a bare repo.
    // tslint:disable-next-line:no-console
    console.log("We are returning a broken repo");
    return GRepo;
}


async function createWorkSpaces(
    repo: GRepository,
    users: ReadonlyArray<User>,
    firstCommit: Commit,
): Promise<ReadonlyArray<WorkSpace>> {
    // array of to be returned workspaces
    const workspaces: WorkSpace[] = [];
    // an empty changelist to init workspaces
    const emptyChangeList: IChangeList = {};
    // a holder for the for-each-ref cmd
    let master: ReadonlyArray<Branch>;
    // temp holder for user workspaces that will get pushed to workspaces
    let tempWS: WorkSpace;
    // temp holder for the second commit obj
    let secondCommit: Commit | null;
    // temp holder to the commit cmd result
    let commitRes: boolean;

    // tslint:disable-next-line:prefer-const
    for (let i in users) {
        if (users.hasOwnProperty(i)) {
            await writeUserFile(users[i].name + " " + users[i].email, repo.path);

            commitRes = await commit(repo,
                users[i].name,
                users[i].email,
                `First revision for ${users[i].name}'s workspace: `,
                ``);

            if (commitRes) {
                secondCommit = await getCommit(repo , "master");
            } else {
                throw new Error("[startRepo] commit failed as it returned false");
            }

            if (!secondCommit) {
                couldntFindCommit(`user: ${users[i].name} commit`);
            } else {
                // should just return master
                master = await getBranches(repo, "refs/heads/master");

                tempWS = new WorkSpace(secondCommit.SHA, [secondCommit], emptyChangeList);
                workspaces.push(tempWS);

                // Adding the new branch a keyVal pair into the user obj
                users[i].workSpaces[tempWS.name] = new Branch(tempWS.name,
                                                    master[0].remoteUpstream,
                                                     master[0].tip);

                await renameBranch(repo, master[0], tempWS.name);

                // re-create master for the next iteration, and reset it back
                // to the first commit.
                if (i !== String(users.length - 1)) {

                    await createBaranch(repo, "master", secondCommit.SHA);
                    // I know, but the branch obj shouldn't have changed as it
                    // has no knowledge about being checked-out or renamed and
                    // it is on the same commit
                    await checkoutBranch(repo, master[0]);

                    const resetHardArgs = ["reset", "--hard", firstCommit.SHA];
                    await git(resetHardArgs, repo.path);
                }
            }
        }
    }

    return workspaces;
}

async function writeUserFile(
    userName: string,
    repoPath: string,
): Promise<void> {
    await writeFile(join(repoPath, ".CURRENT_USER"), userName, (err) => {
        if (err) {
            throw err;
        }
    });
}

function couldntFindCommit(name: string): never {
    throw new Error(`[startRepo] getCommit couldn't find the ${name}` +
            " under HEAD");
}
