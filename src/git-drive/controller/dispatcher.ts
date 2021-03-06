import {
    ipcRenderer,
    OpenDialogOptions,
    remote,
} from "electron";
import {
    GRepository,
    TopicSpace, User,
} from "../../model/app";
import { loadGRepo } from "../app/load-repo";
import { AppState } from "./app-state";

export enum IpcRendererChannles {
    changeTitle = "changeTitle",
    uncaughtEx = "uncaught-exception",
}

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
        }
        return undefined;
    }

    public get currUsers(): ReadonlyArray<User> | undefined {
        if (this.appState.currentRepo) {
            return this.appState.currentRepo.users;
        }
        return undefined;
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
        // tslint:disable-next-line:no-console
        console.log(files[0]);
        return await loadGRepo(files[0]);
    }

    public changeCurrRepo(repo: GRepository) {
        ipcRenderer.send(IpcRendererChannles.changeTitle, repo.name);
        this.appState.changeSelectedRepo(repo);
    }

}
