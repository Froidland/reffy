import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import {
	destroyBancho,
	disconnectBancho,
	initializeBancho,
	joinChannel,
	leaveChannel,
	loginBancho,
	sendMessage,
} from "./bancho.js";
import { config, type Config } from "./config.js";
import BanchoJs from "bancho.js";

function createWindow() {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		title: "Reffy",
		width: 900,
		height: 670,
		show: false,
		autoHideMenuBar: true,
		...(process.platform === "linux" ? { icon } : {}),
		webPreferences: {
			preload: join(__dirname, "../preload/index.mjs"),
			sandbox: false,
		},
	});

	mainWindow.on("ready-to-show", () => {
		mainWindow.show();
	});

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: "deny" };
	});

	// HMR for renderer base on electron-vite cli.
	// Load the remote URL for development or the local html file for production.
	if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
		mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
	} else {
		mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
	}

	return mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	// Set app user model id for windows
	electronApp.setAppUserModelId("com.reffy");

	// Default open or close DevTools by F12 in development
	// and ignore CommandOrControl + R in production.
	// see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
	app.on("browser-window-created", (_, window) => {
		optimizer.watchWindowShortcuts(window);
	});

	const window = createWindow();

	ipcMain.handle(
		"bancho:initialize",
		(_event, arg: BanchoJs.BanchoClientOptions) =>
			initializeBancho(arg, window.webContents),
	);
	ipcMain.handle("bancho:login", async () => await loginBancho());
	ipcMain.handle("bancho:destroy", destroyBancho);
	ipcMain.handle(
		"bancho:sendMessage",
		async (_event, arg: { destination: string; message: string }) =>
			await sendMessage(arg.destination, arg.message),
	);
	ipcMain.handle(
		"bancho:joinChannel",
		async (_event, arg: { channelName: string }) =>
			joinChannel(arg.channelName),
	);
	ipcMain.handle(
		"bancho:leaveChannel",
		async (_event, arg: { channelName: string }) =>
			leaveChannel(arg.channelName),
	);

	ipcMain.handle("config:getCredentials", (_event, _arg) => {
		if (!config.get("credentials.rememberMe")) {
			return null;
		}

		return config.get("credentials");
	});
	ipcMain.handle(
		"config:setCredentials",
		(_event, arg: Config["credentials"]) => {
			config.set("rememberMe", arg.rememberMe);

			if (!arg.rememberMe) {
				config.delete("credentials");
				return false;
			}

			// TODO: encrypt the password
			config.set("credentials", arg);
			return true;
		},
	);

	app.on("activate", function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	disconnectBancho();

	if (process.platform !== "darwin") {
		app.quit();
	}
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
