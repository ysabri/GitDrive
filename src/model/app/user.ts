import { WorkSpace } from "./WorkSpace";

/** An immutable user object */
export class User {
    /** The name of the user, not a username, ie, "first last" */
    public readonly name: string;
    /** The email of the user, will be used in commits */
    public readonly email: string;
    /** The WorkSpaces that belong to the user */
    public readonly workSpaces: ReadonlyArray<WorkSpace>;

    public constructor(
        name: string,
        email: string,
        workspace: ReadonlyArray<WorkSpace>,
    ) {
        this.name = name;
        this.email = email;
        this.workSpaces = workspace;
    }
}
