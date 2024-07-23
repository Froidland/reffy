import { SvelteMap } from "svelte/reactivity";
import { createDefaultChannel } from "../utils";
import type { Channel, Message } from "../types";

function createChannelStore() {
	const channels = new SvelteMap<string, Channel>();

	const get = (key: string) => channels.get(key);

	const addChannel = (channel: Channel) => {
		if (!channels.has(channel.name)) {
			let newChannel = $state(channel);
			channels.set(channel.name, newChannel);
		}
	};

	const removeChannel = (channelName: string) => channels.delete(channelName);

	const addMessage = (channelName: string, message: Message) => {
		let channel = $state(channels.get(channelName));

		if (!channel) {
			channel = createDefaultChannel(channelName);
			channels.set(channelName, channel);
		}

		channel.history.push(message);
	};

	return {
		values: channels,
		get,
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
