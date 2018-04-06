import { Commit } from "../git/commit";
import { User } from "./user";
import { WorkSpace } from "./workspace";
// tslint:disable-next-line:no-var-requires
const protoTopicSpace = require("../../../static/topicspace_pb");


/** An immutable TopicSpace */
export class TopicSpace {
    /** The name of the TopicSpace */
    // public readonly name: string;
    /** The list of users in the space */
    // public readonly users: ReadonlyArray<User>;
    /** The WorkSpaces in the topic space, it should match users in length */
    // public readonly workSpaces: ReadonlyArray<WorkSpace>;
    /** The first commit in the topicSpace */
    // public readonly firstCommit: Commit;
    /**
     * The origin commit that created the space, it is undefind for the first
     * space.
     */
    // public readonly originCommit?: Commit;

    /** Deserialize the byte array read from the proto message */
    public static deserialize(uint8Arr: Uint8Array): TopicSpace {
        const mssg = protoTopicSpace.TopicSpace.deserializeBinary(uint8Arr);
        return new TopicSpace(mssg);
    }

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
            // this.name = name;
            // this.users = users;
            // this.workSpaces = workspaces;
            // this.firstCommit = firstCommit;
            // this.originCommit = origincommit;
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

    public get name(): string {
        return this.topicspaceProtoBuf.getName();
    }

    public get users(): ReadonlyArray<User> {
        const protoArr = this.topicspaceProtoBuf.getUsersList() as any[];
        return protoArr.map((value) => {
            return new User(value);
        });
    }

    public get workSpaces(): ReadonlyArray<WorkSpace> {
        const protoArr = this.topicspaceProtoBuf.getWorkspacesList() as any[];
        return protoArr.map((value) => {
            return new WorkSpace(value);
        });
    }

    public get firstCommit(): Commit {
        return new Commit(this.topicspaceProtoBuf.getFirstcommit());
    }

    public get originCommit(): Commit | undefined {
        return this.topicspaceProtoBuf.hasOrigincommit() ?
            new Commit(this.topicspaceProtoBuf.getOrigincommit()) : undefined;
    }

    public serialize(): Uint8Array {
        return this.topicspaceProtoBuf.serializeBinary();
    }
}
