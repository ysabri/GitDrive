import { remove } from "fs-extra";
import { join } from "path";

/** Clean up the repo after the test */
export async function removeRepo(
    repoPath: string,
): Promise<void> {
    await remove(join(repoPath, ".git/"));
    await remove(join(repoPath, ".CURRENT_USER"));
    await remove(join(repoPath, "repo.proto"));
    await remove(join(repoPath, ".gitignore"));
    await remove(join(repoPath, "sync.txt"));
}

export async function errMsgMatch(
    str: string,
    fn: () => Promise<any>,
): Promise<any> {
    try {
        await fn();
    } catch (err) {
        return err.message.match(str);
    }
    return null;
}
