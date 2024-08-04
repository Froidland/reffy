export type ChannelType = "public" | "private" | "multiplayer";

export type BaseChannel = {
	type: ChannelType;
	name: string;
};

export type Message = {
	type: "message";
	username: string;
	message: string;
	timestamp: Date;
};

export type PublicChannel = BaseChannel & {
	type: "public";
	history: GenericChannelEvent[];
};

export type PrivateChannel = BaseChannel & {
	type: "private";
	history: GenericChannelEvent[];
};

/**
 * The difference between `UserJoinedEvent` and `PlayerJoinedEvent` is that `UserJoinedEvent` is for when a user joins a channel (IRC's `JOIN` event), while `PlayerJoinedEvent` is for when a player joins a lobby (Bancho's special left event).
 */
export type UserJoinedEvent = {
	type: "userJoined";
	username: string;
	timestamp: Date;
};

/**
 * The difference between `UserLeftEvent` and `PlayerLeftEvent` is that `UserLeftEvent` is for when a user leaves a channel (IRC's `PART` event), while `PlayerLeftEvent` is for when a player leaves a lobby (Bancho's special left event).
 */
export type UserLeftEvent = {
	type: "userLeft";
	username: string;
	timestamp: Date;
};

export type PlayerJoinedEvent = {
	type: "playerJoined";
	username: string;
	slot: number;
	timestamp: Date;
};

export type PlayerLeftEvent = {
	type: "playerLeft";
	username: string;
	timestamp: Date;
};

export type PlayerMovedEvent = {
	type: "playerMoved";
	username: string;
	slot: number;
	timestamp: Date;
};

export type PlayerChangedTeamEvent = {
	type: "teamChange";
	username: string;
	team: "red" | "blue";
	timestamp: Date;
};

export type BeatmapChangedEvent = {
	type: "beatmapChanged";
	beatmapId: number;
	timestamp: Date;
};

export type HostChangedEvent = {
	type: "hostChanged";
	username: string;
	timestamp: Date;
};

export type HostClearedEvent = {
	type: "hostCleared";
	timestamp: Date;
};

export type MatchStartedEvent = {
	type: "matchStarted";
	timestamp: Date;
};

export type MatchFinishedEvent = {
	type: "matchFinished";
	timestamp: Date;
};

export type MatchAbortedEvent = {
	type: "matchAbort";
	timestamp: Date;
};

export type MultiplayerEvent =
	| PlayerJoinedEvent
	| PlayerLeftEvent
	| PlayerMovedEvent
	| PlayerChangedTeamEvent
	| BeatmapChangedEvent
	| HostChangedEvent
	| HostClearedEvent
	| MatchStartedEvent
	| MatchFinishedEvent
	| MatchAbortedEvent;

export type GenericChannelEvent = Message | UserJoinedEvent | UserLeftEvent;

export type ChannelEvent = GenericChannelEvent | MultiplayerEvent;

export type MultiplayerChannel = BaseChannel & {
	type: "multiplayer";
	gamemode: "osu" | "mania" | "taiko" | "fruits";
	teamMode: "headToHead" | "tagCoOp" | "teamVs" | "tagTeamVs";
	size: number;
	mods: string;
	winCondition: "score" | "accuracy" | "combo" | "scorev2";
	players: {
		[username: string]: {
			team: "red" | "blue" | null;
			slot: number;
		};
	};
	history: (GenericChannelEvent | MultiplayerEvent)[];
};

export type Channel = PublicChannel | PrivateChannel | MultiplayerChannel;
