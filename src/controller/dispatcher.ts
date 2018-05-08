import { ipcRenderer, OpenDialogOptions, remote } from "electron";
import { loadGRepo } from "../git-drive/app/load-repo";
import { GRepository } from "../model/app/g-repository";
import { TopicSpace } from "../model/app/topicspace";
import { AppState } from "./app-state";
const changeTitle = "changeTitle";
export class Dispatcher {
    private readonly appState: AppState;

    public constructor(
        appState: AppState,
    ) {
        this.appState = appState;
    }

    public get fistTime(): boolean {
        return this.appState.FirstTimer;
    }

    public get TSs(): ReadonlyArray<TopicSpace> | undefined {
        if (this.appState.currentRepo) {
            return this.appState.currentRepo.topicSpaces;
        } else {
            return undefined;
        }
    }

    public get currentRepo(): GRepository | undefined {
        return this.appState.currentRepo;
    }

    public async loadNewRepo(): Promise<GRepository> {
        // console.log("Made it into dispatcher, meaning we went all the way");
        const options: OpenDialogOptions = {
            properties: ["openDirectory"],
        };
        const files = await remote.dialog.showOpenDialog(options);
        console.log(files[0]);
        return await loadGRepo(files[0]);
    }

    public changeCurrRepo(repo: GRepository) {
        ipcRenderer.send(changeTitle, repo.name);
        this.appState.changeSelectedRepo(repo);
    }

}
