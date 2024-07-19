<script lang="ts">
	import PlusIcon from "../components/icons/PlusIcon.svelte";
	import {
		channels,
		currentChannel,
		setCurrentChannel,
		addChannel,
	} from "../stores/channels";
	import { afterUpdate } from "svelte";

	$: arrayChannels = Object.entries($channels);
	$: currentChannelMessages = $currentChannel?.history;

	let message = "";
	let newChannelDialog: HTMLDialogElement;
	let newChannelName = "";
	let messageListElement: HTMLElement;

	function openNewChannelDialog() {
		newChannelDialog.showModal();
	}

	// TODO: add ability to disable scroll to bottom (or manually activate it)
	// TODO: if the channel is changed, scroll to bottom with no smooth scroll
	afterUpdate(() => {
		if (messageListElement) {
			messageListElement.scroll({
				top: messageListElement.scrollHeight,
				behavior: "smooth",
			});
		}
	});

	// TODO: extract these functions to a separate file
	async function handleAddChannel(event: SubmitEvent) {
		newChannelDialog.close();
		newChannelName = "";
		const formData = new FormData(event.target as HTMLFormElement);
		const channelName = formData.get("channelName");

		if (!channelName) {
			return;
		}

		if ($channels[channelName.toString()]) {
			return;
		}

		if (channelName.toString().at(0) === "#") {
			if (channelName.toString().startsWith("#mp_")) {
				addChannel({
					type: "lobby",
					name: channelName.toString(),
					gamemode: "osu",
					teamMode: "headToHead",
					size: 0,
					mods: "",
					winCondition: "score",
					players: [],
					history: [],
				});
				await window.api.joinChannel(channelName.toString());

				return;
			}

			addChannel({
				type: "public",
				name: channelName.toString(),
				history: [],
			});
			await window.api.joinChannel(channelName.toString());
		} else {
			addChannel({
				type: "private",
				name: channelName.toString(),
				history: [],
			});
		}
	}

	async function handleSendMessage(event: SubmitEvent) {
		const formData = new FormData(event.target as HTMLFormElement);
		const formMessage = formData.get("message");

		if (!formMessage) {
			return;
		}

		if ($currentChannel.type !== "private") {
			const res = await window.api.sendChannelMessage(
				$currentChannel.name,
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
			$currentChannel.name,
			formMessage.toString(),
		);

		if (!res.success) {
			// TODO: show error
			return;
		}

		message = "";
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
		<div class="flex flex-col p-4">
			<div class="flex items-center justify-between">
				<h1 class="text-xl font-medium text-white">Chats</h1>
				<button
					on:click={openNewChannelDialog}
					class="rounded bg-pink-400 px-1 py-1 text-sm font-medium transition-colors hover:bg-pink-300"
					><PlusIcon /></button
				>
			</div>
			<div class="h-5">
				<!-- TODO: add divider -->
			</div>
			<ul class="flex flex-col gap-2">
				{#each arrayChannels as channel}
					<li class="flex items-center gap-2">
						<div class="flex-1">
							<span class="text-white">{channel[1].name}</span>
						</div>
						<div class="flex-none">
							<button
								on:click={() =>
									setCurrentChannel(channel[1].name)}
								class="rounded bg-pink-400 px-2 py-1 text-sm font-medium transition-colors hover:bg-pink-300"
								>View</button
							>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	</div>
	<!-- /Sidebar -->
	<!-- Main content -->
	<div class="flex w-full flex-col justify-between">
		{#if $currentChannel}
			<h1 class="p-2 text-xl font-medium text-white">
				{$currentChannel.name}
			</h1>
			<!-- Messages -->
			<!-- TODO: change scrollbar style -->
			<ul
				class="flex h-full flex-col gap-2 overflow-auto px-2 pb-2"
				bind:this={messageListElement}
			>
				{#each currentChannelMessages as message}
					{#if message.action === "message"}
						<li class="flex gap-2">
							<div>
								<span class="text-zinc-300"
									>[{message.timestamp
										.getHours()
										.toString()
										.padStart(2, "0")}:{message.timestamp
										.getMinutes()
										.toString()
										.padStart(2, "0")}:{message.timestamp
										.getSeconds()
										.toString()
										.padStart(2, "0")}]
								</span>
								<span class="font-bold text-[#f9c160]"
									>{message.username}: {" "}
								</span><span class="text-white"
									>{message.message}</span
								>
							</div>
						</li>
					{/if}
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
	<!-- /Main content -->
</main>
