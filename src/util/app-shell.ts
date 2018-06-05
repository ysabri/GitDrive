// This code was taken from: https://github.com/desktop/desktop project,
// at this link:
// https://github.com/desktop/desktop/blob/master/app/src/lib/app-shell.ts
import { ipcRenderer, shell as electronShell } from "electron";

export interface IAppShell {
  readonly moveItemToTrash: (path: string) => boolean;
  readonly beep: () => void;
  readonly openExternal: (path: string) => Promise<boolean>;
  readonly openItem: (path: string) => boolean;
  readonly showItemInFolder: (path: string) => void;
}

export const shell: IAppShell = {
  moveItemToTrash: electronShell.moveItemToTrash,
  // tslint:disable-next-line:object-literal-sort-keys
  beep: electronShell.beep,
  openExternal: (path) => {
    return new Promise<boolean>((resolve, reject) => {
      ipcRenderer.once(
        "open-external-result",
        (event: Electron.IpcMessageEvent, { result }: { result: boolean }) => {
          resolve(result);
        },
      );

      ipcRenderer.send("open-external", { path });
    });
  },
  showItemInFolder: (path) => {
    ipcRenderer.send("show-item-in-folder", { path });
  },
  openItem: electronShell.openItem,
};
