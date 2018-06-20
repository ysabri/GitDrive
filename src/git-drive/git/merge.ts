import { Repository } from "../../model/git/repository";
import { git } from "./core-git";

export async function merge(
    repo: Repository,
    branch: string,
): Promise<void> {
    const args = ["merge", branch];
    await git(args, repo.path);
}
