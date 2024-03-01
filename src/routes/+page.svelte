<script lang="ts">
	import type { EventHandler } from 'svelte/elements';
	import Scene from '../components/Scene.svelte';

	let name: string;
	let color: string;

	const handleSubmit: EventHandler<SubmitEvent, HTMLFormElement> = (event) => {
		const data = new FormData(event.currentTarget);
		name = data.get('name') as string;
		color = data.get('color') as string;
	};
</script>

{#if name && color}
	<Scene {name} {color} />
{:else}
	<form action="" on:submit|preventDefault={handleSubmit}>
		<input type="text" name="name" placeholder="Name" required />
		<input type="color" name="color" required />
		<button type="submit">Go</button>
	</form>
{/if}
