import { Repository } from "../../model/git";
import { removeRemotePrefix } from "../../util";
import { createBranchFromRemote, getBranches } from "../git";

export async function download(
    path: string,
    url: string,
): Promise<void> {
    // await clone(url, path);
    const repo: Repository = new Repository(path);
    await createLocalCounterparts(repo);
}


async function createLocalCounterparts(
    repo: Repository,
): Promise<void> {
    const refs = await getBranches(repo, "refs/remotes");
    for (const ref of refs) {
        const stripped: string | null = removeRemotePrefix(ref.name);
        // we don't want to create a local ΗEAD in our refs
        if (stripped && stripped !== "HEAD") {
            await createBranchFromRemote(repo, stripped,
                "origin/" + stripped);
        }
    }
}
