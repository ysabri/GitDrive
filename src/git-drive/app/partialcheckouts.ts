import { addAllToIndex } from "git/add";
import { partialCheckout } from "git/checkout";
import { GFile } from "models/app/g-file";
import { GRepository } from "models/app/g-repository";
import { WorkSpace } from "models/app/WorkSpace";
/**
 * This assumes that the workspace passed is checked out already.
 * The caller is responsible for the state change in checkouts.
 * This also assumes the owner of the workspace is performing this checkout
 * @param repo The repo where the partial checkout will happen
 * @param file The file to partially checkout
 * @param workspace The workspace to which the partial checkout is happening
 */
export async function checkoutFile(
    repo: GRepository,
    file: GFile,
    workspace: WorkSpace,
): Promise<void> {
    addAllToIndex(repo);

    partialCheckout(repo, workspace.name, [file.path]);
}

