import { git, overrideCredentialHelper } from "./core-git";

/**
 * Clones a repo from url.
 * For now we will not deal with authentication.
 * TODO: figure out how to go about auth the users, since clone will ask for
 * auth if given it is a network command.
 * TODO: setup the branch to get checkouted out upon cloning. This should be
 * the user's branch if it exists or it some default branch we specify or a
 * prompt the user to create their own branch then check it out (what gets
 * checked out during this doesn't matter). Just look into implementing this.
 * TODO: Add progress tracker, not urgent or necessary, it's just nice.
 * @param url the URL from where to clone
 * @param path the path where to clone to, it will be created if it doesn't
 * exist.
 */
export async function clone(
    url: string,
    path: string,
    ): Promise<void> {
        // find out why the __dirname works?
    await git([...overrideCredentialHelper, "clone", url, path], __dirname);
}
