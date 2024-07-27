<script lang="ts">
	import TextInput from "../components/ui/TextInput.svelte";
	import { config } from "../stores/config.svelte";
	import { router } from "../stores/route.svelte";

	async function handleLogin(event: SubmitEvent) {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);

		const username = formData.get("username");
		const password = formData.get("password");
		const apiKey = formData.get("apiKey");

		if (!username || !password) {
			errorMessage = "Please enter a username and password";
			return;
		}

		loading = true;
		await window.api.initializeBancho({
			username: username.toString(),
			password: password.toString(),
			apiKey: apiKey?.toString() || undefined,
		});

		const res = await window.api.loginBancho();
		if (!res.success) {
			errorMessage = res.message;
			loading = false;
			return;
		}

		config.hasApiKey = Boolean(apiKey);
		errorMessage = undefined;
		loading = false;
		router.set("home");
	}

	let errorMessage: string | undefined;
	let loading = false;
</script>

<!-- TODO: make this prettier lol -->
<main class="flex h-screen items-center justify-center bg-zinc-900">
	<form
		onsubmit={handleLogin}
		class="flex w-80 flex-col gap-4 rounded-lg bg-zinc-800 p-8"
	>
		<h1 class="text-center text-xl font-medium text-white">IRC Login</h1>
		<TextInput
			label="IRC Username"
			placeholder="Username"
			name="username"
			type="text"
		/>
		<TextInput
			label="IRC Password"
			placeholder="Password"
			name="password"
			type="password"
		/>
		<TextInput
			label="API Key"
			placeholder="API Key (optional)"
			name="apiKey"
			type="text"
		/>
		{#if errorMessage}
			<p class="text-red-500">{errorMessage}</p>
		{/if}
		<button
			disabled={loading}
			class="rounded bg-pink-400 px-2 py-2 font-medium transition-colors hover:bg-pink-300 disabled:opacity-50"
			type="submit">Login</button
		>
	</form>
</main>
