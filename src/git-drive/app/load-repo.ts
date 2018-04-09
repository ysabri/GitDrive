import { existsSync } from "fs";
import { GRepository } from "../../model/app/g-repository";
import { IChangeList, WorkSpace } from "../../model/app/workspace";
import { Branch } from "../../model/git/branch";
import { Commit } from "../../model/git/commit";
import { Repository } from "../../model/git/repository";
import { readRepoInfo } from "../../util/metafile";
import { getBranches, getCommit, isGitRepository } from "../git";

export async function loadGRepo(
    path: string,
): Promise<GRepository> {
    // check if path exists, as one should
    if (!existsSync(path)) {
        throw new Error(`[loadGRepo] path: ${path} does not exist`);
    }
    // check if the path is a git repo, again as one should
    const isRepo = await isGitRepository(path);
    if (!isRepo) {
        throw new Error(`[loadGRepo] path: ${path} is not a repo`);
    }
    // dummy repo to do commands on since all we need is a path
    const repo = new Repository(path);
    // get all the local branches
    // TODO: figure out how to read remote ones that don't have a local
    // counterpart. This shouldn't be the case so I might just not worry.
    let refs = await getBranches(repo, "refs/heads");
    let emptyChangeList: IChangeList = {};
    // the first dimension is the topic space, the second is the workspace
    const topicSpaces: Commit[][] = [];
    // To make sure we are adding workspaces to the right topicspace
    let topicSpaceCounter: number = 0;
    // Used to check if a branch matches our branch naming schema
    const branchNamePattern = new RegExp(`^G[0-9a-f]{10}$`);
    while (refs.length > 0) {
        // this is based on the fact that git does not allow
        // duplicated branch names, meaning only one branch will get filtered
        let resetOfRefs = refs.filter((value) => {
            return value.name !== refs[0].name;
        });

        const refRes = branchNamePattern.test(refs[0].name);
        if (!refRes) {
            throw new Error(`[loadRepo] ref: ${refs[0]} has an incorrect name`);
        }

        emptyChangeList = {};
        const refWS = new WorkSpace(refs[0], [refs[0].tip], emptyChangeList,
                undefined);
        // get the first commit on the workspace
        const refCommit = await getCommit(repo, refWS.firstCommit);
        if (!refCommit) {
            throw new Error("[loadRepo] couldn't find the first commit under" +
                `branch: ${refs[0].name}`);
        }
        // init the topicspace and add the first workspace commit, each
        // topicspace must have at least one workspace.
        topicSpaces[topicSpaceCounter] = [];
        topicSpaces[topicSpaceCounter].push(refCommit);
        // so here to match branches to their workspaces, we look at the parent
        // of their first commits and see if they have the same one.
        for (const inRef of resetOfRefs) {
            const inRefRes = branchNamePattern.test(inRef.name);
            if (!inRefRes) {
                throw new Error(`[loadRepo] ref: ${inRef} has an incorrect name`);
            }

            emptyChangeList = {};
            const inRefWS = new WorkSpace(inRef, [inRef.tip], emptyChangeList,
                    undefined);

            const inRefCommit = await getCommit(repo, inRefWS.firstCommit);
            if (!inRefCommit) {
                throw new Error("[loadRepo] couldn't find the first commit under" +
                `branch: ${inRef.name}`);
            }
            // if the parent of this workspace's first matches the first commit
            // we decided to create the topicspace based on.
            if (refCommit.parentSHA === inRefCommit.parentSHA) {
                topicSpaces[topicSpaceCounter].push(inRefCommit);
                // assign to refs to keep track of what gets eliminated in the
                // inner loop for the outer one
                refs = resetOfRefs.filter((value) => {
                    return value.name !== inRef.name;
                });
                // this is for the next run of the loop when another
                // branch is found, we need to keep track of what gets
                // eliminated in the inner loop as well.
                resetOfRefs = refs as Branch[];
            }
        }
        topicSpaceCounter++;
    }

    const repoInfo = await readRepoInfo(repo);
    console.log("this is the info read about the repo");
    console.log(repoInfo.id());

    return new GRepository(repo.path, [], []);
}
