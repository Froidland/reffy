<script lang="ts">
	import type { ChannelEvent } from "../types";
	import { getFormattedTimestamp } from "../utils";

	type Props = {
		event: ChannelEvent;
	};

	let { event }: Props = $props();
</script>

<!-- TODO: implement logic and design for all channel events -->
{#if event.type === "message"}
	<li class="flex gap-2">
		<p class="[overflow-wrap:anywhere]">
			<span class="text-zinc-300"
				>[{getFormattedTimestamp(event.timestamp)}]
			</span>
			<span class="font-bold text-[#f9c160]"
				><a
					href="https://osu.ppy.sh/users/{event.username}"
					target="_blank">{event.username}</a
				>: {" "}
			</span><span class="text-white">{event.message}</span>
		</p>
	</li>
{/if}
