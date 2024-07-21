<script lang="ts">
	import { channels } from "../stores/channels";
	import { createDefaultChannel, getChannelTypeFromName } from "../utils";

	type Props = {
		currentChannelName: string;
		dialogElement: HTMLDialogElement;
	};

	let {
		currentChannelName = $bindable(),
		dialogElement = $bindable(),
	}: Props = $props();

	let internalDialogElement: HTMLDialogElement = $state();
	let loading = $state(false);
	let channelName = $state("");

	async function handleAddChannel(event: SubmitEvent) {
		event.preventDefault();
		loading = true;
		const formData = new FormData(event.target as HTMLFormElement);
		const channelNameValue = formData.get("channelName");

		if (!channelNameValue) {
			return;
		}

		if (
			["lobby", "public"].includes(
				getChannelTypeFromName(channelName.toString()),
			)
		) {
			await window.api.joinChannel(channelName.toString());
		}

		channels.addChannel(createDefaultChannel(channelNameValue.toString()));
		currentChannelName = channelNameValue.toString();
		loading = false;
		channelName = "";
		internalDialogElement.close();
	}
</script>

<dialog
	bind:this={internalDialogElement}
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
				disabled={loading}
				type="submit">Add</button
			>
			<button
				class="rounded bg-red-400 px-2 py-2 font-medium transition-colors hover:bg-red-300"
				type="submit">Cancel</button
			>
		</div>
	</form>
</dialog>
