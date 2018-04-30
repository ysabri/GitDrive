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

}
