import { readFileSync, writeFile } from "fs";
import { join } from "path";
import { GRepository } from "../model/app/g-repository";
import { Repository } from "../model/git/repository";

export async function writeRepoInfo(repo: GRepository, path?: string): Promise<void> {
    if (path) {
        await writeFile(join(path, `${repo.name}.proto`), repo.serialize(), (err) => {
            if (err) {
                throw err;
            }
        });
    } else {
        await writeFile(join(repo.path, "repo.proto"), repo.serialize(), (err) => {
            if (err) {
                throw err;
            }
        });
    }
    return;
}

export async function readRepoInfo(repo: Repository): Promise<GRepository> {
    const buffer = readFileSync(join(repo.path, "repo.proto"));
    return GRepository.deserialize(new Uint8Array(buffer));
}
