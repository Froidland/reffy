<script lang="ts">
	import PlusIcon from "../components/icons/PlusIcon.svelte";
	import { channels } from "../stores/channels";
	import { clsx } from "clsx";
	import { createDefaultChannel, getChannelTypeFromName } from "../utils";
	import ChatBox from "../components/ChatBox.svelte";

	let newChannelDialog: HTMLDialogElement;
	let newChannelName = "";
	let currentChannelName: string = "";

	$: currentChannel = $channels.get(currentChannelName);

	// TODO: extract these functions to a separate file
	async function handleAddChannel(event: SubmitEvent) {
		newChannelDialog.close();
		newChannelName = "";
		const formData = new FormData(event.target as HTMLFormElement);
		const channelName = formData.get("channelName");

		if (!channelName) {
			return;
		}

		channels.addChannel(createDefaultChannel(channelName.toString()));
		currentChannelName = channelName.toString();

		if (
			["lobby", "public"].includes(
				getChannelTypeFromName(channelName.toString()),
			)
		) {
			await window.api.joinChannel(channelName.toString());
		}
	}
</script>

<dialog
	bind:this={newChannelDialog}
	class="rounded-xl bg-zinc-800 p-8 backdrop:bg-black/50"
>
	<form
		on:submit|preventDefault={handleAddChannel}
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
			bind:value={newChannelName}
		/>
		<div class="flex flex-col gap-2">
			<button
				class="rounded bg-pink-400 px-2 py-2 font-medium transition-colors hover:bg-pink-300"
				type="submit">Add</button
			>
			<button
				class="rounded bg-red-400 px-2 py-2 font-medium transition-colors hover:bg-red-300"
				type="submit">Cancel</button
			>
		</div>
	</form>
</dialog>
<main class="flex h-screen bg-zinc-900">
	<!-- Sidebar -->
	<div class="flex w-64 flex-col bg-zinc-800">
		<div class="flex flex-col px-2 py-4">
			<div class="flex items-center justify-between">
				<h1 class="text-xl font-medium text-white">Chats</h1>
				<button
					on:click={() => newChannelDialog.showModal()}
					class="rounded bg-pink-400 px-1 py-1 text-sm font-medium transition-colors hover:bg-pink-300"
					><PlusIcon /></button
				>
			</div>
			<div class="h-3">
				<!-- TODO: add divider -->
			</div>
			<ul class="flex flex-col">
				{#each $channels as [_, channel]}
					<button
						class={clsx(
							"rounded px-2 py-2 text-left text-white",
							currentChannelName === channel.name
								? "bg-zinc-600"
								: "bg-zinc-800 hover:bg-zinc-700",
						)}
						on:click={() => (currentChannelName = channel.name)}
					>
						{channel.name}
					</button>
				{/each}
			</ul>
		</div>
	</div>
	<!-- /Sidebar -->
	<!-- Main content -->
	<ChatBox channel={currentChannel} />
	<!-- /Main content -->
</main>
