import Store from "electron-store";

type Config = {
	credentials: {
		username: string;
		password: string;
	};
	rememberMe: boolean;
};

export const config = new Store<Config>();
