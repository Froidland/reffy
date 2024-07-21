<script lang="ts">
	type Props = {
		message: string;
		onsubmit: (event: SubmitEvent) => void;
	};

	let { message = $bindable(), onsubmit }: Props = $props();
</script>

<form {onsubmit} class="flex gap-2 p-2">
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
