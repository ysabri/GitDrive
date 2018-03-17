import { existsSync, writeFile } from "fs";
import init from "git/init";
import { GRepository } from "models/app/g-repository";
import { TopicSpace } from "models/app/topicspace";
import { User } from "models/app/user";
import { IChangeList, WorkSpace } from "models/app/workspace";
import { Branch } from "models/git/branch";
import { Commit } from "models/git/commit";
import { join } from "path";
import { commit, getBranches, getCommit, renameBranch, git, createBaranch, checkoutBranch } from "../git";

export const ignoreDir: string = join(__dirname, "../../../static/.gitignore");

export async function startRepo(
    path: string,
    users: ReadonlyArray<User>,
): Promise<GRepository> {

    if (!existsSync(path)) {
        throw new Error("[startRepo] The path doesn't exist: " + path);
    }
    // init the repo, with name basename(path)
    init(path);
    // tslint:disable-next-line:no-console
    console.log(ignoreDir);
    // tslint:disable-next-line:no-console
    console.log(path + "\\.gitignore");
    // copy the global default .gitignore for the first commit ever
    // await copyFileSync(ignoreDir, path + "\\.gitignore");

    // write the inital global .CURRENT_USER file
    await writeUserFile("GLOBAL USER", path);
    // temp obj to do operations on
    let GRepo = new GRepository(path, [], users);
    // create the first commit
    const res = await commit(GRepo,
        `First revision for: ${GRepo.name}`,
        `This revision adds the initial default .gitignore file along with any files in: ${GRepo.path}`);

    let firstCommit: Commit | null;
    if (res) {
        firstCommit = await getCommit(GRepo, "master");
    } else {
        throw new Error("[startRepo] commit failed as it returned false");
    }

    let workspaces: ReadonlyArray<WorkSpace>;
    if (!firstCommit) {
        couldntFindCommit("first commit");
    } else {
        workspaces = await createWorkSpaces(GRepo, users, firstCommit);
        const mainTopicSpace = new TopicSpace("Main", users, workspaces);
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
    const workspaces: WorkSpace[] = [];
    const emptyChangeList: IChangeList = {};
    let master: ReadonlyArray<Branch>;
    let tempWS: WorkSpace;
    let secondCommit: Commit | null;
    let commitRes: boolean;
    // tslint:disable-next-line:forin
    for (let i in users) {
        await writeUserFile(users[i].name + " " + users[i].email, repo.path);

        commitRes = await commit(repo,
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

            tempWS = new WorkSpace(secondCommit.SHA, users[i], [secondCommit], emptyChangeList);
            workspaces.push(tempWS);

            await renameBranch(repo, master[0], tempWS.name);
            if (i !== String(users.length - 1)) {

                await createBaranch(repo, "master", secondCommit.SHA);
                // I know, but the branch obj shouldn't have changed as it has no
                // knowledge about being checked-out and it is on the same commit
                await checkoutBranch(repo, master[0]);

                const resetHardArgs = ["reset", "--hard", firstCommit.SHA];
                await git(resetHardArgs, repo.path);
            }
        }
    }

    return workspaces;
}

async function writeUserFile(userName: string, repoPath: string) {
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
