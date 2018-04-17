import { Commit } from "../git/commit";
import { User } from "./user";
import { WorkSpace } from "./workspace";
// tslint:disable-next-line:no-var-requires
const protoTopicSpace = require("../../../static/proto-models/topicspace_pb");


/** An immutable TopicSpace */
export class TopicSpace {

    /** Deserialize the byte array read from the proto message */
    public static deserialize(uint8Arr: Uint8Array): TopicSpace {
        const mssg = protoTopicSpace.TopicSpace.deserializeBinary(uint8Arr);
        return new TopicSpace(mssg);
    }
    /**
     * This protoBuf object has the following members, in order:
     * - The name of the TopicSpace: name: string
     * - The list of users in the space: users: ReadonlyArray<User>
     * - The WorkSpaces in the topic space, it should match users in length:
     *  workspaces: ReadonlyArray<Workspace>
     * - The first commit in the topicSpace: firstCommitL: Commit
     * - The origin commit that created the space, it is undefind for the first
     * space: originCommit: Commit
     */
    public readonly topicspaceProtoBuf: any;

    public constructor(
        protoMsg: any,
    )
    public constructor(
        name: string,
        users: ReadonlyArray<User>,
        workspaces: ReadonlyArray<WorkSpace>,
        firstCommit: Commit,
        origincommit?: Commit,
    )
    constructor(
        nameOrProtoMsg: string | any,
        users?: ReadonlyArray<User>,
        workspaces?: ReadonlyArray<WorkSpace>,
        firstCommit?: Commit,
        origincommit?: Commit,
    ) {
        if (typeof nameOrProtoMsg === "string") {
            this.topicspaceProtoBuf = new protoTopicSpace.TopicSpace();
            this.topicspaceProtoBuf.setName(nameOrProtoMsg);
            this.topicspaceProtoBuf.setUsersList(users!.map((value) => {
                return value.userProtoBuf;
            }));
            this.topicspaceProtoBuf.setWorkspacesList(workspaces!.map((value) => {
                return value.workSpaceProtoBuf;
            }));
            this.topicspaceProtoBuf.setFirstcommit(firstCommit!.commitProtoBuf);
            this.topicspaceProtoBuf.setOrigincommit(origincommit ?
                origincommit.commitProtoBuf : undefined);
        } else {
            this.topicspaceProtoBuf = nameOrProtoMsg;
        }
    }

    public id(): string {
        return `${this.name}\n\t\t Users:(${this.users.map((val) => {
            return val.id();
        }).toString()})\n\t\t and WorkSpaces:(${this.workSpaces.map((val) => {
            return val.id();
        }).toString()})`;
    }
    /** The name of the TopicSpace */
    public get name(): string {
        return this.topicspaceProtoBuf.getName();
    }
    /** The list of users in the space: users */
    public get users(): ReadonlyArray<User> {
        const protoArr = this.topicspaceProtoBuf.getUsersList() as any[];
        return protoArr.map((value) => {
            return new User(value);
        });
    }
    /**
     * The WorkSpaces in the topic space, it should match users in length:
     * workspaces.
     */
    public get workSpaces(): ReadonlyArray<WorkSpace> {
        const protoArr = this.topicspaceProtoBuf.getWorkspacesList() as any[];
        return protoArr.map((value) => {
            return new WorkSpace(value);
        });
    }
    /** The first commit in the topicSpace */
    public get firstCommit(): Commit {
        return new Commit(this.topicspaceProtoBuf.getFirstcommit());
    }
    /**
     * The origin commit that created the space, it is undefind for the first
     * space.
     */
    public get originCommit(): Commit | undefined {
        return this.topicspaceProtoBuf.hasOrigincommit() ?
            new Commit(this.topicspaceProtoBuf.getOrigincommit()) : undefined;
    }

    public serialize(): Uint8Array {
        return this.topicspaceProtoBuf.serializeBinary();
    }
}
