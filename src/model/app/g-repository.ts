import { Repository } from "../git/repository";
import { TopicSpace } from "./topicspace";
import { User } from "./user";
// tslint:disable-next-line:no-var-requires
const protoGRepo = require("../../../static/proto-models/grepo_pb");


/** An immutable repository object */
export class GRepository extends Repository {

    /** Deserialize the byte array read from the proto message */
    public static deserialize(uint8Arr: Uint8Array): GRepository {
        const mssg = protoGRepo.GRepo.deserializeBinary(uint8Arr);
        return new GRepository(mssg);
    }
    /**
     * This protoBuf object has the following members, in order:
     * - The parent Repository object: parent: Repository
     * - A list of TopicSpace in the repo:
     *  topicspaces: ReadonlyArray<TopicSpace>
     * - The global list of users in the repo: users: ReadonlyArray<User>
     * - The global structure meta branch name
     */
    public readonly gRepositoryProtoBuf: any;

    public constructor(
        repoOrProtoMsg: Repository | any,
    )
    public constructor(
        path: string,
        topicspaces: ReadonlyArray<TopicSpace>,
        users: Map<string, User>,
        metaBranch: string,
    )
    constructor(
        pathOrRepoOrProtoMsg: string | Repository | any,
        topicspaces?: ReadonlyArray<TopicSpace>,
        users?: Map<string, User>,
        metaBranch?: string,
    ) {
        if (typeof pathOrRepoOrProtoMsg === "string") {
            super(pathOrRepoOrProtoMsg);
        } else if (pathOrRepoOrProtoMsg instanceof Repository) {
            super(pathOrRepoOrProtoMsg.path);
        } else {
            super(pathOrRepoOrProtoMsg.getParent());
            this.gRepositoryProtoBuf = pathOrRepoOrProtoMsg;
            return;
        }
        this.gRepositoryProtoBuf = new protoGRepo.GRepo();
        this.gRepositoryProtoBuf.setParent(this.repositoryProtoBuf);
        this.gRepositoryProtoBuf.setTopicspacesList(topicspaces!.map((value) => {
            return value.topicspaceProtoBuf;
        }));
        const userMap = this.gRepositoryProtoBuf.getUsersMap() as Map<string, any>;
        users!.forEach((value) => {
            userMap.set(value.name, value.userProtoBuf);
        });
        this.gRepositoryProtoBuf.setMetabranch(metaBranch);
    }

    public id(): string {
        return `**(Repository: ${super.id()}\n\t with TopicSpace: ${this.topicSpaces.map((val) => {
            return val.id();
        }).join("\n\t, TopicSpace: ")}\n\t and Users:(${this.users}).toString()})\n)**`;
    }
    /** A list of TopicSpace in the repo */
    public get topicSpaces(): ReadonlyArray<TopicSpace> {
        const protoArr = this.gRepositoryProtoBuf.getTopicspacesList() as any[];
        return protoArr.map((value) => {
            return new TopicSpace(value);
        });
    }
    /** The global list of users in the repo */
    public get users(): Map<string, User> {
        const protoMap = this.gRepositoryProtoBuf.getUsersMap() as Map<string, any>;
        const usersMap: Map<string, User> = new Map<string, User>();
        protoMap.forEach((value, key) => {
            usersMap.set(key, new User(value));
        });
        return usersMap;
    }
    /** The global structure meta branch name */
    public get metaBranch(): string {
        return this.gRepositoryProtoBuf.getMetabranch();
    }

    public serialize(): Uint8Array {
        return this.gRepositoryProtoBuf.serializeBinary();
    }

}
