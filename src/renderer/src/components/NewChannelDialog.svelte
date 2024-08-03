<script lang="ts" context="module">
	import { channels } from "../stores/channels.svelte";
	import { config } from "../stores/config.svelte";
	import { createDefaultChannel, getChannelTypeFromName } from "../utils";

	let dialogElement: HTMLDialogElement | undefined = $state();
	let loading = $state(false);
	let channelName = $state("");

	export function openNewChannelDialog() {
		if (!dialogElement) {
			return;
		}

		dialogElement.showModal();
	}

	async function handleAddChannel(event: SubmitEvent) {
		event.preventDefault();
		loading = true;
		const formData = new FormData(event.target as HTMLFormElement);
		const channelNameValue = formData.get("channelName");

		if (!channelNameValue) {
			loading = false;
			return;
		}

		if (
			["lobby", "public"].includes(
				getChannelTypeFromName(channelName.toString()),
			)
		) {
			const res = await window.api.joinChannel(channelName.toString());

			if (!res.success) {
				// TODO: show error
				loading = false;
				return;
			}
		}

		channels.addChannel(createDefaultChannel(channelNameValue.toString()));
		config.activeChannelName = channelNameValue.toString();
		loading = false;
		channelName = "";
		dialogElement?.close();
	}
</script>

<dialog
	bind:this={dialogElement}
	class="rounded-xl bg-zinc-800 p-8 backdrop:bg-black/50"
>
	<form
		onsubmit={handleAddChannel}
		method="dialog"
		class="flex flex-col gap-4"
	>
		<label class="text-white" for="channelName"
			>Player or channel name</label
		>
		<input
			id="channelName"
			class="w-full rounded bg-zinc-700 px-2 py-2 text-white"
			type="text"
			name="channelName"
			placeholder="Channel name"
			bind:value={channelName}
		/>
		<div class="flex flex-col gap-2">
			<button
				class="rounded bg-pink-400 px-2 py-2 font-medium transition-colors hover:bg-pink-300 disabled:opacity-50"
				disabled={loading || !channelName}
				type="submit">Add</button
			>
			<button
				class="rounded bg-red-400 px-2 py-2 font-medium transition-colors hover:bg-red-300"
				type="button"
				onclick={() => dialogElement?.close()}>Cancel</button
			>
		</div>
	</form>
</dialog>
