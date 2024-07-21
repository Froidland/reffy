<script lang="ts">
	import { router } from "../stores/route.svelte";

	async function handleLogin(event: SubmitEvent) {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);

		const username = formData.get("username");
		const password = formData.get("password");

		if (!username || !password) {
			errorMessage = "Please enter a username and password";
			return;
		}

		loading = true;
		window.api.initializeBancho({
			username: username.toString(),
			password: password.toString(),
		});

		const res = await window.api.loginBancho();
		if (!res.success) {
			errorMessage = res.message;
			loading = false;
			return;
		}

		errorMessage = undefined;
		loading = false;
		router.set("home");
	}

	let errorMessage: string | undefined;
	let loading = false;
</script>

<main class="flex h-screen items-center justify-center bg-zinc-900">
	<form
		onsubmit={handleLogin}
		class="flex w-80 flex-col gap-4 rounded-lg bg-zinc-800 p-8"
	>
		<h1 class="text-center text-xl font-medium text-white">IRC Login</h1>
		<input
			class="rounded bg-zinc-700 px-2 py-2 text-white"
			type="text"
			name="username"
			placeholder="Username"
		/>
		<input
			class="rounded bg-zinc-700 px-2 py-2 text-white"
			type="password"
			name="password"
			placeholder="Password"
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
