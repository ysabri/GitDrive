import { GitError as errorsEnum} from "dugite";
import {
    readFile,
    writeFile,
} from "fs-extra";
import { join } from "path";
// import { getBlobBinaryContents, GitError, pushBranch } from "../git-drive/git";
import { GitError, pushBranch } from "../git-drive/git";
import { GRepository } from "../model/app";
import { Repository } from "../model/git";

export async function writeRepoInfo(repo: GRepository, path?: string): Promise<void> {
    // The "-/-" is to trick the basename function into putting - as the name.
    const toBeWriten = new GRepository("-/-", repo.topicSpaces, repo.users, repo.metaBranch);
    if (path) {
        await writeFile(join(path, `${repo.name}.proto`), new Buffer(toBeWriten.serialize()), (err) => {
            if (err) {
                throw err;
            }
            return;
        });
    } else {
        await writeFile(join(repo.path, "repo.proto"), new Buffer(toBeWriten.serialize()), (err) => {
            if (err) {
                throw err;
            }
            return;
        });
    }

}

export async function readRepoInfo(repo: Repository): Promise<GRepository> {
    const buffer = await readFile(join(repo.path, "repo.proto"));
    // The repo will have path as "-/-" and name as "-", we should fix this before
    // returning it to the user.
    const read = GRepository.deserialize(new Uint8Array(buffer));
    return new GRepository(repo.path, read.topicSpaces, read.users, read.metaBranch);
}

/**
 * This function assumes that the metadata branch is checked out already.
 * It is fair since any function that would want to push the metadata branch
 * would have committed on it.
 * ":<n>:<path>, e.g. :0:README, :README
 * A colon, optionally followed by a stage number (0 to 3) and a colon,
 * followed by a path, names a blob object in the index at the given path.
 * A missing stage number (and the colon that follows it) names a stage 0
 * entry. During a merge, stage 1 is the common ancestor, stage 2 is the
 * target branch’s version (typically the current branch), and stage 3 is
 * the version from the branch which is being merged."
 * To rephrase, if stage :0: is empty then a merge is happening. From there
 * on stage 1-3 have the three way merge states. In fact, there cannot be
 * more than those stages even if an octopus merge is performed. The reason
 * is that octopus merges cannot handle conflicts in the same file in multiple
 * branches.
 * @param repo The repo where we will try to push the metadata
 */
export async function pushMetadata(
    repo: GRepository,
): Promise<void> {
    try {
        await pushBranch(repo, repo.metaBranch);
    } catch (err) {
        const gitError: GitError = err;
        // skip this error as we will handle it bellow
        if (gitError.errEnum !== errorsEnum.PushNotFastForward) {
            throw err;
        }
    }
    // From here on we are sure that the repo is in a merge state
    // let buffer: Buffer = await getBlobBinaryContents(repo, `:2`, "repo.proto");
    // const our: GRepository = await GRepository.deserialize(new Uint8Array(buffer));

    // buffer = await getBlobBinaryContents(repo, `:3`, "repo.proto");
    // const theirs: GRepository = await GRepository.deserialize(new Uint8Array(buffer));

    // additions precede removals


}
