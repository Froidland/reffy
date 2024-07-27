export type ChannelType = "public" | "private" | "lobby";

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
	history: Message[];
};

export type PrivateChannel = BaseChannel & {
	type: "private";
	history: Message[];
};

export type LobbyEvent =
	| {
			type: "join";
			username: string;
			timestamp: Date;
	  }
	| {
			type: "leave";
			username: string;
			timestamp: Date;
	  }
	| {
			type: "teamChange";
			username: string;
			team: "red" | "blue";
			timestamp: Date;
	  }
	| {
			type: "slotChange";
			username: string;
			slot: number;
			timestamp: Date;
	  }
	| {
			type: "mapChange";
			username: string;
			mapId: string;
			timestamp: Date;
	  }
	| {
			type: "hostClear";
			timestamp: Date;
	  }
	| {
			type: "matchStart";
			timestamp: Date;
	  }
	| {
			type: "matchFinish";
			timestamp: Date;
	  }
	| {
			type: "matchAbort";
			timestamp: Date;
	  };

export type ChannelEvent = LobbyEvent | Message;

export type LobbyChannel = BaseChannel & {
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
	history: ChannelEvent[];
};

export type Channel = PublicChannel | PrivateChannel | LobbyChannel;
