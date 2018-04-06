import {Commit} from "./commit";
// tslint:disable-next-line:no-var-requires
const protoBranch = require("../../../static/branch_pb");
/**
 * An immutable Git branch.
 * If the branch's remoteUpstream is null, it means it is a local branch.
 * TODO: figure out how to name the branches and what should be the
 * minimum/maximum length for a branch.
 */
export class Branch {

    /** Deserialize the byte array read from the proto message */
    public static deserialize(uint8Arr: Uint8Array): Branch {
        const mssg = protoBranch.Branch.deserializeBinary(uint8Arr);
        return new Branch(mssg);
    }
    /**
     * This protoBuf object has the following members, in order:
     * - Current name of branch with no prefixes: name: string
     * - This is prefixed with the remote name, which will always be origin
     * since all GitDrive repos should have one remote only.
     * This will be null when remote is not configured: remoteupstream: string
     * - Commit object the branch is pointing to: tip: Commit
     */
    public readonly branchProtoBuf: any;

    public constructor(
        protoMsg: any,
    )
    public constructor(
        name: string,
        remote: string | null,
        tip: Commit,
    )
    constructor(
        nameOrProtoMsg: string | any,
        remote?: string | null,
        tip?: Commit,
    ) {
        if (typeof nameOrProtoMsg === "string") {
            this.branchProtoBuf = new protoBranch.Branch();
            this.branchProtoBuf.setName(nameOrProtoMsg);
            this.branchProtoBuf.setRemoteupstream(remote || "");
            this.branchProtoBuf.setTip(tip!.commitProtoBuf);
        } else {
            this.branchProtoBuf = nameOrProtoMsg;
        }
    }
    /** Current name of branch with no prefixes */
    public get name(): string {
        return this.branchProtoBuf.getName();
    }
    /**
     * This is postfixed with the remote name, which will always be origin
     * since all GitDrive repos should have one remote only.
     * This will be null when remote is not configured.
     */
    public get remoteUpstream(): string | null {
        const remoteString = this.branchProtoBuf.getRemoteupstream();
        return remoteString !== "" ?  remoteString : null;
    }
    /** Commit object the branch is pointing to */
    public get tip(): Commit {
        return new Commit(this.branchProtoBuf.getTip());
    }

    public serialize(): Uint8Array {
        return this.branchProtoBuf.serializeBinary();
    }

}
