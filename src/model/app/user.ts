import { Branch } from "models/git/branch";
import { WorkSpace } from "./workspace";

/** An immutable user object */
export class User {
    /** The name of the user, not a username, ie, "first last" */
    public readonly name: string;
    /** The email of the user, will be used in commits */
    public readonly email: string;
    /**
     * The WorkSpaces that belong to the user, along with their branches in
     * each WorkSpace.
     */
    public readonly workSpaces: [WorkSpace, Branch];

    public constructor(
        name: string,
        email: string,
        workspace: [WorkSpace, Branch],
    ) {
        this.name = name;
        this.email = email;
        this.workSpaces = workspace;
    }
}
