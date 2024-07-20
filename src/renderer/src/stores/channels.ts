import type { ElectronAPI } from "@electron-toolkit/preload";
import { get, writable } from "svelte/store";
import type { API } from "../../../preload";

type BaseChannel = {
	type: "public" | "private" | "lobby";
	name: string;
};

type LobbyChannelHistory =
	| {
			action: "join";
			username: string;
			timestamp: Date;
	  }
	| {
			action: "leave";
			username: string;
			timestamp: Date;
	  }
	| {
			action: "teamChange";
			username: string;
			team: "red" | "blue";
			timestamp: Date;
	  }
	| {
			action: "slotChange";
			username: string;
			slot: number;
			timestamp: Date;
	  }
	| {
			action: "mapChange";
			username: string;
			mapId: string;
			timestamp: Date;
	  }
	| {
			action: "hostClear";
			timestamp: Date;
	  }
	| {
			action: "matchStart";
			timestamp: Date;
	  }
	| {
			action: "matchFinish";
			timestamp: Date;
	  }
	| {
			action: "matchAbort";
			timestamp: Date;
	  }
	| Message;

type Message = {
	action: "message";
	username: string;
	message: string;
	timestamp: Date;
};

type PublicChannel = BaseChannel & {
	type: "public";
	history: Message[];
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
	}[];
	history: LobbyChannelHistory[];
};

type Channel = PublicChannel | PrivateChannel | LobbyChannel;

const channels = writable<{ [name: string]: Channel }>({});
const currentChannel = writable<Channel | null>(null);

function setCurrentChannel(channelName: string) {
	const channel = get(channels)[channelName];

	if (!channel) {
		return;
	}

	currentChannel.set(channel);
}

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

function addPrivateMessage(message: Message) {
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

	// this makes the messages view update itself, there has to be a better way
	if (get(currentChannel) === channel) {
		setCurrentChannel(message.username);
	}
}

function addChannelMessage(message: Message & { channelName: string }) {
	const channel = get(channels)[message.channelName];

	if (!channel) {
		addChannel({
			type: "public",
			name: message.channelName,
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

	channel.history.push({
		action: "message",
		username: message.username,
		message: message.message,
		timestamp: message.timestamp,
	});

	// this makes the messages view update itself, there has to be a better way
	if (get(currentChannel) === channel) {
		setCurrentChannel(message.channelName);
	}
}

window.electron.ipcRenderer.on("bancho:pm", (_event, message: Message) => {
	addPrivateMessage(message);
});

window.electron.ipcRenderer.on(
	"bancho:cm",
	(_event, message: Message & { channelName: string }) => {
		addChannelMessage(message);
	},
);

export {
	channels,
	currentChannel,
	setCurrentChannel,
	addChannel,
	removeChannel,
	addPrivateMessage,
	addChannelMessage,
};

// I would love to not have to do this in every damn file where I use the API, but it just doesn't work, maybe I'm doing something wrong or I'm just stupid
declare global {
	interface Window {
		electron: ElectronAPI;
		api: API;
	}
}
