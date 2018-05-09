import {
    readFile,
    writeFile,
} from "fs-extra";
import { join } from "path";
import { GRepository } from "../model/app";
import { Repository } from "../model/git";

export async function writeRepoInfo(repo: GRepository, path?: string): Promise<void> {
    if (path) {
        await writeFile(join(path, `${repo.name}.proto`), new Buffer(repo.serialize()), (err) => {
            if (err) {
                throw err;
            }
            return;
        });
    } else {
        await writeFile(join(repo.path, "repo.proto"), new Buffer(repo.serialize()), (err) => {
            if (err) {
                throw err;
            }
            return;
        });
    }

}

export async function readRepoInfo(repo: Repository): Promise<GRepository> {
    const buffer = await readFile(join(repo.path, "repo.proto"));
    return GRepository.deserialize(new Uint8Array(buffer));
}
