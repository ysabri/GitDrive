import {IGitResult} from "dugite";
// import {join} from "path";
import {git} from "./core-git";

// export const template: string = join(__dirname, "../../template");

/**
 * Init a repo at given path, TODO: add template dir option or set it up
 * using init.template config, we'll see.
 * @param pathToRep
 */
export default async function init(pathToRep: string): Promise<IGitResult> {
    return await git(["init"], pathToRep);
}
