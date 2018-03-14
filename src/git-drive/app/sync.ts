import { commit } from "git/commit";
import { fetchAll } from "git/fetch";
import { pushBranch } from "git/push";
import { GRepository } from "models/app/g-repository";
import { User } from "models/app/user";
import { WorkSpace } from "models/app/workspace";


export async function sync(
    repo: GRepository,
    user: User,
    workspace: WorkSpace,
): Promise<void> {
    return;
}
