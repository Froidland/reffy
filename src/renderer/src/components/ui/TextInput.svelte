<script lang="ts">
	import { generateId } from "../../utils";

	const id = generateId();

	type Props = {
		label?: string;
		name?: string;
		type?: "text" | "password" | "email" | "url";
		placeholder?: string;
		disabled?: boolean;
		minlength?: number;
		maxlength?: number;
		value?: string;
	};

	let {
		label,
		name,
		type,
		placeholder,
		disabled,
		minlength,
		maxlength,
		value = $bindable(),
	}: Props = $props();
</script>

<div class="flex flex-col gap-[2px] text-zinc-200">
	{#if label}
		<label for={id}>{label}</label>
	{/if}
	<input
		class="rounded bg-zinc-700 px-2 py-2 text-white"
		{id}
		{type}
		{name}
		{placeholder}
		{disabled}
		{minlength}
		{maxlength}
		bind:value
	/>
</div>
