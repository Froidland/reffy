<script lang="ts">
	import PlusIcon from "../components/icons/PlusIcon.svelte";
	import { clsx } from "clsx";
	import ChatBox from "../components/ChatBox.svelte";
	import NewChannelDialog from "../components/NewChannelDialog.svelte";
	import CrossIcon from "../components/icons/CrossIcon.svelte";
	import { getChannelTypeFromName } from "../utils";
	import { channels } from "../stores/channels.svelte";
	import type { Channel } from "../types";

	let newChannelDialog: HTMLDialogElement = $state();
	let currentChannelName: string = $state("");

	let currentChannel = $derived<Channel | null>(
		channels.get(currentChannelName) || null,
	);

	async function handleCloseChannel(channelName: string) {
		if (getChannelTypeFromName(channelName) !== "private") {
			window.api.leaveChannel(channelName);
		}

		currentChannelName = "";
		channels.removeChannel(channelName);
	}
</script>

<!--! double binding looks like a bad idea, surely there's a better way, maybe a callback for currentChannelName -->
<NewChannelDialog
	bind:currentChannelName
	bind:dialogElement={newChannelDialog}
/>
<main class="flex h-screen bg-zinc-900">
	<!-- Sidebar -->
	<div class="flex w-64 flex-col bg-zinc-800">
		<div class="flex flex-col px-2 py-4">
			<div class="flex items-center justify-between">
				<h1 class="text-xl font-medium text-white">Chats</h1>
				<button
					onclick={() => newChannelDialog.showModal()}
					class="rounded bg-pink-400 p-1 text-sm transition-colors hover:bg-pink-300"
					><PlusIcon /></button
				>
			</div>
			<div class="h-3">
				<!-- TODO: add divider -->
			</div>
			<ul class="flex flex-col">
				{#each channels.values as [_, channel]}
					<button
						class={clsx(
							"flex items-center justify-between rounded px-2 py-1",
							currentChannelName === channel.name
								? "bg-zinc-600 text-pink-300"
								: "bg-zinc-800  text-white hover:bg-zinc-700",
						)}
						onclick={() => (currentChannelName = channel.name)}
					>
						{channel.name}
						<div class="flex items-center justify-center">
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<div
								role="button"
								tabindex="0"
								class="rounded-full p-2 !text-zinc-400 transition-colors hover:bg-zinc-500 hover:!text-white"
								onclick={() => handleCloseChannel(channel.name)}
							>
								<CrossIcon />
							</div>
						</div>
					</button>
				{/each}
			</ul>
		</div>
	</div>
	<!-- /Sidebar -->
	<!-- TODO: fix when closing a channel, the chat remains -->
	<ChatBox channel={currentChannel} />
</main>
