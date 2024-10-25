type Config = {
	hasApiKey: boolean;
	activeChannelName: string | null;
};

export const config = $state<Config>({
	hasApiKey: false,
	activeChannelName: null,
});
