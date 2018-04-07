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
    if (!existsSync(path)) {
        throw new Error(`[loadGRepo] path: ${path} does not exist`);
    }

    const isRepo = await isGitRepository(path);
    if (!isRepo) {
        throw new Error(`[loadGRepo] path: ${path} is not a repo`);
    }
    const repo = new Repository(path);
    let refs = await getBranches(repo, "refs/heads");
    let emptyChangeList: IChangeList = {};
    const topicSpaces: Commit[][] = [];
    let topicSpaceCounter: number = 0;
    while (refs.length > 0) {
        // this is based on the fact that git does not allow
        // duplicated branch names, meaning only one branch will get filtered
        let resetOfRefs = refs.filter((value) => {
            return value.name !== refs[0].name;
        });
        const branchNamePattern = new RegExp(`^G[0-9a-f]{10}$`);
        const refRes = branchNamePattern.test(refs[0].name);
        if (!refRes) {
            throw new Error(`[loadRepo] ref: ${refs[0]} has an incorrect name`);
        }
        emptyChangeList = {};
        const refWS = new WorkSpace(refs[0], [refs[0].tip], emptyChangeList,
                undefined);
        const refCommit = await getCommit(repo, refWS.firstCommit);
        if (!refCommit) {
            throw new Error("[loadRepo] couldn't find the first commit under" +
                `branch: ${refs[0].name}`);
        }
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
            if (refCommit.parentSHA === inRefCommit.parentSHA) {
                topicSpaces[topicSpaceCounter].push(inRefCommit);
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
