"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = require("path");
const url = require("url");
const dispatcher = require("./GitDrive/dispatcher");
// YS:The null here is for the sake of dereferencing the object when the window
// is closed.
let mainWindow = null;
const windowOptions = {
    backgroundColor: "#fff",
    darkTheme: true,
    height: 600,
    minHeight: 600,
    minWidth: 600,
    width: 1000,
};
function createWindow() {
    // Create the browser window.
    mainWindow = new electron_1.BrowserWindow(windowOptions);
    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "../index.html"),
        protocol: "file:",
        slashes: true,
    }));
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    // Emitted when the window is closed.
    mainWindow.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
    const res = dispatcher.git(["status"], "C:\Users\hacoo");
    res.then(() => {
        if (mainWindow) {
            mainWindow.setSize(500, 400);
        }
    }).catch((err) => {
        // tslint:disable-next-line:no-console
        console.log("why did this get rejected " + err);
    });
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on("ready", () => {
    createWindow();
});
// Quit when all windows are closed.
electron_1.app.on("window-all-closed", () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", () => {
    // On OS X it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
//# sourceMappingURL=main.js.map