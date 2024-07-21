import type { Channel, ChannelType } from "../types";

export function getFormattedTimestamp(date: Date) {
	// "[hh:mm:ss]"
	return `${date.getHours().toString().padStart(2, "0")}:${date
		.getMinutes()
		.toString()
		.padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
}

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
