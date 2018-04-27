import { remote } from "electron";
import { pathExistsSync } from "fs-extra";
import { AppData } from "../model/controller/appData";

export class Dispatcher {


    public constructor() {
        // get the path where the electron executable resides
        const electronPath = remote.app.getPath("exe");
        if (firstTimer(electronPath)) {

        }
    }

}

async function firstTimer(electronPath: string): Promise<boolean> {

}
