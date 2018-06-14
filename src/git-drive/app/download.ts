import { Repository } from "../../model/git";
// import { removeRemotePrefix } from "../../util";
import { clone, createBranchFromRemote, getBranches } from "../git";

export async function download(
    path: string,
    url: string,
): Promise<void> {
    console.log("in download");
    await clone(url, path);
    const repo: Repository = new Repository(path);
    await createLocalCounterparts(repo);
}


async function createLocalCounterparts(
    repo: Repository,
): Promise<void> {
    const refs = await getBranches(repo, "refs/remotes");
    for (const ref of refs) {
        // we don't want to create a local ΗEAD in our refs
        if (ref.name !== "HEAD") {
            await createBranchFromRemote(repo, ref.name,
                "origin/" + ref.name);
        }
    }
}
