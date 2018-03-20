import { existsSync, lstatSync, readdir } from "fs";
import { join } from "path";
import { GFile } from "../../model/app/g-file";
import { GRepository } from "../../model/app/g-repository";
import { addAllToIndex } from "../git/add";
import { partialCheckout } from "../git/checkout";

/**
 * This is not as strict as it should be since it is not harmful without the
 * ability to commit the checkout.
 * This assumes that the intended workspace checked out already.
 * The caller is responsible for the state change in checkouts.
 * This also assumes the owner of the workspace is performing this checkout
 * @param repo The repo where the partial checkout will happen
 * @param file The file to partially checkout
 */
export async function checkoutFile(
    repo: GRepository,
    file: GFile,
): Promise<void> {
    addAllToIndex(repo);
    // checkout the file
    partialCheckout(repo, file.commit.SHA, [file.path]);
}
/**
 * Checkout the contents of a directory based on the state of the targetRef
 * This is not as strict as it should be since it is not harmful without the
 * ability to commit the checkouts.
 * This assumes the intended workspace is checked out already.
 * This also assumes the correct user is performing this.
 * @param repo The repo where the partial checkouts will happen
 * @param path The path of dir to checkout
 * @param targetRef The ref of where to get the state of the files from
 * @param includeSubDir whether to partial checkout files in sub directories
 */
export async function checkoutDir(
    repo: GRepository,
    path: string,
    targetRef: string,
    includeSubDir: boolean,
) {
    // stage everything to avoid losing them
    addAllToIndex(repo);
    // check if the path exists
    if (!existsSync(path)) {
        throw new Error("Path passed to checkoutDir doesn't exist");
    }
    // read the directory, both files and paths
    await readdir(path, (err, files) => {
        // get the full path to the contents of the directory
        const paths = files.map((str) => {
            return join(path, str);
        });
        // filter the files out only, since partial checkout takes files only
        const noDir = paths.filter((val) => {
            // boolean
            const isDir = lstatSync(val).isDirectory();
            // means recurse into sub- directories
            if (isDir && includeSubDir) {
                checkoutDir(repo, val, targetRef, includeSubDir);
                return false;
            // no recurse
            } else if (isDir) {
                return false;
            } else {
                return true;
            }
        });

        partialCheckout(repo, targetRef, noDir);
    });

}

