import { GRepository } from "../app/g-repository";
import { User } from "../app/user";

// tslint:disable-next-line:no-var-requires
const protoAppData = require("../../../static/proto-models/app-data_pb");


export class AppData {

    /** Deserialize the byte array read from the proto message */
    public static deserialize(uint8Arr: Uint8Array): AppData {
        const mssg = protoAppData.appData.deserializeBinary(uint8Arr);
        return new AppData(mssg);
    }

    public readonly appDataProtoBuf: any;

    public constructor(
        appDataProtoMsg?: any,
    )
    public constructor(
        currentRepo: GRepository,
        currentUser: User,
        repos: ReadonlyArray<GRepository>,
    )
    constructor(
        currentRepoOrAppDataProtoMsg?: GRepository | any,
        currentUser?: User,
        repos?: ReadonlyArray<GRepository>,
    ) {
        // if nothing was passed to the constructor
        if (!currentRepoOrAppDataProtoMsg) {
            this.appDataProtoBuf = new protoAppData.appData();
        } else if (currentRepoOrAppDataProtoMsg instanceof GRepository) {
            this.appDataProtoBuf = new protoAppData.appData();
            this.appDataProtoBuf.setCurrentrepo(currentRepoOrAppDataProtoMsg.gRepositoryProtoBuf);
            this.appDataProtoBuf.setCurrentuser(currentUser!.userProtoBuf);
            const reposMap: Map<string, any> = this.appDataProtoBuf.getReposMap();
            repos!.forEach((value) => {
                reposMap.set(value.name, value.gRepositoryProtoBuf);
            });
        } else {
            this.appDataProtoBuf = currentRepoOrAppDataProtoMsg;
        }
    }
    /** The current Repo to show in the app */
    public get currentRepo(): GRepository | undefined {
        return new GRepository(this.appDataProtoBuf.getCurrentrepo());
    }
    /** The current user of the app */
    public get currentUser(): User | undefined {
        return new User(this.appDataProtoBuf.getCurrentUser());
    }
    /** The list of repos in the app */
    public get repos(): Map<string, GRepository> {
        const reposMap: Map<string, GRepository> = new Map<string, GRepository>();
        (this.appDataProtoBuf.getReposMap() as Map<string, any>).forEach((val, key) => {
            reposMap.set(key, new GRepository(val));
        });
        return reposMap;
    }

    public async addRepo(
        newRepo: GRepository,
    ): Promise<void> {
        (this.appDataProtoBuf.getReposMap() as Map<string, any>)
            .set(newRepo.name, newRepo.gRepositoryProtoBuf);
    }

    public serialize(): Uint8Array {
        return this.appDataProtoBuf.serializeBinary();
    }
}
