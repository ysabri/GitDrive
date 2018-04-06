import { WorkSpace } from "./workspace";
// tslint:disable-next-line:no-var-requires
const protoUser = require("../../../static/user_pb");


/** An immutable user object */
export class User {
    /** The name of the user, not a username, ie, "first last" */
    // public readonly name: string;
    /** The email of the user, will be used in commits */
    // public readonly email: string;
    /**
     * The WorkSpaces that belong to the user, along with their branches in
     * each WorkSpace.
     */
    // public readonly workSpaces: IWorkspaceBranch;

    /** Deserialize the byte array read from the proto message */
    public static deserialize(uint8Arr: Uint8Array): User {
        const mssg = protoUser.User.deserializeBinary(uint8Arr);
        return new User(mssg);
    }

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

    public get name(): string {
        return this.userProtoBuf.getName();
    }

    public get email(): string {
        return this.userProtoBuf.getEmail();
    }

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
