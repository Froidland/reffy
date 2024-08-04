import type { Channel, ChannelType } from "../types";

/**
 * Get a formatted timestamp string in the format of `hh:mm:ss`.
 */
export function getFormattedTimestamp(date: Date) {
	return `${date.getHours().toString().padStart(2, "0")}:${date
		.getMinutes()
		.toString()
		.padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
}

export function getChannelTypeFromName(channelName: string): ChannelType {
	if (channelName.startsWith("#mp_")) {
		return "multiplayer";
	}

	if (channelName.startsWith("#")) {
		return "public";
	}

	return "private";
}

export function createDefaultChannel(channelName: string): Channel {
	switch (getChannelTypeFromName(channelName)) {
		case "multiplayer": {
			return {
				type: "multiplayer",
				name: channelName,
				gamemode: "osu",
				teamMode: "headToHead",
				size: 0,
				mods: "",
				winCondition: "score",
				players: {},
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

export function generateId(length?: number) {
	const array = new Uint8Array((length ?? 16) / 2);
	window.crypto.getRandomValues(array);
	return Array.from(array, (value) =>
		value.toString(16).padStart(2, "0"),
	).join("");
}
