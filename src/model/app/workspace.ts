import { Commit } from "models/git/commit";
import { GFile } from "./g-File";
import { User } from "./user";

export interface IChangeList {
    [key: string]: GFile;
}

/** An immutable workspace object */
export class WorkSpace {
    /**
     * The name of the workspace, for now it is the first G then the first 10
     * chars of the first commit's SHA. This should be dynamically decided,
     * what I mean is it should be based on the least needed number of chars,
     * the way git does it. So 7 at first then one more till that is not enough
     * to uniquely identify and so on. The G is to avoid ambiguity when calling
     * commands like branch and checkout
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
    public readonly changeList: IChangeList;

    public constructor(
        name: string,
        user: User,
        commit: ReadonlyArray<Commit>,
        changeList: IChangeList,
    ) {
        this.name = "G" + name.slice(0, 11);
        this.user = user;
        this.commit = commit;
        this.changeList = changeList;
    }

    public id(): string {
        return `**<WorkSpace: ${this.name} ${this.user.id()} with commits:${this.commit.length}>**`;
    }

}
