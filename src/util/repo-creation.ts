import { writeFile } from "fs";
import { join } from "path";
import {
    checkoutBranch,
    commit,
    createBranch,
    getBranches,
    getCommit,
    git,
    renameBranch } from "../git-drive/git";
import { GRepository } from "../model/app/g-repository";
import { User } from "../model/app/user";
import { IChangeList, WorkSpace } from "../model/app/workspace";
import { Branch } from "../model/git/branch";
import { Commit } from "../model/git/commit";
import { writeRepoInfo } from "./metafile";

/**
 * Writes the .CURRENT_USER file given the username. The file will contain just
 * the userName variable contents.
 * @param userName The username to write, not much restrictions here
 * @param repoPath The base path to the repo so we can write the file there
 */
export async function writeUserFile(
    userName: string,
    repoPath: string,
): Promise<void> {
    await writeFile(join(repoPath, ".CURRENT_USER"), userName, (err) => {
        if (err) {
            throw err;
        }
    });
}

/**
 * create the workspace for the users given
 * @param repo The repo to create the workspace at.
 * @param users The users to create workspaces for each.
 * @param firstCommit The first commit for the workspace, ie. the commit all
 * branches are based on.
 */
export async function createWorkSpaces(
    repo: GRepository,
    users: ReadonlyArray<User>,
    firstCommit: Commit,
    tempBranchName: string,
): Promise<ReadonlyArray<WorkSpace>> {
    // array of to be returned workspaces
    const workspaces: WorkSpace[] = [];
    // an empty changelist to init workspaces
    const emptyChangeList: IChangeList = {};
    // a holder for the for-each-ref cmd
    let tempBranch: ReadonlyArray<Branch>;
    // temp holder for user workspaces that will get pushed to workspaces
    let tempWS: WorkSpace;
    // temp holder for the second commit obj
    let secondCommit: Commit | null;
    // temp holder to the commit cmd result
    let commitRes: boolean;

    for (const i in users) {
        if (users.hasOwnProperty(i)) {
            await writeUserFile(users[i].name + " " + users[i].email, repo.path);
            await writeRepoInfo(repo);

            commitRes = await commit(repo,
                users[i].name,
                users[i].email,
                `First revision for ${users[i].name}'s workspace: `,
                ``);

            if (commitRes) {
                secondCommit = await getCommit(repo , tempBranchName);
            } else {
                throw new Error("[startRepo] commit failed as it returned false");
            }

            if (!secondCommit) {
                throw new Error(`[createWorkSpaces] getCommit couldn't find` +
                ` user: ${users[i].name} commit under HEAD`);
            } else {
                // should just return tempBranch
                tempBranch = await getBranches(repo, `refs/heads/${tempBranchName}`);

                tempWS = new WorkSpace(secondCommit.SHA, tempBranch[0].remoteUpstream,
                    tempBranch[0].tip, [secondCommit], emptyChangeList);
                workspaces.push(tempWS);

                // Adding the new branch a keyVal pair into the user obj
                users[i].addWorkspace(tempWS); // workSpaces[tempWS.name] = ;

                await renameBranch(repo, tempBranch[0], tempWS.name);

                // re-create tempBranch for the next iteration, and reset it back
                // to the first commit.
                if (i !== String(users.length - 1)) {

                    await createBranch(repo, tempBranchName, secondCommit.SHA);
                    // I know, but the branch obj shouldn't have changed as it
                    // has no knowledge about being checked-out or renamed and
                    // it is on the same commit
                    await checkoutBranch(repo, tempBranch[0]);

                    const resetHardArgs = ["reset", "--hard", firstCommit.SHA];
                    await git(resetHardArgs, repo.path);
                }
            }
        }
    }

    return workspaces;
}
