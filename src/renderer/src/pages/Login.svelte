<script lang="ts">
	import { route } from "../stores/route";

	async function handleLogin(event: SubmitEvent) {
		const formData = new FormData(event.target as HTMLFormElement);

		const username = formData.get("username");
		const password = formData.get("password");

		if (!username || !password) {
			errorMessage = "Please enter a username and password";
			return;
		}

		window.api.initializeBancho({
			username: username.toString(),
			password: password.toString(),
		});

		const res = await window.api.loginBancho();
		if (!res.success) {
			errorMessage = res.message;
			return;
		}

		errorMessage = undefined;
		route.set("home");
	}

	let errorMessage: string | undefined;
</script>

<main class="flex h-screen items-center justify-center bg-slate-600">
	<form on:submit|preventDefault={handleLogin} class="flex flex-col gap-4">
		<input type="text" name="username" placeholder="Username" />
		<input type="password" name="password" placeholder="Password" />
		{#if errorMessage}
			<p class="text-red-500">{errorMessage}</p>
		{/if}
		<button type="submit">Submit</button>
	</form>
</main>
