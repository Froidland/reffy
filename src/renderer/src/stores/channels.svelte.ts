import { SvelteMap } from "svelte/reactivity";
import { createDefaultChannel } from "../utils";
import {
	type Channel,
	type UserJoinedEvent,
	type UserLeftEvent,
	type Message,
	type GenericChannelEvent,
	type ChannelEvent,
} from "../types";

function isGenericEvent(event: ChannelEvent): event is GenericChannelEvent {
	return (
		event.type === "message" ||
		event.type === "userJoined" ||
		event.type === "userLeft"
	);
}

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

	const addEvent = (channelName: string, event: ChannelEvent) => {
		// TODO: This feels like a hack, but it works for now
		let channel = $state(channels.get(channelName));

		if (!channel) {
			channel = createDefaultChannel(channelName);
			channels.set(channelName, channel);
		}

		if (channel.type === "multiplayer") {
			channel.history.push(event);
		} else {
			if (isGenericEvent(event)) {
				channel.history.push(event);
			}
		}
	};

	return {
		values: channels,
		get,
		addChannel,
		removeChannel,
		addEvent,
	};
}

export const channels = createChannelStore();

window.electron.ipcRenderer.on(
	"bancho:pm",
	(_electronEvent, message: Message & { channelName: string }) => {
		channels.addEvent(message.channelName, message);
	},
);

window.electron.ipcRenderer.on(
	"bancho:cm",
	(
		_electronEvent,
		event: (Message | UserJoinedEvent | UserLeftEvent) & {
			channelName: string;
		},
	) => {
		if (event.type === "message") {
			channels.addEvent(event.channelName, event);
		}
	},
);
