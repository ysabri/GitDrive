import { Commit } from "models/git/commit";
import { GFile } from "./File";
import { User } from "./User";

/** An immutable workspace object */
export class WorkSpace {
    /**
     * The name of the workspace, for now it is the first 15 chars of the first
     * commit's SHA. This should be dynamically decided, what I mean is it
     * should be based on the least needed number of chars, the way git does
     * it. So 7 at first then one more till that is not enough to uniquely
     * identify and so on.
     */
    public readonly name: string;
    /** The user that owns the workspace */
    public readonly user: User;
    /** The list of commits on the branch */
    public readonly commit: ReadonlyArray<Commit>;
    /**
     * The SHA of the files along with the file itself that is yet to be
     * integrated into the WorkSpace.
     */
    public readonly changeList: [string, GFile];

    public constructor(
        name: string,
        user: User,
        commit: ReadonlyArray<Commit>,
        changeList: [string, GFile],
    ) {
        this.name = name;
        this.user = user;
        this.commit = commit;
        this.changeList = changeList;
    }

}
