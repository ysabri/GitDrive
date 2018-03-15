import { GRepository } from "models/app/g-repository";
import { User } from "models/app/user";


export async function startRepo(
    name: string,
    user: ReadonlyArray<User>,

): Promise<GRepository> {
    return new GRepository("temp", [], []);
}
