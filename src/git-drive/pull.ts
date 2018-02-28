import {Repository} from "../model/repository";
import {git, overrideCredentialHelper} from "./core-git";

/**
 * Pull current HEAD.
 * This is just here for the possibility of needing it. The main problem
 * is that users can make commits through GitHub, commits that won't follow
 * our rules and we have to deal with it. We will see. We maybe able to
 * tolerate the owner of the branch rebasing some remote commits made on
 * their own branch.
 * The caller has to verify that the owner of the branch is calling this.
 * This assumes that the origin is fully configured.
 * TODO: progress
 * TODO: authentication
 * @param repo Repo where to pull the current checked-out branch
 */
export async function pull(
    repo: Repository,
): Promise<void> {
    const args = [...overrideCredentialHelper,
            "pull",
             "--no-rebase",
            "origin"];
    await git(args, repo.path);
}


// No pull-all function as it will automatically break the rule of only the
// owner of the branch commits on their branch. It will be the case where
// person 1 made a commit on branch person 2 and person 3 was the one who
// pulled that commit. Will have to look into this.
