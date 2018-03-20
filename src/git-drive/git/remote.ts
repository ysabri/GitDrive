import { Repository } from "../../model/git/repository";
import { git } from "./core-git";

/** Define an immutable remote object */
export interface IRemote {
    readonly name: string;
    readonly url: string;
}
/**
 * Looks up and returns the one and only remote
 * This function assumes that the repo added is both and push and fetch repo.
 * In fact if it is not a fetch and not a push repo the function won't notice,
 * keep this in mind.
 * TODO: maybe add a check for this, for now it is not needed as it is a fair
 * assumption.
 * @param repo The repo in which the remote belongs to
 * @returns IRemote or null if the remote doesn't exist
 */
export async function getRemote(
    repo: Repository,
): Promise<IRemote | null> {
    // This will return the remotes in the following format:
    // [remoteName]  [URL] [(fetch || push)]
    const res = await git(["remote", "-v"], repo.path);
    const stdout = res.stdout;
    // return only the lines that end with fetch, arbitrary choice
    const line = stdout.split("\n").filter( (str) => {
        return str.endsWith("(fetch)");
    });
    // TODO: Log this error in a proper way.
    if (line.length > 1) {
        throw new Error("[getRemote: found more than one remote repo");
    } else if (line.length === 0 ) {
        return null;
    }
    // match one space or more. There should be exactly two
    const remoteVars = line[0].split(/\s+/);
    return {name: remoteVars[0], url: remoteVars[1]};
}

/**
 * Add the one and only repo.
 * The git process will reject the promise with an error.
 * @param repo The repo at which to add the remote
 * @param url url of the remote repo
 */
export async function addRemote(
    repo: Repository,
    url: string,
): Promise<void> {
    await git(["remote", "add", "origin", url], repo.path);
}

export async function changeUrl(
    repo: Repository,
    url: string,
): Promise<void> {
    await git(["remote", "set-url", "origin", url], repo.path);
}
