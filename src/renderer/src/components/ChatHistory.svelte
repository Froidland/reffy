<script lang="ts">
	import { afterUpdate } from "svelte";
	import { getChannelTypeFromName, type Channel } from "../stores/channels";
	import ChatEvent from "./ChatEvent.svelte";

	export let channel: Channel | null;

	let messageListElement: HTMLElement;
	let message = "";

	afterUpdate(() => {
		if (messageListElement) {
			messageListElement.scroll({
				top: messageListElement.scrollHeight,
				behavior: "smooth",
			});
		}
	});

	async function handleSendMessage(event: SubmitEvent) {
		const formData = new FormData(event.target as HTMLFormElement);
		const formMessage = formData.get("message");

		if (!formMessage) {
			return;
		}

		if (
			["lobby", "public"].includes(getChannelTypeFromName(channel.name))
		) {
			const res = await window.api.sendChannelMessage(
				channel.name,
				formMessage.toString(),
			);

			if (!res.success) {
				// TODO: show error
				return;
			}

			message = "";
			return;
		}

		const res = await window.api.sendPrivateMessage(
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
			bind:this={messageListElement}
		>
			{#each channel.history as event}
				<ChatEvent {event} />
			{/each}
		</ul>
		<!-- /Messages -->
		<!-- Message input -->
		<div class="flex flex-col gap-4 p-2">
			<form
				on:submit|preventDefault={handleSendMessage}
				class="flex gap-2"
			>
				<input
					class="w-full rounded bg-zinc-700 px-2 py-2 text-white"
					type="text"
					name="message"
					placeholder="Message"
					bind:value={message}
				/>
				<button
					class="rounded bg-pink-400 px-2 py-2 font-medium transition-colors hover:bg-pink-300"
					type="submit">Send</button
				>
			</form>
		</div>
		<!-- /Message input -->
	{/if}
</div>
