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

export const channels: {
	[name: string]: Channel;
} = $state({});

export function addChannel(channel: Channel) {
	const existingChannel = channels[channel.name];

	if (!existingChannel) {
		channels[channel.name] = channel;
	}
}

export function removeChannel(channelName: string) {
	delete channels[channelName];
}

export function addEvent(channelName: string, event: ChannelEvent) {
	let channel = channels[channelName];

	if (!channel) {
		channels[channelName] = createDefaultChannel(channelName);
		channel = channels[channelName];
	}

	if (channel.type === "multiplayer") {
		channel.history.push(event);
	} else {
		if (isGenericEvent(event)) {
			channel.history.push(event);
		}
	}
}

window.electron.ipcRenderer.on(
	"bancho:pm",
	(_electronEvent, message: Message & { channelName: string }) => {
		addEvent(message.channelName, message);
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
			addEvent(event.channelName, event);
		}
	},
);
