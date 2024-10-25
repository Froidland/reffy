import BanchoJs from "bancho.js";
import { debug } from "./utils.js";
import type { WebContents } from "electron";

const channels: Record<string, BanchoJs.BanchoChannel> = {};
let bancho: BanchoJs.BanchoClient;
let selfUsername: string;
let webContents: WebContents;

export function initializeBancho(
	options: BanchoJs.BanchoClientOptions,
	wc: WebContents,
) {
	if (bancho) {
		return;
	}

	bancho = new BanchoJs.BanchoClient(options);
	webContents = wc;
	selfUsername = options.username;
	debug("{initializeBancho} bancho instance created");
	// TODO: maybe consider storing messages on the main process too?
	bancho.on("PM", (message) => {
		debug(
			`[PM] "${message.user.ircUsername}" -> "${message.recipient.ircUsername}": ${message.content}`,
		);

		const isIncoming = selfUsername === message.recipient.ircUsername;

		webContents.send("bancho:pm", {
			channelName: isIncoming
				? message.user.ircUsername
				: message.recipient.ircUsername,
			type: "message",
			username: message.user.ircUsername,
			message: message.content,
			timestamp: new Date(),
		});
	});
	debug("{initializeBancho} registered private message listener");
}

export function disconnectBancho() {
	if (!bancho) {
		return;
	}

	bancho.disconnect();
	debug("{disconnectBancho} bancho instance disconnected");
}

export function destroyBancho() {
	if (!bancho) {
		return;
	}

	bancho.disconnect();
	debug("{destroyBancho} bancho instance disconnected");
	// @ts-expect-error
	bancho = undefined;
	debug("{destroyBancho} bancho instance reset");
}

export async function loginBancho() {
	if (!bancho) {
		debug("{loginBancho} bancho not initialized");
		return {
			success: false,
			message: "Bancho not initialized",
		};
	}

	if (bancho.isConnected()) {
		debug("{loginBancho} already connected");
		return {
			success: true,
			message: "Already connected",
		};
	}

	try {
		await bancho.connect();
		debug("{loginBancho} bancho instance connected");

		return {
			success: true,
			message: "Bancho connected",
		};
	} catch (err) {
		debug("{loginBancho}", err);
		// I don't think this is necessary, but just in case. Remove this if it causes issues
		bancho.disconnect();
		debug("{loginBancho} bancho instance disconnected");
		// @ts-expect-error just so we can change the username and password of the bancho instance
		// by initializing it again
		bancho = undefined;
		debug("{loginBancho} bancho instance reset");

		return {
			success: false,
			message: (err as Error).message,
		};
	}
}

export async function sendMessage(destination: string, message: string) {
	if (!bancho) {
		debug("{sendMessage} bancho not initialized");
		return {
			success: false,
			message: "Bancho not initialized",
		};
	}

	const isChannel = destination.startsWith("#");

	try {
		if (isChannel) {
			const channel = bancho.getChannel(destination);
			if (!channel) {
				debug("{sendMessage} channel not found", destination);
				return {
					success: false,
					message: "Channel not found",
				};
			}

			await channel.sendMessage(message);
			debug("{sendMessage} message sent to", destination, message);

			return {
				success: true,
				message: `Message sent to ${destination}`,
			};
		}

		const user = bancho.getUser(destination);
		if (!user) {
			debug("{sendMessage} user not found", destination);
			return {
				success: false,
				message: "User not found",
			};
		}

		await user.sendMessage(message);
		debug("{sendMessage} message sent to", destination, message);

		return {
			success: true,
			message: `Message sent to ${destination}`,
		};
	} catch (err) {
		debug("{sendMessage}", err);
		return {
			success: false,
			message: (err as Error).message,
		};
	}
}

export async function joinChannel(channelName: string) {
	if (!bancho) {
		debug("{joinChannel} bancho not initialized");
		return {
			success: false,
			message: "Bancho not initialized",
		};
	}

	try {
		const channel = bancho.getChannel(channelName);
		// I'm not sure if channel can be falsy
		if (!channel) {
			debug("{joinChannel} channel not found", channelName);
			return {
				success: false,
				message: "Channel not found",
			};
		}

		await channel.join();
		debug("{joinChannel} joined channel", channelName);
		channels[channel.name] = channel;
		registerGenericEventListeners(channel);
		debug(
			`{joinChannel} registered event listeners for channel ${channel.name}`,
		);

		return {
			success: true,
			message: `Joined ${channelName}`,
		};
	} catch (err) {
		debug("{joinChannel}", err);
		return {
			success: false,
			message: (err as Error).message,
		};
	}
}

export async function leaveChannel(channelName: string) {
	if (!bancho) {
		debug("{leaveChannel} bancho not initialized");
		return {
			success: false,
			message: "Bancho not initialized",
		};
	}

	try {
		const channel = channels[channelName];
		if (!channel) {
			debug("{leaveChannel} channel not found", channelName);
			return {
				success: false,
				message: "Channel not found",
			};
		}

		await channel.leave();
		debug("{leaveChannel} left channel", channelName);
		channel.removeAllListeners();
		debug(
			"{leaveChannel} removed event listeners for channel",
			channelName,
		);
		delete channels[channelName];

		return {
			success: true,
			message: `Left ${channelName}`,
		};
	} catch (err) {
		debug("{leaveChannel}", err);
		return {
			success: false,
			message: (err as Error).message,
		};
	}
}

export async function createLobby(name: string, isPrivate?: boolean) {
	if (!bancho) {
		debug("{createLobby} bancho not initialized");
		return {
			success: false,
			message: "Bancho not initialized",
		};
	}

	if (!bancho.osuApi?.apiKey) {
		debug("{createLobby} osu! API key not set");

		return {
			success: false,
			message: "osu! API key not set",
		};
	}

	try {
		const channel = await bancho.createLobby(name, isPrivate);
		debug("{createLobby} created lobby", channel.name);

		registerGenericEventListeners(channel);
		registerLobbyEventListeners(channel);

		channels[channel.name] = channel;

		return {
			success: true,
			message: `Created ${channel.name}`,
			data: {
				channelName: channel.name,
			},
		};
	} catch (err) {
		debug("{createLobby}", err);
		return {
			success: false,
			message: (err as Error).message,
		};
	}
}

// TODO: add functions for joining a pre-existing lobby and also leaving a lobby without closing it

export async function closeLobby(channelName: string) {
	if (!bancho) {
		debug("{closeLobby} bancho not initialized");
		return {
			success: false,
			message: "Bancho not initialized",
		};
	}

	try {
		const channel = channels[channelName];
		if (!channel) {
			debug("{closeLobby} channel not found", channelName);
			return {
				success: false,
				message: "Channel not found",
			};
		}

		if (!(channel instanceof BanchoJs.BanchoMultiplayerChannel)) {
			debug(
				"{closeLobby} attempted to close channel that is not a lobby",
				channelName,
			);

			return {
				success: false,
				message: "Channel is not a lobby",
			};
		}

		await channel.lobby.closeLobby();
		debug("{closeLobby} closed lobby", channelName);
		channel.removeAllListeners();
		channel.lobby.removeAllListeners();
		debug("{closeLobby} removed event listeners for channel", channelName);

		return {
			success: true,
			message: `Closed ${channelName}`,
		};
	} catch (err) {
		debug("{closeLobby}", err);
		return {
			success: false,
			message: (err as Error).message,
		};
	}
}

/**
 * Registers generic event listeners such as `message`, `userJoined` (IRC's `JOIN`) and `userLeft` (IRC's `PART`) for a channel.
 */
function registerGenericEventListeners(channel: BanchoJs.BanchoChannel) {
	channel.on("message", (message) => {
		debug(
			`[${channel.name}] ${message.user.ircUsername}: ${message.content}`,
		);
		webContents.send("bancho:cm", {
			channelName: channel.name,
			type: "message",
			username: message.user.ircUsername,
			message: message.content,
			timestamp: new Date(),
		});
	});
	channel.on("JOIN", (member) => {
		debug(
			`[${channel.name}] user ${member.user.ircUsername} joined via IRC`,
		);
		webContents.send("bancho:cm", {
			channelName: channel.name,
			type: "userJoined",
			username: member.user.ircUsername,
			timestamp: new Date(),
		});
	});
	channel.on("PART", (member) => {
		debug(`[${channel.name}] user ${member.user.ircUsername} left via IRC`);
		webContents.send("bancho:cm", {
			channelName: channel.name,
			type: "userLeft",
			username: member.user.ircUsername,
			timestamp: new Date(),
		});
	});
}

/**
 * Registers event listeners specific to a lobby channel.
 */
function registerLobbyEventListeners(
	channel: BanchoJs.BanchoMultiplayerChannel,
) {
	channel.lobby.on("playerJoined", (event) => {
		debug(
			`[${channel.name}] player ${event.player.user.ircUsername} joined in slot ${event.slot}`,
		);
		webContents.send("bancho:cm", {
			channelName: channel.name,
			type: "playerJoined",
			username: event.player.user.ircUsername,
			slot: event.slot,
			timestamp: new Date(),
		});
	});

	channel.lobby.on("playerLeft", (player) => {
		debug(`[${channel.name}] player ${player.user.ircUsername} left`);
		webContents.send("bancho:cm", {
			channelName: channel.name,
			type: "playerLeft",
			username: player.user.ircUsername,
			timestamp: new Date(),
		});
	});

	channel.lobby.on("playerMoved", (event) => {
		debug(
			`[${channel.name}] ${event.player.user.ircUsername} moved to slot ${event.slot}`,
		);
		webContents.send("bancho:cm", {
			channelName: channel.name,
			type: "playerMoved",
			username: event.player.user.ircUsername,
			slot: event.slot,
			timestamp: new Date(),
		});
	});

	channel.lobby.on("playerChangedTeam", (event) => {
		debug(
			`[${channel.name}] ${event.player.user.ircUsername} changed team to ${event.team}`,
		);
		webContents.send("bancho:cm", {
			channelName: channel.name,
			type: "playerChangedTeam",
			username: event.player.user.ircUsername,
			team: event.team,
			timestamp: new Date(),
		});
	});

	channel.lobby.on("beatmapId", (beatmapId) => {
		debug(`[${channel.name}] map changed to ${beatmapId}`);
		webContents.send("bancho:cm", {
			channelName: channel.name,
			type: "beatmapChanged",
			beatmapId: beatmapId,
			timestamp: new Date(),
		});
	});

	channel.lobby.on("host", (player) => {
		debug(`[${channel.name}] host changed to ${player.user.ircUsername}`);
		webContents.send("bancho:cm", {
			channelName: channel.name,
			type: "hostChanged",
			username: player.user.ircUsername,
			timestamp: new Date(),
		});
	});

	channel.lobby.on("hostCleared", () => {
		debug(`[${channel.name}] host cleared`);
		webContents.send("bancho:cm", {
			channelName: channel.name,
			type: "hostCleared",
			timestamp: new Date(),
		});
	});

	channel.lobby.on("matchStarted", () => {
		debug(`[${channel.name}] match started`);
		webContents.send("bancho:cm", {
			channelName: channel.name,
			type: "matchStarted",
			timestamp: new Date(),
		});
	});

	channel.lobby.on("matchFinished", () => {
		debug(`[${channel.name}] match finished`);
		webContents.send("bancho:cm", {
			channelName: channel.name,
			type: "matchFinished",
			timestamp: new Date(),
		});
	});

	channel.lobby.on("matchAborted", () => {
		debug(`[${channel.name}] match aborted`);
		webContents.send("bancho:cm", {
			channelName: channel.name,
			type: "matchAborted",
			timestamp: new Date(),
		});
	});
}
