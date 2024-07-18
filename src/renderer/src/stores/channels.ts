import type { ElectronAPI } from "@electron-toolkit/preload";
import { get, writable } from "svelte/store";
import type { API } from "../../../preload";

type BaseChannel = {
	type: "public" | "private" | "lobby";
	name: string;
};

type LobbyChannelHistory = {
	timestamp: Date;
} & (
	| {
			action: "message";
			username: string;
			message: string;
	  }
	| {
			action: "join";
			username: string;
	  }
	| {
			action: "leave";
			username: string;
	  }
	| {
			action: "teamChange";
			username: string;
			team: "red" | "blue";
	  }
	| {
			action: "slotChange";
			username: string;
			slot: number;
	  }
	| {
			action: "mapChange";
			username: string;
			mapId: string;
	  }
	| {
			action: "hostClear";
	  }
	| {
			action: "matchStart";
	  }
	| {
			action: "matchFinish";
	  }
	| {
			action: "matchAbort";
	  }
);

type PrivateMessage = {
	username: string;
	message: string;
	timestamp: Date;
};

type PublicChannel = BaseChannel & {
	type: "public";
	history: {
		action: "message" | "join" | "leave";
		username: string;
		message: string;
		timestamp: Date;
	}[];
};

type PrivateChannel = BaseChannel & {
	type: "private";
	history: {
		action: "message";
		username: string;
		message: string;
		timestamp: Date;
	}[];
};

type LobbyChannel = BaseChannel & {
	type: "lobby";
	gamemode: "osu" | "mania" | "taiko" | "fruits";
	teamMode: "headToHead" | "tagCoOp" | "teamVs" | "tagTeamVs";
	size: number;
	mods: string;
	winCondition: "score" | "accuracy" | "combo" | "scorev2";
	players: {
		username: string;
		team: "red" | "blue" | null;
		slot: number;
	};
	history: LobbyChannelHistory[];
};

type Channel = PublicChannel | PrivateChannel | LobbyChannel;

const channels = writable<{ [name: string]: Channel }>({});

function addChannel(channel: Channel) {
	const existingChannel = get(channels)[channel.name];

	if (existingChannel) {
		return;
	}

	channels.update((channels) => ({
		...channels,
		[channel.name]: channel,
	}));
}

function removeChannel(channelName: string) {
	channels.update((channels) =>
		Object.fromEntries(
			Object.entries(channels).filter(([name]) => name !== channelName),
		),
	);
}

function addPrivateMessage(message: PrivateMessage) {
	const channel = get(channels)[message.username];

	if (!channel) {
		addChannel({
			type: "private",
			name: message.username,
			history: [
				{
					action: "message",
					username: message.username,
					message: message.message,
					timestamp: message.timestamp,
				},
			],
		});

		return;
	}

	// just for type inference
	if (channel.type !== "private") {
		return;
	}

	channel.history.push({
		action: "message",
		username: message.username,
		message: message.message,
		timestamp: message.timestamp,
	});

	channels.update((channels) => ({
		...channels,
		[message.username]: channel,
	}));
}

window.electron.ipcRenderer.on(
	"bancho:pm",
	(_event, message: PrivateMessage) => {
		addPrivateMessage(message);
	},
);

// TODO: add handling for channel messages

export { channels, addChannel, removeChannel, addPrivateMessage };

// I would love to not have to do this in every damn file where I use the API, but it just doesn't work, maybe I'm doing something wrong or I'm just stupid
declare global {
	interface Window {
		electron: ElectronAPI;
		api: API;
	}
}
