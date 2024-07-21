<script lang="ts">
	import PlusIcon from "../components/icons/PlusIcon.svelte";
	import { channels } from "../stores/channels";
	import { clsx } from "clsx";
	import ChatBox from "../components/ChatBox.svelte";
	import NewChannelDialog from "../components/NewChannelDialog.svelte";

	let newChannelDialog: HTMLDialogElement;
	let currentChannelName: string = "";

	$: currentChannel = $channels.get(currentChannelName);
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
	<ChatBox channel={currentChannel} />
</main>
