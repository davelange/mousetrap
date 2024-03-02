<script lang="ts">
	import type { EventHandler } from 'svelte/elements';
	import Scene from '../components/Scene.svelte';

	let name: string = 'asd';

	const handleSubmit: EventHandler<SubmitEvent, HTMLFormElement> = (event) => {
		const data = new FormData(event.currentTarget);
		name = data.get('name') as string;
	};
</script>

{#if name}
	<Scene {name} />
{:else}
	<form action="" on:submit|preventDefault={handleSubmit}>
		<input type="text" name="name" placeholder="Name" required />
		<button type="submit">Go</button>
	</form>
{/if}
