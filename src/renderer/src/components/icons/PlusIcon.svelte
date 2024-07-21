<script lang="ts">
	import type { SVGAttributes } from "svelte/elements";

	let {
		width = "1em",
		height = "1em",
		viewBox = "0 0 24 24",
		...props
	}: SVGAttributes<SVGElement> = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" {width} {height} {viewBox} {...props}
	><path fill="currentColor" d="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z" /></svg
>
