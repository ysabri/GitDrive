import { Repository } from "../../model/git/repository";
import { git, overrideCredentialHelper } from "./core-git";

/**
 * Fetch all changes from remote to local repo. Will likely use all the time.
 * TODO: progress.
 * TODO: authentication.
 * TODO: look into adding prune to this and pull.
 * This assumes origin is configured fully.
 * @param repo The repo to fetch on
 */
export async function fetchAll(
    repo: Repository,
): Promise<void> {
    const args = [...overrideCredentialHelper,
        "fetch",
        "--all",
        "origin"];
    await git(args, repo.path);
}

/**
 * Fetch the refspace from the repo.
 * @param repo repo where to fetch the refspace from.
 * @param refspec the refspace to get from the repo
 */
export async function fetchRefspec(
    repo: Repository,
    refspec: string,
): Promise<void> {
    const args = [...overrideCredentialHelper,
        "fetch",
        "origin",
        refspec,
    ];

    await git(args, repo.path);
}
