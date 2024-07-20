import "./assets/main.css";

import App from "./App.svelte";
import type { ElectronAPI } from "@electron-toolkit/preload";
import type { API } from "../../preload";

const app = new App({
	target: document.getElementById("app"),
});

export default app;

declare global {
	interface Window {
		electron: ElectronAPI;
		api: API;
	}
}
