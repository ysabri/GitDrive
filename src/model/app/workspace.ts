import { Branch } from "../git/branch";
import { Commit } from "../git/commit";
import { GFile } from "./g-File";
// tslint:disable-next-line:no-var-requires
const workSpaceProto = require("../../../static/proto-models/workspace_pb");

export interface IChangeList {
    [key: string]: GFile;
}

/** An immutable workspace object */
export class WorkSpace extends Branch {

    /** Deserialize the byte array read from the proto message */
    public static deserialize(uint8Arr: Uint8Array): WorkSpace {
        const mssg = workSpaceProto.Workspace.deserializeBinary(uint8Arr);
        return new WorkSpace(mssg);
    }
    /**
     * This protoBuf object has the following members, in order:
     * - The parent Branch object: parent: Branch
     * - The list of commits on the branch: commits: ReadonlyArray<Commit>
     * - The origin from where this workspace was created. It is undefined if
     *  it was created at the beginning  of the repo, ie on top of its
     *  topicspace first commit: originCommit: string
     * - The SHA of the files along with the file itself that is yet to be
     * integrated into the WorkSpace: changeList: Map<string, GFile>
     */
    public readonly workSpaceProtoBuf: any;

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
     * constructors above them in order, thus the optionality of some arg2-6.
     *
     * Key for the args:
     * arg1: protoMsg | branch | name
     * arg2: commits | remoteUpstream
     * arg3: changeList | tip
     * arg4: origin | commits
     * arg5: changeList
     * arg6: origin
     */
    public constructor(
        protoMsg: any,
    )
    public constructor(
        branch: Branch,
        commits: ReadonlyArray<Commit>,
        changeList: IChangeList,
        origin?: string,
    )
    public constructor(
        name: string,
        remoteUpstream: string | null,
        tip: Commit,
        commits: ReadonlyArray<Commit>,
        changeList: IChangeList,
        origin?: string,
    )
    constructor(
        arg1: Branch | string | any,
        arg2?: ReadonlyArray<Commit> | string | null,
        arg3?: Commit | IChangeList,
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
            this.workSpaceProtoBuf = new workSpaceProto.WorkSpace();
            this.workSpaceProtoBuf.setParent(this.branchProtoBuf);
            this.workSpaceProtoBuf.setCommitsList(
                (arg4 as ReadonlyArray<Commit>).map((value) => {
                return value.commitProtoBuf;
            }));
            // TODO: add change list
            this.workSpaceProtoBuf.setOrigincommit(arg6 as string || "");
        } else if (arg1 instanceof Branch) {
            super(arg1.name, arg1.remoteUpstream, arg1.tip);
            this.workSpaceProtoBuf = new workSpaceProto.WorkSpace();
            this.workSpaceProtoBuf.setParent(this.branchProtoBuf);
            this.workSpaceProtoBuf.setCommitsList(
                (arg2 as ReadonlyArray<Commit>).map((value) => {
                return value.commitProtoBuf;
            }));
            // TODO: add changelist
            this.workSpaceProtoBuf.setOrigincommit(arg4 as string || "");
        } else {
            super(arg1.getParent());
            this.workSpaceProtoBuf = arg1;
        }
    }

    public id(): string {
        return ` ${this.name} with ${this.commits.length} commits and tip: ${this.tip.title}`;
    }

    public get firstCommit(): string {
        return this.name.slice(1, 11);
    }
    /** The list of commits on the branch: commits */
    public get commits(): ReadonlyArray<Commit> {
        const protoArr = this.workSpaceProtoBuf.getCommitsList() as any[];
        return protoArr.map((value) => {
            return new Commit(value);
        });
    }

    public addCommit(newCommit: Commit) {
        this.workSpaceProtoBuf.addCommits(newCommit.commitProtoBuf);
    }
    /**
     * The origin from where this workspace was created. It is undefined if
     *  it was created at the beginning  of the repo, ie on top of its
     *  topicspace's first commit
     */
    public get originCommit(): string | undefined {
        const shaStr = this.workSpaceProtoBuf.getOrigincommit();
        return shaStr !== "" ? shaStr : undefined;
    }
    /**
     * The SHA of the files along with the file itself that is yet to be
     * integrated into the WorkSpace.
     */
    public get changeList(): IChangeList {
        return {};
    }

    public toPrint(): string[] {
        const stringCommitArr = this.commits.map((value) => {
            return value.toPrint().join(",");
        });
        return ["Name: " + this.name, "Upstream: " + this.remoteUpstream || "",
            "tip: " + this.tip.toPrint().join(","),
            "Commits: " + stringCommitArr.join(",")];
    }

    public serialize(): Uint8Array {
        return this.workSpaceProtoBuf.serializeBinary();
    }

}
