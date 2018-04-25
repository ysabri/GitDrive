import { WorkSpace } from "./workspace";
// tslint:disable-next-line:no-var-requires
const protoUser = require("../../../static/proto-models/user_pb");


/** An immutable user object */
export class User {

    /** Deserialize the byte array read from the proto message */
    public static deserialize(uint8Arr: Uint8Array): User {
        const mssg = protoUser.User.deserializeBinary(uint8Arr);
        return new User(mssg);
    }
    /**
     * This protoBuf object has the following members, in order:
     * - The name of the user, not a username, ie, "first last":
     *  name: string
     * - The email of the user, will be used in commits: email: string
     * - The WorkSpaces that belongs to the user:
     *  workspaces: ReadonlyArray<Workspace>
     */
    public readonly userProtoBuf: any;

    public constructor(
        protoMsg: any,
    )
    public constructor(
        name: string,
        email: string,
        workspace: ReadonlyArray<WorkSpace>,
    )
    constructor(
        nameOrProtoMsg: string | any,
        email?: string,
        workspace?: ReadonlyArray<WorkSpace>,
    ) {
        if (typeof nameOrProtoMsg === "string") {
            this.userProtoBuf = new protoUser.User();
            this.userProtoBuf.setName(nameOrProtoMsg);
            this.userProtoBuf.setEmail(email);
            this.userProtoBuf.setWorkspacesList(workspace!.map((value) => {
                return value.workSpaceProtoBuf;
            }));
        } else {
            this.userProtoBuf = nameOrProtoMsg;
        }
    }

    public id(): string {
        return ` ${this.name} ${this.email}`;
    }

    /** The name of the user, not a username, ie, "first last" */
    public get name(): string {
        return this.userProtoBuf.getName();
    }
    /** The email of the user, will be used in commits: email */
    public get email(): string {
        return this.userProtoBuf.getEmail();
    }
    /** The WorkSpaces that belongs to the user */
    public get workSpaces(): ReadonlyArray<WorkSpace> {
        const protoArr = this.userProtoBuf.getWorkspacesList() as any[];
        return protoArr.map((value) => {
            return new WorkSpace(value);
        });
    }

    public addWorkspace(newWorkspace: WorkSpace) {
        this.userProtoBuf.addWorkspaces(newWorkspace.workSpaceProtoBuf);
    }

    public serialize(): Uint8Array {
        return this.userProtoBuf.serializeBinary();
    }

}
