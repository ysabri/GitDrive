import { GFile } from "models/app/g-file";
import { Branch } from "models/git/branch";
import { Commit } from "models/git/commit";
import { CommitterID } from "models/git/committer-id";
import {getVal} from "utils/getVal";
import { IPublicVariant, PublicVariant } from "../POST";
import { WorkSpace } from "./workspace";

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
