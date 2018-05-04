import { TopicSpace } from "../model/app/topicspace";
import { AppState } from "./app-state";

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
        if (this.appState.appData.currentRepo) {
            return this.appState.appData.currentRepo.topicSpaces;
        } else {
            return undefined;
        }
    }

}
