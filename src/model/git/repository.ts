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
        return new Repository(mssg);
    }
    /**
     * The proto Repository object, it has these members, in order:
     * The local path of where the repository resides: path: string,
     * The name of the repo, for now it is the basename of the path:
     *  name: string,
     */
    public readonly repositoryProtoBuf: any;

    public constructor(
        repoPath: string | any,
    ) {
        if (typeof repoPath === "string") {
            this.repositoryProtoBuf = new protoRepository.Repository();
            this.repositoryProtoBuf.setPath(repoPath);
            this.repositoryProtoBuf.setName(basename(repoPath));
        } else {
            this.repositoryProtoBuf = repoPath;
        }
    }

    /**
     * For now repos with the same id are the same.
     */
    public id(): string {
        return `${this.path} ${this.name}`;
    }

    /** The local path of where the repository resides */
    public get path(): string {
        return this.repositoryProtoBuf.getPath();
    }

    /** The name of the repo, for now it is the basename of the path */
    public get name(): string {
        return this.repositoryProtoBuf.getName();
    }

    public serialize(): Uint8Array {
        return this.repositoryProtoBuf.serializeBinary();
    }



}
