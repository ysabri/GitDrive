import { Branch } from "models/git/branch";

/**
 * A key value map to be used for each workspace name to map a branch for
 * the user.
 */
export interface IWorkspaceBranch {
    [key: string]: Branch;
}
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
    public readonly workSpaces: IWorkspaceBranch;

    public constructor(
        name: string,
        email: string,
        workspace: IWorkspaceBranch,
    ) {
        this.name = name;
        this.email = email;
        this.workSpaces = workspace;
    }


}
