<script lang="ts">
	import ChatEvent from "./ChatEvent.svelte";
	import type { Channel } from "../types";
	import ChatMessageForm from "./ChatMessageForm.svelte";
	import { tick } from "svelte";

	type Props = {
		channel: Channel;
	};

	let { channel = null }: Props = $props();

	let eventListElement: HTMLUListElement = $state();
	let message = $state("");

	// TODO: add ability to disable scroll to bottom (or manually activate it)
	// TODO: if the channel is changed, scroll to bottom with no smooth scroll
	$effect.pre(() => {
		if (!eventListElement) {
			return;
		}
		channel.history;

		tick().then(() => {
			eventListElement.scroll({
				top: eventListElement.scrollHeight,
				behavior: "smooth",
			});
		});
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
	{/if}
</div>
