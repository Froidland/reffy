export type ChannelType = "public" | "private" | "lobby";

export type BaseChannel = {
	type: ChannelType;
	name: string;
};

export type Message = {
	action: "message";
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

export type LobbyAction =
	| {
			action: "join";
			username: string;
			timestamp: Date;
	  }
	| {
			action: "leave";
			username: string;
			timestamp: Date;
	  }
	| {
			action: "teamChange";
			username: string;
			team: "red" | "blue";
			timestamp: Date;
	  }
	| {
			action: "slotChange";
			username: string;
			slot: number;
			timestamp: Date;
	  }
	| {
			action: "mapChange";
			username: string;
			mapId: string;
			timestamp: Date;
	  }
	| {
			action: "hostClear";
			timestamp: Date;
	  }
	| {
			action: "matchStart";
			timestamp: Date;
	  }
	| {
			action: "matchFinish";
			timestamp: Date;
	  }
	| {
			action: "matchAbort";
			timestamp: Date;
	  };

export type ChannelEvent = LobbyAction | Message;

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
