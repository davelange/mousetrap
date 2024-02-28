<script lang="ts">
	import { joinSocket } from '$lib/socket';
	import type { User, Move } from '$lib/types';
	import { throttle } from '$lib/utils';
	import { onMount } from 'svelte';

	let currentUser = { id: '', color: '' };
	let users: Record<string, User> = {};
	let pool: Record<string, Move> = {};

	let { connect, sendNewPos } = joinSocket();

	function onNewPos(evt: User) {
		if (evt.id === currentUser.id) {
			return;
		} else if (!(evt.id in users)) {
			users[evt.id] = evt;
		} else {
			pool[evt.id] = {
				step: 0,
				duration: 30,
				initialPos: {
					x: users[evt.id].x,
					y: users[evt.id].y
				},
				...evt
			};
		}
	}

	function makeSomeMoves() {
		let poolList = Object.values(pool);

		for (let index = 0; index < poolList.length; index++) {
			const move = poolList[index];

			if (move.step === move.duration) {
				delete pool[move.id];

				continue;
			}

			users[move.id].x += Math.round(
				(move.x - move.initialPos.x) / move.duration
			);
			users[move.id].y += Math.round(
				(move.y - move.initialPos.y) / move.duration
			);
			move.step++;
		}

		requestAnimationFrame(makeSomeMoves);
	}

	function handleMousemove(event: MouseEvent) {
		sendNewPos({
			...currentUser,
			x: Math.round(event.clientX),
			y: Math.round(event.clientY)
		});
	}

	onMount(() => {
		connect({
			onJoin: (data) => {
				currentUser = data;
			},
			onNewPos
		});
		requestAnimationFrame(makeSomeMoves);
	});
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="root" on:mousemove={throttle(handleMousemove, 100)}>
	<h1>mousetrap</h1>
	{#each Object.values(users) as user}
		<div
			class="item"
			style="left: {user.x}px; top: {user.y}px; background-color: {user.color}"
		></div>
	{/each}
</div>

<style>
	.root {
		font-family: system-ui, sans-serif;
		height: 100%;
		background-color: #eee;
	}
	h1 {
		margin: 0;
		text-align: center;
	}
	.item {
		position: absolute;
		width: 20px;
		height: 20px;
		border-radius: 100%;
		font-size: 0.75rem;
	}
</style>
