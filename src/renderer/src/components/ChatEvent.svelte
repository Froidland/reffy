<script lang="ts">
	import type { ChannelEvent } from "../types";
	import { getFormattedTimestamp } from "../utils";

	type Props = {
		event: ChannelEvent;
	};

	let { event }: Props = $props();
</script>

<!-- TODO: implement logic and design for all channel events -->
{#if event.action === "message"}
	<li class="flex gap-2">
		<div>
			<span class="text-zinc-300"
				>[{getFormattedTimestamp(event.timestamp)}]
			</span>
			<span class="font-bold text-[#f9c160]"
				>{event.username}: {" "}
			</span><span class="break-all text-white">{event.message}</span>
		</div>
	</li>
{/if}
