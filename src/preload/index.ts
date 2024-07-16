import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import type { InitializeBanchoOptions, BaseBanchoResponse as BasicBanchoResponse } from "./types";

// Custom APIs for renderer
const api = {
	initializeBancho: async (options: InitializeBanchoOptions): Promise<void> =>
		await ipcRenderer.invoke("bancho:initialize", options),
	loginBancho: async (): Promise<BasicBanchoResponse> =>
		await ipcRenderer.invoke("bancho:login"),
	sendPrivateMessage: async (username: string, message: string): Promise<BasicBanchoResponse> =>
		await ipcRenderer.invoke("bancho:sendPrivateMessage", { username, message }),
	sendChannelMessage: async (channelName: string, message: string): Promise<BasicBanchoResponse> =>
		await ipcRenderer.invoke("bancho:sendChannelMessage", { channelName, message }),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld("electron", electronAPI);
		contextBridge.exposeInMainWorld("api", api);
	} catch (error) {
		console.error(error);
	}
} else {
	// @ts-ignore (define in dts)
	window.electron = electronAPI;
	// @ts-ignore (define in dts)
	window.api = api;
}

export type API = typeof api;
