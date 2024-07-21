import "./assets/main.css";

import { mount } from "svelte";
import App from "./App.svelte";
import type { ElectronAPI } from "@electron-toolkit/preload";
import type { API } from "../../preload";

const app = mount(App, { target: document.getElementById("app") });

export default app;

declare global {
	interface Window {
		electron: ElectronAPI;
		api: API;
	}
}
