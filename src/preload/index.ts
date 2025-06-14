import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import type { InitializeBanchoOptions, BaseBanchoResponse } from "./types.js";

// Custom APIs for renderer
const api = {
	initializeBancho: async (options: InitializeBanchoOptions): Promise<void> =>
		await ipcRenderer.invoke("bancho:initialize", options),
	loginBancho: async (): Promise<BaseBanchoResponse> =>
		await ipcRenderer.invoke("bancho:login"),
	destroyBancho: async (): Promise<void> =>
		await ipcRenderer.invoke("bancho:destroy"),
	sendMessage: async (
		destination: string,
		message: string,
	): Promise<BaseBanchoResponse> =>
		await ipcRenderer.invoke("bancho:sendMessage", {
			destination,
			message,
		}),
	joinChannel: async (channelName: string): Promise<BaseBanchoResponse> =>
		await ipcRenderer.invoke("bancho:joinChannel", {
			channelName,
		}),
	leaveChannel: async (channelName: string): Promise<BaseBanchoResponse> =>
		await ipcRenderer.invoke("bancho:leaveChannel", {
			channelName,
		}),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld("electron", electronAPI); // TODO: don't expose the entire electron API to the renderer
		contextBridge.exposeInMainWorld("api", api);
	} catch (error) {
		console.error(error);
	}
} else {
	// @ts-ignore (define in dts)
	window.electron = electronAPI; // TODO: don't expose the entire electron API to the renderer
	// @ts-ignore (define in dts)
	window.api = api;
}

export type API = typeof api;
