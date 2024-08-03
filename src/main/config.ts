import Store from "electron-store";

export type Config = {
	credentials: {
		username: string;
		password: string;
		apiKey?: string;
		rememberMe: boolean;
	};
};

export const config = new Store<Config>();
