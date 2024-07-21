<script lang="ts">
	import Login from "./pages/Login.svelte";
	import Home from "./pages/Home.svelte";
	import { router } from "./stores/route.svelte";
</script>

{#if router.value === "login"}
	<Login />
{:else if router.value === "home"}
	<Home />
{/if}
