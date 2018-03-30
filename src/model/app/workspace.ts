import { Branch } from "../git/branch";
import { Commit } from "../git/commit";
import { GFile } from "./g-File";

export interface IChangeList {
    [key: string]: GFile;
}

/** An immutable workspace object */
export class WorkSpace extends Branch {
    /** The list of commits on the branch */
    public readonly commits: ReadonlyArray<Commit>;
    /**
     * The SHA of the files along with the file itself that is yet to be
     * integrated into the WorkSpace.
     */
    public readonly changeList: IChangeList;
    /**
     * The origin from where this workspace was created. It is undefined if
     * it was created at the beginning  of the repo, ie on top of its
     * topicspace first commit
     */
    public readonly originCommit?: string;

    /**
     * The name of the workspace, for now it is the first G then the first 10
     * chars of the first commit's SHA. This should be dynamically decided,
     * what I mean is it should be based on the least needed number of chars,
     * the way git does it. So 7 at first then one more till that is not enough
     * to uniquely identify and so on. The G is to avoid ambiguity when calling
     * commands like branch and checkout
     *
     * This is what an overload looks like, not the prettiest thing but it
     * makes sense once you remember typescript is a structurally typed
     * language. The last constructor is the actual one that gets called, the
     * types of arg1-6 is a union of all the types of each argument in the
     * constructors above them in order, thus the optionality of some arg4-6.
     */
    public constructor(
        branch: Branch,
        commits: ReadonlyArray<Commit>,
        changeList: IChangeList,
        origin?: string,
    );
    public constructor(
        name: string,
        remoteUpstream: string | null,
        tip: Commit,
        commits: ReadonlyArray<Commit>,
        changeList: IChangeList,
        origin?: string,
    )
    constructor(
        arg1: Branch | string,
        arg2: ReadonlyArray<Commit> | string | null,
        arg3: Commit | IChangeList,
        arg4?: string | ReadonlyArray<Commit>,
        arg5?: IChangeList,
        arg6?: string,
    ) {
        // meaning the second constructor was called
        if (typeof arg1 === "string") {
            if (arg1.startsWith("G")) {
                super(arg1, arg2 as string | null, arg3 as Commit);
            } else {
                super("G" + arg1.slice(0, 10), arg2 as string | null, arg3 as Commit);
            }
            this.commits = arg4 as ReadonlyArray<Commit>;
            this.changeList = arg5 as IChangeList;
            // this class member can be undefined
            this.originCommit = arg6;
        } else {
            super(arg1.name, arg1.remoteUpstream, arg1.tip);
            this.commits = arg2 as ReadonlyArray<Commit>;
            this.changeList = arg3 as IChangeList;
            this.originCommit = arg4 as string;
        }
    }

    public id(): string {
        return ` ${this.name} with ${this.commits.length} commits`;
    }

    public get firstCommit(): string {
        return this.name.slice(1, 11);
    }

}
