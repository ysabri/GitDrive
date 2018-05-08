import { remote } from "electron";
import { pathExistsSync, readFileSync } from "fs-extra";
import { join } from "path";
import { GRepository } from "../model/app/g-repository";
import { AppData } from "../model/controller/appData";

export class AppState {
    public readonly FirstTimer: boolean;
    private appData: AppData;

    private readonly electronExePath: string = remote.app.getPath("exe");
    private readonly cachedDataPath: string = join(this.electronExePath, "/cache/cache.proto");

    public constructor() {
        this.FirstTimer = this.isFirstTimer();
        if (this.FirstTimer) {
            this.appData = new AppData();
            return;
        }
        const buffer = readFileSync(this.cachedDataPath);
        this.appData = AppData.deserialize(new Uint8Array(buffer));
    }

    public get currentRepo(): GRepository | undefined {
        return this.appData.currentRepo;
    }
    public get repos(): Map<string, GRepository> {
        return this.appData.repos;
    }
    public async changeSelectedRepo(
        repo: GRepository,
    ): Promise<void> {
        this.appData.addRepo(repo);
        this.appData = new AppData(repo, repo.users[0],
            this.appData.repos);
    }
    private isFirstTimer(): boolean {
        return !pathExistsSync(this.cachedDataPath);
    }

}
