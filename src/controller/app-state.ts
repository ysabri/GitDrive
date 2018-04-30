import { remote } from "electron";
import { pathExistsSync, readFileSync } from "fs-extra";
import { join } from "path";
import { AppData } from "../model/controller/appData";

export class AppState {
    public readonly appData: AppData;
    public readonly FirstTimer: boolean;

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
    private isFirstTimer(): boolean {
        return !pathExistsSync(this.cachedDataPath);
    }
}
