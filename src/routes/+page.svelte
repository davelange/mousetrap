<script lang="ts">
	import { joinSocket } from '$lib/socket';
	import type { User, Move } from '$lib/types';
	import { throttle } from '$lib/utils';
	import { onMount } from 'svelte';

	const sendInterval = 100;
	const moveDuration = 30;

	let currentUser = { id: '', color: '' };
	let name = '';
	let users: Record<string, User> = {};
	let pool: Record<string, Move> = {};

	let { connect, sendNewPos } = joinSocket();

	function onNewPos(evt: User) {
		if (!(evt.id in users)) {
			users[evt.id] = evt;
		} else {
			if (!users[evt.id].name) {
				users[evt.id].name = evt.name;
			}

			pool[evt.id] = {
				step: 0,
				duration: moveDuration,
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
			y: Math.round(event.clientY),
			name
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
<div class="root" on:mousemove={throttle(handleMousemove, sendInterval)}>
	<header class="header">
		<h1>mousetrap</h1>
		<input type="text" placeholder="Your name" bind:value={name} />
	</header>

	{#each Object.values(users) as user}
		<div
			class="item"
			style="left: {user.x}px; top: {user.y}px; background-color: {user.color}"
		>
			<span>{user.name || 'Anonymous'}</span>
		</div>
	{/each}
</div>

<style>
	.root {
		font-family: system-ui, sans-serif;
		height: 100%;
		background-color: #eee;
		display: flex;
	}
	.header {
		margin: auto;
		text-align: center;

		& h1 {
			margin: 0 0 1rem;
			text-align: center;
		}

		& input {
			padding: 4px 8px;
			text-align: center;
		}
	}
	.item {
		display: flex;
		justify-content: center;
		position: absolute;
		width: 20px;
		height: 20px;
		border-radius: 100%;
		font-size: 0.75rem;
		translate: -50%;

		& span {
			translate: 0 1.5rem;
			color: #727272;
		}
	}
</style>
