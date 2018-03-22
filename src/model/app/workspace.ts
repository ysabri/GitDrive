import { Commit } from "../git/commit";
import { GFile } from "./g-File";

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
    /** The list of commits on the branch */
    public readonly commit: ReadonlyArray<Commit>;
    /**
     * The SHA of the files along with the file itself that is yet to be
     * integrated into the WorkSpace.
     */
    public readonly changeList: IChangeList;

    public readonly originCommit?: string;

    public constructor(
        name: string,
        commit: ReadonlyArray<Commit>,
        changeList: IChangeList,
        origin?: string,
    ) {
        this.name = "G" + name.slice(0, 11);
        this.commit = commit;
        this.changeList = changeList;
        this.originCommit = origin;
    }

    public id(): string {
        return ` ${this.name} with ${this.commit.length} commits`;
    }

    public get firstCommit(): string {
        return this.name.slice(1, 11);
    }

}
