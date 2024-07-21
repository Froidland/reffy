import { writable } from "svelte/store";
import { createDefaultChannel } from "../utils";
import type { Channel, Message } from "../types";

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

window.electron.ipcRenderer.on(
	"bancho:pm",
	(_event, message: Message & { channelName: string }) => {
		channels.addMessage(message.channelName, message);
	},
);

window.electron.ipcRenderer.on(
	"bancho:cm",
	(_event, message: Message & { channelName: string }) => {
		channels.addMessage(message.channelName, message);
	},
);
