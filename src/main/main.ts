// tslint:disable-next-line:no-var-requires
// require("module-alias/register");

import { app, BrowserWindow } from "electron";
import { join } from "path";
import { format } from "url";
import { startEx } from "../examples/examples";
// import { keyValPair, startEx, variant } from "./examples/examples";
import { git } from "../git-drive/git/core-git";
import { measure } from "../util/git-perf";

// YS:The null here is for the sake of dereferencing the object when the window
// is closed.
let mainWindow: Electron.BrowserWindow | null = null;

const windowOptions: Electron.BrowserWindowConstructorOptions = {
  backgroundColor: "#fff",
  darkTheme: true,
  height: 600,
  minHeight: 600,
  minWidth: 600,
  width: 1000,
};

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow(windowOptions);

  // and load the index.html of the app.
  mainWindow.loadURL(format({
      pathname: join(__dirname, "../../index.html"),
      protocol: "file:",
      slashes: true,
  }));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  const result = git(["config", "--list"], join(__dirname, "./"));

  result.then((res) => {
    // tslint:disable-next-line:no-console
    // console.log(res.stdout);
    if (mainWindow) {
      mainWindow.setSize(500, 400);
    }
  }).catch((err) => {
    // tslint:disable-next-line:no-console
    console.log("why did this got rejected: " + err);
  });
  // variant();
  // keyValPair();
  measure("Start Repo", () => startEx());
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.