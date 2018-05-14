import {
    GRepository,
    TopicSpace,
    User,
    WorkSpace,
} from "../../model/app";

/**
 * These functions do not do almost any form of checking on the correctness of
 * the operations they perform, this is left to the caller. These functions are
 * left uncluttered and thus more efficient.
 */

/** recreate a new repo object with the new changed workspace */
export async function changeWS(
    repo: GRepository,
    topicSpace: TopicSpace,
    newWorkspace: WorkSpace,
): Promise<GRepository> {
    const newWSArr = topicSpace.workSpaces.map((value) => {
        if (value.name === newWorkspace.name) {
            return newWorkspace;
        } else {
            return value;
        }
    });
    return await changeTS(repo, new TopicSpace(topicSpace.name, topicSpace.users,
        newWSArr, topicSpace.firstCommit, topicSpace.originCommit));
}
/** Create a new repo object with the added workspace */
export async function addWS(
    repo: GRepository,
    topicSpace: TopicSpace,
    newWorkspace: WorkSpace,
    newUser: User,
): Promise<GRepository> {
    const newWSs = topicSpace.workSpaces as WorkSpace[];
    newWSs.push(newWorkspace);
    const newUsers = topicSpace.users as User[];
    newUsers.push(newUser);

    // check if the user exist in the repo so we don't add them
    const exists = repo.users.find((value) => {
        return value.name === newUser.name;
    });
    if (exists) {
        return await changeTS(repo, new TopicSpace(topicSpace.name, newUsers,
            newWSs, topicSpace.firstCommit, topicSpace.originCommit));
    }

    const addUserToRepo = await addUser(repo, newUser);
    return await changeTS(addUserToRepo, new TopicSpace(topicSpace.name, newUsers,
        newWSs, topicSpace.firstCommit, topicSpace.originCommit));
}
/** Create a new repo object without the victim workspace */
export async function removeWS(
    repo: GRepository,
    topicSpace: TopicSpace,
    victimWS: WorkSpace,
): Promise<GRepository> {
    const newWSArr = topicSpace.workSpaces.filter((value) => {
        return value.name !== victimWS.name;
    });
    const newUserArr = topicSpace.users.filter((value) => {
        return value.name !== victimWS.tip.committer.name;
    });
    // check if the user exists in any other topicspaces cause if not we should
    // remove them from being a repo user
    const userExists = await checkUserInOtherTSs(repo, topicSpace, victimWS.tip.committer.name);
    if (!userExists) {
        const removedUserRepo = await removeUser(repo, victimWS.tip.committer.name);
        return await changeTS(removedUserRepo, new TopicSpace(topicSpace.name, newUserArr,
            newWSArr, topicSpace.firstCommit, topicSpace.originCommit));
    }
    return await changeTS(repo, new TopicSpace(topicSpace.name, newUserArr,
        newWSArr, topicSpace.firstCommit, topicSpace.originCommit));
}

async function checkUserInOtherTSs(
    repo: GRepository,
    ts: TopicSpace,
    user: string,
): Promise<boolean> {
    for (const TS of repo.topicSpaces) {
        if (TS.name !== ts.name) {
            const findRes = TS.users.find((usr) => {
                return usr.name === user;
            });
            if (findRes) {
                return true;
            }
        }
    }
    return false;
}
/** Create a new repo object with the change topicspace */
export async function changeTS(
    repo: GRepository,
    newTopicSpace: TopicSpace,
): Promise<GRepository> {
    const newArr = repo.topicSpaces.map((value) => {
        if (value.name === newTopicSpace.name) {
            return newTopicSpace;
        } else {
            return value;
        }
    });
    return new GRepository(repo.path, newArr, repo.users, repo.metaBranch);
}
/** Create a new repo with the new topicspace added */
export async function addTS(
    repo: GRepository,
    newTopicSpace: TopicSpace,
): Promise<GRepository> {
    const newTSArr = repo.topicSpaces as TopicSpace[];
    newTSArr.push(newTopicSpace);
    const newUserArr = repo.users as User[];
    for (const user of newTopicSpace.users) {
        if (!newUserArr.includes(user)) {
            newUserArr.push(user);
        }
    }
    return new GRepository(repo.path, newTSArr, newUserArr, repo.metaBranch);
}
/** create a new repo object without the victim topicspace  */
export async function removeTS(
    repo: GRepository,
    victimTS: TopicSpace,
): Promise<GRepository> {
    const newArr = repo.topicSpaces.filter((value) => {
        return value.name !== victimTS.name;
    });
    // check if the victimTS's users exits in other topicspaces, cause if they
    // don't we have to remove them from being repo users
    let tempRepo: GRepository = repo;
    for (const tsUser of victimTS.users) {
        const exists = await checkUserInOtherTSs(tempRepo, victimTS, tsUser.name);
        if (!exists) {
            tempRepo = await removeUser(tempRepo, tsUser.name);
        }
    }
    return new GRepository(repo.path, newArr, tempRepo.users, repo.metaBranch);
}
/** Create a new repo object with the new user added */
async function addUser(
    repo: GRepository,
    newUser: User,
): Promise<GRepository> {
    const newUserArr = repo.users as User[];
    newUserArr.push(newUser);
    return new GRepository(repo.path, repo.topicSpaces, newUserArr, repo.metaBranch);
}
/** Create a new repo object without the victim user */
async function removeUser(
    repo: GRepository,
    victimUser: string,
): Promise<GRepository> {
    const newUserArr = repo.users.filter((value) => {
        return value.name !== victimUser;
    });
    return new GRepository(repo.path, repo.topicSpaces, newUserArr, repo.metaBranch);
}
