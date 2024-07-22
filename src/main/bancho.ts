import BanchoJs from "bancho.js";
import { debug } from "./utils";
import type { WebContents } from "electron";

let bancho: BanchoJs.BanchoClient;
let selfUsername: string;

export function initializeBancho(
	options: BanchoJs.BanchoClientOptions,
	webContents: WebContents, // TODO: maybe don't pass the entire webContents object to this function
) {
	if (bancho) {
		return;
	}

	bancho = new BanchoJs.BanchoClient(options);
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
			action: "message",
			username: message.user.ircUsername,
			message: message.content,
			timestamp: new Date(),
		});
	});
	bancho.on("CM", (message) => {
		debug(
			`[${message.channel.name}] ${message.user.ircUsername}: ${message.content}`,
		);
		webContents.send("bancho:cm", {
			channelName: message.channel.name,
			action: "message",
			username: message.user.ircUsername,
			message: message.content,
			timestamp: new Date(),
		});
	});
	debug("{initializeBancho} registered listeners");
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
		const channel = bancho.getChannel(channelName);
		if (!channel) {
			debug("{leaveChannel} channel not found", channelName);
			return {
				success: false,
				message: "Channel not found",
			};
		}

		await channel.leave();
		debug("{leaveChannel} left channel", channelName);

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
