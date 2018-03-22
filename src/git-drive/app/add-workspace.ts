import { GRepository } from "../../model/app/g-repository";
import { TopicSpace } from "../../model/app/topicspace";
import { User } from "../../model/app/user";
import { IChangeList, WorkSpace } from "../../model/app/workspace";
import { Branch } from "../../model/git/branch";
import {
    checkoutAndCreateBranch,
    commit,
    getCommit,
    renameBranch,
    reset,
    ResetMode,
} from "../git";
import { writeUserFile } from "./start";


export async function createWorkSpace(
    repo: GRepository,
    user: User,
    topicSpace: TopicSpace,
    basedOn: WorkSpace,
): Promise<WorkSpace> {
    const exists = topicSpace.users.filter((usr) => {
        return usr.name === user.name;
    });
    if (exists.length > 0) {
        throw new Error(`[createWorkSpace] User: ${user.name} exists already` +
            ` in topicSpace: ${topicSpace.name}`);
    }
    // const branch = await getBranches(repo, `refs/heads/${basedOn.name}`);
    await checkoutAndCreateBranch(repo, "temp", basedOn.tip.SHA);

    await reset(repo, topicSpace.firstCommit.SHA, ResetMode.Mixed);
    await writeUserFile(user.name + " " + user.email, repo.path);
    await commit(repo, user.name, user.email,
        `First revision for ${user.name}'s workspace: `,
        ``);

    const firstCommit = await getCommit(repo, "temp");
    const emptyChangeList: IChangeList = {};

    if (firstCommit) {
        const tempWS = new WorkSpace(firstCommit.SHA, null, firstCommit,
            [firstCommit], emptyChangeList, basedOn.tip.SHA);
        await renameBranch(repo, new Branch("temp", null, firstCommit) , tempWS.name);
        user.workSpaces[tempWS.name] = tempWS;
        return tempWS;
    } else {
        throw new Error(`[createWorkSpace] First commit for user ${user.name}`
        + "cannot be found");
    }
}
