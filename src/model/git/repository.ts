import { basename } from "path";
// tslint:disable-next-line:no-var-requires
const protoRepository = require("../../../static/repo_pb");

/**
 * An immutable object to keep track of local repos.
 * TODO: maybe include a uuid so that repos are guaranteed to be unique
 * for now the id method should suffice.
 * The length of name should be less than 101 to adhere with GitHub standards.
 * IMPORTANT: The constructor does not checking over the validity of the path,
 * passed to it, this is left to the caller's discretion.
 */
export class Repository {
    /** Deserialize the byte array read from the proto message */
    public static deserialize(uint8Arr: Uint8Array): Repository {
        const mssg = protoRepository.Repository.deserializeBinary(uint8Arr);
        return new Repository(mssg.getPath());
    }
    /**
     * The proto Repository object, it has these members, in order:
     * path: string,
     * name: string,
     */
    private readonly protoObj: any;

    public constructor(
        repoPath: string,
    ) {
    this.protoObj = new protoRepository.Repository();
    this.protoObj.setPath(repoPath);
    this.protoObj.setName(basename(repoPath));
    }

    /**
     * For now repos with the same id are the same.
     */
    public id(): string {
        return `${this.protoObj.getPath()} ${this.protoObj.getName()}`;
    }

    /** Just your typical getter from the private proto instance */
    public get path(): string {
        return this.protoObj.getPath();
    }

    /** You typical getter from the private proto instance */
    public get name(): string {
        return this.protoObj.getName();
    }

    public serialize(): Uint8Array {
        return this.protoObj.serializeBinary();
    }



}
