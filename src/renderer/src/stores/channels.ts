import type { ElectronAPI } from "@electron-toolkit/preload";
import { writable } from "svelte/store";
import type { API } from "../../../preload";

type ChannelType = "public" | "private" | "lobby";

type BaseChannel = {
	type: ChannelType;
	name: string;
};

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
	history: Message[];
};

type LobbyChannelAction =
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
	history: LobbyChannelAction[];
};

export type Channel = PublicChannel | PrivateChannel | LobbyChannel;

export function getChannelTypeFromName(channelName: string): ChannelType {
	if (channelName.startsWith("#mp_")) {
		return "lobby";
	}

	if (channelName.startsWith("#")) {
		return "public";
	}

	return "private";
}

export function createDefaultChannel(channelName: string): Channel {
	switch (getChannelTypeFromName(channelName)) {
		case "lobby": {
			return {
				type: "lobby",
				name: channelName,
				gamemode: "osu",
				teamMode: "headToHead",
				size: 0,
				mods: "",
				winCondition: "score",
				players: [],
				history: [],
			};
		}
		case "public": {
			return {
				type: "public",
				name: channelName,
				history: [],
			};
		}
		case "private": {
			return {
				type: "private",
				name: channelName,
				history: [],
			};
		}
	}
}

function createChannelStore() {
	const { subscribe, set, update } = writable<Map<string, Channel>>(
		new Map(),
	);

	function addChannel(channel: Channel) {
		update((channels) => {
			if (!channels.get(channel.name)) {
				channels.set(channel.name, channel);
			}

			return channels;
		});
	}

	function removeChannel(channelName: string) {
		update((channels) => {
			channels.delete(channelName);

			return channels;
		});
	}

	function addMessage(channelName: string, message: Message) {
		update((channels) => {
			if (!channels.get(channelName)) {
				channels.set(channelName, createDefaultChannel(channelName));
			}

			const channel = channels.get(channelName);
			channel.history.push(message);

			channels.set(channelName, channel);

			return channels;
		});
	}

	return {
		subscribe,
		set,
		update,
		addChannel,
		removeChannel,
		addMessage,
	};
}

export const channels = createChannelStore();

window.electron.ipcRenderer.on("bancho:pm", (_event, message: Message) => {
	channels.addMessage(message.username, message);
});

window.electron.ipcRenderer.on(
	"bancho:cm",
	(_event, message: Message & { channelName: string }) => {
		channels.addMessage(message.channelName, message);
	},
);

// I would love to not have to do this in every damn file where I use the API, but it just doesn't work, maybe I'm doing something wrong or I'm just stupid
declare global {
	interface Window {
		electron: ElectronAPI;
		api: API;
	}
}
