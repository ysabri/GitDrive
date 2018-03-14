import { commit } from "git/commit";
import { fetchAll } from "git/fetch";
import { pushBranch } from "git/push";
import { GRepository } from "models/app/g-repository";
import { User } from "models/app/user";
import { WorkSpace } from "models/app/workspace";
import { Branch } from "models/git/branch";
import { getVal } from "utils/getVal";

export async function sync(
    repo: GRepository,
    user: User,
    workspace: WorkSpace,
): Promise<void> {
    const userBranch = getVal(user.workSpaces, workspace.name);
    return;
}
