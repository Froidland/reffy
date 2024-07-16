export type InitializeBanchoOptions = {
	username: string;
	password: string;
	apiKey?: string;
	botAccount?: boolean;
	gamemode?: number;
	host?: string;
	port?: number;
};

export type BaseBanchoResponse = {
	success: boolean;
	message: string;
};
