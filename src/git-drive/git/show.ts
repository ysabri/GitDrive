import { ChildProcess } from "child_process";
import { Repository } from "../../model/git/repository";
import { spawnAndComplete } from "../../util/spawn";
import { git } from "./core-git";


/**
 * This function uses the git show command to sort of extract/retrieve the
 * contents of a file based on a certain point in time.
 * The function either returns a promise with a buffer containing the binary
 * contents of the file or an error if the file DNE under the commitish.
 * @param repo repo where to look for the file and commitish to get the blob
 * @param commitish A commit/branch/symref/tree to get the blob content based
 * its state. IMPORTANT: This has to be a relative path with respect to where
 * the repo resides.
 * @param filePath the file path in the repo to get its contents based on
 * commitish state. This is a relative path based on.
 */
export async function getBlobBinaryContents(
    repo: Repository,
    commitish: string,
    filePath: string,
) {
    // This is the callback child of type childProcess returning void,
    // Whenever it is used, it takes the child process and sets its encoding
    // to binary. It is a dynamic way of setting the ChildProcess encoding.
    const childBinaryEncodedProcess: (process: ChildProcess) => void
        = (cb) => {
            cb.stdout.setEncoding("binary");
        };
    const args = ["show", `${commitish}:${filePath}`];
    // This execution option among others is part of dugite, look at their
    // code for more info.
    const execOptions = {
        processCallback: childBinaryEncodedProcess,
    };

    const blobResult = await git(args, repo.path, execOptions);

    return Buffer.from(blobResult.stdout, "binary");
}

/**
 * This function uses the git show command to sort of extract/retrieve part of
 * the contents of a file based on a certain point in time.
 * The function either returns a promise with a buffer containing the binary
 * contents of the file or an error if the file DNE under the commitish.
 * @param repo repo where to look for the file and commitish to get the blob.
 * @param commitish A commit/branch/symref/tree to get the blob content based
 * its state. IMPORTANT: This has to be a relative path with respect to where
 * the repo resides.
 * @param filePath the file path in the repo to get its contents based on
 * commitish state. This is a relative path based on.
 * @param length The maximum amount of bytes to read from the blob. Notice how
 * it is the maximum, so the function might always return less.
 */
export async function getPartialBlobBinary(
    repo: Repository,
    commitish: string,
    filePath: string,
    length: number,
): Promise<Buffer> {
    const args = ["show", `${commitish}:${filePath}`];

    const res = await spawnAndComplete(
        args,
        repo.path,
        length,
    );

    return res.output;
}
