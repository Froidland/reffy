<script lang="ts">
	import ChatEvent from "./ChatEvent.svelte";
	import type { Channel } from "../types";
	import ChatMessageForm from "./ChatMessageForm.svelte";
	import { tick } from "svelte";
	import EnterIcon from "./icons/EnterIcon.svelte";
	import PlusIcon from "./icons/PlusIcon.svelte";
	import { openNewChannelDialog } from "../components/NewChannelDialog.svelte";
	import { config } from "../stores/config.svelte";

	type Props = {
		channel: Channel | null;
	};

	let { channel = null }: Props = $props();

	let eventListElement: HTMLUListElement = $state();
	let message = $state("");

	// TODO: if the channel is changed, scroll to bottom with no smooth scroll
	$effect.pre(() => {
		if (!eventListElement || !channel) {
			return;
		}
		channel.history.length;

		if (
			eventListElement.offsetHeight + eventListElement.scrollTop >
			eventListElement.scrollHeight - 20
		) {
			tick().then(() => {
				eventListElement.scroll({
					top: eventListElement.scrollHeight,
					behavior: "smooth",
				});
			});
		}
	});

	async function handleSendMessage(event: SubmitEvent) {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);
		const formMessage = formData.get("message");

		if (!formMessage) {
			return;
		}

		const res = await window.api.sendMessage(
			channel.name,
			formMessage.toString(),
		);

		if (!res.success) {
			// TODO: show error
			return;
		}

		message = "";
	}
</script>

<div class="flex w-full flex-col justify-between">
	{#if channel}
		<h1 class="p-2 text-xl font-medium text-white">
			{channel.name}
		</h1>
		<!-- Messages -->
		<!-- TODO: change scrollbar style -->
		<ul
			class="flex h-full flex-col gap-2 overflow-auto px-2 pb-2"
			bind:this={eventListElement}
		>
			{#each channel.history as event}
				<ChatEvent {event} />
			{/each}
		</ul>
		<!-- /Messages -->
		<ChatMessageForm bind:message onsubmit={handleSendMessage} />
	{:else}
		<div class="flex h-full w-full items-center justify-center">
			<div class="flex flex-col gap-2">
				<p class="italic text-zinc-600">No channel selected</p>
				<button
					class="flex items-center justify-center gap-2 rounded bg-pink-400 px-2 py-2 font-medium text-black transition-colors hover:bg-pink-300"
					onclick={() => openNewChannelDialog()}
					><EnterIcon height="18px" width="18px" /> Join a channel</button
				>
				<!-- TODO: implement lobby creation with bancho.js methods -->
				<button
					class="flex items-center justify-center gap-2 rounded bg-green-400 px-2 py-2 font-medium text-black transition-colors hover:bg-green-300 disabled:opacity-50"
					disabled={!config.hasApiKey}
				>
					<PlusIcon height="18px" width="18px" /> Create a lobby</button
				>
			</div>
		</div>
	{/if}
</div>
