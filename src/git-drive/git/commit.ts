import { Repository } from "../../model/git/repository";
import { addAllToIndex } from "./add";
import { git } from "./core-git";
import { unstageResetAll } from "./reset";

/**
 * Create a commit with the summary and message passed. For now this function
 * does no error handling. I have to actually do error handling in the core-git
 * first then figure this out and so on.
 * @param repo Repo to create commit in.
 * @param name Author's name
 * @param email Author's email
 * @param summary Commit summary, has to be less than 73 chars.
 * @param message Message to attach to commit.
 */
export async function commit(
    repo: Repository,
    name: string,
    email: string,
    summary: string,
    message: string,
): Promise<boolean> {
    if (summary.length > 72) {
        // TODO: change this.
        return false;
    }
    const commitMessage = `${summary}\n\n${message || ""}\n`.replace(/\s+$/, "\n");
    // clean staging area
    await unstageResetAll(repo);

    await addAllToIndex(repo);

    const args = ["commit", `--author="${name} <${email}>`, "-F", "-"];
    await git(args, repo.path, {
        stdin: commitMessage,
    });
    // TODO: add error handling.
    return true;
}


