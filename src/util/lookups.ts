import {
    GRepository,
    TopicSpace,
    WorkSpace,
} from "../model/app";

/**
 * A bunch of retrieval function to abstract our lookups. The main reason is
 * we might change the underlying arrays to maps instead.
 */

/** Easy but nice to abstract. */
export async function getWSfromTS(
    repo: GRepository,
    topicspaceName: string,
    workspaceName: string,
): Promise<WorkSpace> {
    const foundTS = repo.topicSpaces.find((value) => {
        return value.name === topicspaceName;
    });
    if (!foundTS) {
        throw new Error("[getWSfromTS] cannot find the topicspace: " + topicspaceName);
    }
    const foundWS = foundTS.workSpaces.find((value) => {
        return value.name === workspaceName;
    });

    if (!foundWS) {
        throw new Error("[getWSfromTS] cannot find the workspace: " + workspaceName);
    }

    return foundWS;
}
/** Sometimes one doesn't know what topicspace they need to look in. */
export async function getWS(
    repo: GRepository,
    workspaceName: string,
): Promise<WorkSpace> {
    for (const TS of repo.topicSpaces) {
        const foundWS = TS.workSpaces.find((value) => {
            return value.name === workspaceName;
        });
        if (foundWS) {
            return foundWS;
        }
    }
    throw new Error("[getWS] cannot find the workspace: " + workspaceName);
}

/** Again, just nice to abstract out. */
export async function getTS(
    repo: GRepository,
    topicspaceName: string,
): Promise<TopicSpace> {
    const foundTS = repo.topicSpaces.find((value) => {
        return value.name === topicspaceName;
    });
    if (!foundTS) {
        throw new Error("[getTS] cannot find the topicspace: " + topicspaceName);
    }
    return foundTS;
}
