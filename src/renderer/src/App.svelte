<script lang="ts">
	import Login from "./pages/Login.svelte";
	import Home from "./pages/Home.svelte";
	import { route } from "./stores/route.svelte";
</script>

{#if route.name === "login"}
	<Login />
{:else if route.name === "home"}
	<Home />
{/if}
