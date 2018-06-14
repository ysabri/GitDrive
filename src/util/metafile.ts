import {
    readFile,
    writeFile,
} from "fs-extra";
import { join } from "path";
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
