import {IGitResult} from "dugite";
import {git} from "./GCore";

/**
 * Init a repo at given path, TODO: add template dir option or set it up
 * using init.template config, we'll see.
 * @param pathToRep
 */
export default async function name(pathToRep: string): Promise<IGitResult> {
    return await git(["init"], pathToRep);
}
