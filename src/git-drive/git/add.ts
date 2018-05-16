import { Repository } from "../../model/git/repository";
import { git } from "./core-git";

export interface IAddToIndexOptions {
    /**
     * This is the only option exposed for now, this will update a rename
     * accordingly. Not much to say for now as this needs more experimentation.
     */
    update?: boolean;
}

/**
 * So this will stage all changes to the indexing area. I don't think we will
 * ever partially stage files as that will be done using partial checkout and
 * path resets. Not using update-index is for the better since we need to pass
 * a list of all the files if we do. I think it is safe to say --all or
 * --update options are not going anywhere anytime soon.
 * TODO: Look into update and how it works with renames.
 * @param repo Where to stage the changes
 * @param addOptions Whether there is a rename or not in this stage
 */
export async function addAllToIndex(
    repo: Repository,
    addOptions?: IAddToIndexOptions,
): Promise<void> {
    let args = ["add", "--all"];
    if (addOptions && addOptions.update === true) {
        args = [...args, "--update"];
    }

    await git(args, repo.path);
}
