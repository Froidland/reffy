type Config = {
	hasApiKey: boolean;
	activeChannelName: string | null;
};

function createConfigStore() {
	let config = $state<Config>({
		hasApiKey: false,
		activeChannelName: null,
	});

	return {
		get hasApiKey() {
			return config.hasApiKey;
		},
		set hasApiKey(value: boolean) {
			config.hasApiKey = value;
		},
		get activeChannelName() {
			return config.activeChannelName;
		},
		set activeChannelName(value: string | null) {
			config.activeChannelName = value;
		},
	};
}

export const config = createConfigStore();
