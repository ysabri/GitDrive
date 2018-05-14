import { pathExists } from "fs-extra";
import {
    GRepository,
    IChangeList,
    WorkSpace,
} from "../../model/app";
import {
    Branch,
    Commit,
    Repository,
} from "../../model/git";
import {
    getWSfromTS,
    readRepoInfo,
} from "../../util";
import { changeWS } from "../controller/state-updater";
import {
    checkoutBranch,
    getBlobBinaryContents,
    getBranches,
    getCommit,
    isGitRepository,
} from "../git";
/**
 * Given the root path load the repo and return its latest state after
 * verifying it is structurally sound.
 * @param path The path of the repo to load
 */
export async function loadGRepo(
    path: string,
): Promise<GRepository> {
    // check if path exists, as one should
    if (! await pathExists(path)) {
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
    const allRefs = await getBranches(repo, "refs/heads");
    let emptyChangeList: IChangeList = {};
    // the first dimension is the topic space, the second is the workspace
    const topicSpaces: Commit[][] = [];
    // To make sure we are adding workspaces to the right topicspace
    let topicSpaceCounter: number = 0;
    // Used to check if a branch matches our branch naming schema
    const branchNamePattern = new RegExp(`^G[0-9a-f]{10}$`);
    const metaBranchPattern = new RegExp(`^GG$`);
    // filter out the meta data branch "GG"
    let refs = allRefs.filter((value) => {
        return !metaBranchPattern.test(value.name);
    });
    while (refs.length > 0) {
        // this is based on the fact that git does not allow
        // duplicated branch names, meaning only one branch will get filtered
        let resetOfRefs = refs.filter((value) => {
            return value.name !== refs[0].name;
        });

        const refRes = branchNamePattern.test(refs[0].name);
        if (!refRes) {
            throw new Error(`[loadRepo] ref: ${refs[0].toPrint()}, has an incorrect name`);
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
                throw new Error(`[loadRepo] ref: ${inRef.toPrint()}, has an incorrect name`);
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
    // checkout and read the repo structure
    await checkoutBranch(repo, "GG");
    const repoInfo = await readRepoInfo(repo);
    // This will throw if anything is not valid
    await checkTheState(repoInfo, topicSpaces);
    // refs would be empty otherwise given that we filtered it above, we need
    // all the refs - the "GG" ref.
    refs = allRefs.filter((value) => {
        return !metaBranchPattern.test(value.name);
    });
    // update all the branch tips and return that latest state back
    return await getTheLatestState(repoInfo, refs);
}
/**
 * Verify that the structure parsed out from the repo in the 2D array
 * matches the structure we read from the protofile in branch "GG"
 * @param repo The repo to check against
 * @param commits The suspected 2D array of commits.
 */
async function checkTheState(
    repo: GRepository,
    commits: Commit[][],
): Promise<void> {
    if (commits.length !== repo.topicSpaces.length) {
        throw new Error("[checkTheState] The number of topicspace found doesn't match with" +
            "what the meta data says");
    }

    const match: boolean[] = [];
    for (const TS of repo.topicSpaces) {
        for ( const suspectedWS of commits) {
            // This means we can compare them but they might not match since
            // different WSs could have the same length.
            if (suspectedWS.length === TS.users.length) {
                // This is checking that for every value in the suspected WS
                // commits array one element matches in terms of the author,
                // this works given the uniqueness of the users and that the
                // lengths match.
                const usersMatch = suspectedWS.every((value) => {
                    return TS.users.some((user) => {
                        return value.committer.name === user.name;
                    });
                });
                // check if the users are unique in the suspected WS commits
                // arr. We don't check ours cause we won't write the
                // proto repo file otherwise.
                const uniqueUsers = suspectedWS.every((value, i, arr) => {
                    return arr.filter((val) => {
                        return value.committer.name === val.committer.name;
                    }).length === 1;
                });
                // both conditions match
                if (usersMatch && uniqueUsers) {
                    match.push(true);
                }

            }
        }
    }
    // If this is not exact it means that either one or more did not match
    // or at least one matched multiple WSs meaning there are duplicates
    if (match.length !== repo.topicSpaces.length) {
        throw new Error("[checkTheState] The workspaces read from the repo don't match the" +
            " info we read from the meta data");
    }
}
/**
 * Update all the workspaces (branches) tips and thus the number of commits on
 * them. By the time this gets called, we should know that branches are unique
 * and that they match the workspaces in a one-to-one matching. Ie. we have
 * called checkTheState beforehand.
 * @param repo that it's state will get updated, refs have to belong to it
 * @param refs the generic refs parsed by git, they have the latest state
 */
async function getTheLatestState(
    repo: GRepository,
    refs: Branch[],
): Promise<GRepository> {
    let newRepo = repo;
    for (const TS of repo.topicSpaces) {
        for (const WS of TS.workSpaces) {
            const foundRef = refs.find((value) => {
                return value.name === WS.name;
            });
            // the tips don't match, meaning that what we read from "GG" is behind
            if (foundRef && (foundRef.tip.SHA !== WS.tip.SHA)) {
                // we are reading the state from the workspace's point of view
                // as we might be behind more than one commit, we trust the
                // branch's perspective to have all the commits in it.
                const buffer = await getBlobBinaryContents(repo, foundRef.tip.SHA, "repo.proto");
                const protoStateBasedonRefTip = GRepository.deserialize(new Uint8Array(buffer));
                // get the workspace from the proto state repo
                const protoWS = await getWSfromTS(protoStateBasedonRefTip, TS.name, foundRef.name);
                if (protoWS.tip === foundRef.tip) {
                    throw new Error("[getTheLatestState] For some reason the proto state is not behind" +
                    " the branch's state, this should not be happening...");
                }
                // They have the same name, we matched them based on that
                const newWS = new WorkSpace(protoWS.name, foundRef.remoteUpstream, foundRef.tip,
                    [foundRef.tip, ...protoWS.commits], protoWS.changeList, protoWS.originCommit);
                newRepo = await changeWS(newRepo, TS, newWS);
            }
        }
    }
    return newRepo;
}
