import { GRepository } from "../model/app/g-repository";
import { TopicSpace } from "../model/app/topicspace";
import { User } from "../model/app/user";
import { WorkSpace } from "../model/app/workspace";

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

    // const AddUserToRepo = await addUser(repo, newUser);

    return await changeTS(repo, new TopicSpace(topicSpace.name, newUsers,
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
    return await changeTS(repo, new TopicSpace(topicSpace.name, topicSpace.users,
        newWSArr, topicSpace.firstCommit, topicSpace.originCommit));
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
    return new GRepository(repo.path, newArr, repo.users);
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
    return new GRepository(repo.path, newTSArr, newUserArr);
}
/** create a new repo object without the victim topicspace  */
export async function removeTS(
    repo: GRepository,
    victimTS: TopicSpace,
): Promise<GRepository> {
    const newArr = repo.topicSpaces.filter((value) => {
        return value.name !== victimTS.name;
    });
    return new GRepository(repo.path, newArr, repo.users);
}
/** Create a new repo object with the new user added */
export async function addUser(
    repo: GRepository,
    newUser: User,
): Promise<GRepository> {
    const newUserArr = repo.users as User[];
    newUserArr.push(newUser);
    return new GRepository(repo.path, repo.topicSpaces, newUserArr);
}
/** Create a new repo object without the victim user */
export async function removeUser(
    repo: GRepository,
    victimUser: User,
): Promise<GRepository> {
    const newUserArr = repo.users.filter((value) => {
        return value.name !== victimUser.name;
    });
    return new GRepository(repo.path, repo.topicSpaces, newUserArr);
}
