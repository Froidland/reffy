<script lang="ts">
	import { Checkbox, Label } from "bits-ui";
	import CheckIcon from "../icons/CheckIcon.svelte";
	import { generateId } from "../../utils";

	type Props = {
		label: string;
		value?: boolean;
		name?: string;
	};

	let { label, value = $bindable(false), name }: Props = $props();

	const checkboxId = generateId();
	const labelId = generateId();
</script>

<div class="flex gap-2">
	<Checkbox.Root
		bind:checked={value}
		id={checkboxId}
		aria-labelledby={labelId}
		{name}
	>
		<Checkbox.Indicator class="rounded border p-[1px] text-white">
			{#if value}
				<CheckIcon />
			{:else}
				<div class="h-[1em] w-[1em]"></div>
			{/if}
		</Checkbox.Indicator>
	</Checkbox.Root>
	<Label.Root class="text-white" id={labelId} for={checkboxId}
		>{label}</Label.Root
	>
</div>
