<script lang="ts">
	import Login from "./pages/Login.svelte";
	import Home from "./pages/Home.svelte";
	import { route } from "./stores/route";
</script>

{#if $route === "login"}
	<Login />
{:else if $route === "home"}
	<Home />
{/if}
