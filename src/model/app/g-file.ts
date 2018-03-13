import { Commit } from "models/git/commit";
import { Variant } from "../POST";
import { User } from "./user";

/** An immutable file object */
export class GFile {
    /** The name of the file, with extension */
    public readonly name: string;
    /** The path the current revision of the file resides in */
    public readonly path: string;
    /** The version of the file in the format: v00r00p00 */
    public readonly version: string;
    /** The authors collaborating on the file */
    public readonly authors: ReadonlyArray<User>;
    /** The type of variant for this instance of the file */
    public readonly variant: Variant;
    /** The current revision (commit) the file state was taken from */
    public readonly commit: Commit;
    /** Is this instance of file visible for others */
    public readonly visible?: boolean;

    public constructor(
        name: string,
        path: string,
        version: string,
        authors: ReadonlyArray<User>,
        variant: Variant,
        commit: Commit,
        visible?: boolean,
    ) {
        this.name = name;
        this.path = path;
        this.version = version;
        this.authors = authors;
        this.variant = variant;
        this.commit = commit;
        this.visible = visible;
    }
}
