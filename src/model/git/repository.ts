import { basename } from "path";

/**
 * An immutable object to keep track of local repos.
 * TODO: maybe include a uuid so that repos are guaranteed to be unique
 * for now the id method should suffice.
 * The length of name should be less than 101 to adhere with GitHub standards.
 */
export class Repository {
    /** Current repo path on the machine */
    public readonly path: string;
    /** Name of repo is the directory name it resides in */
    public readonly name: string;

    public constructor(
        path: string,
    ) {
        this.path = path;
        this.name = basename(path);
    }
/**
 * For now repos with the same id are the same.
 */
public id(): string {
    return `${this.path}${this.name}`;
}

}
