<script lang="ts">
	import { joinSocket } from '$lib/socket';
	import type { User, Move, Point, NewPosEvent } from '$lib/types';
	import { throttle } from '$lib/utils';
	import { onMount } from 'svelte';

	let currentUser = { id: '', color: '' };
	let name = '';
	let users: Record<string, User> = {};
	let pool: Record<string, Move> = {};
	let currentMovePoints: Array<Point> = [];

	let { connect, sendNewPos } = joinSocket();

	function onNewPos(evt: NewPosEvent) {
		if (!(evt.id in users)) {
			users[evt.id] = {
				...evt,
				x: evt.points?.[0].x,
				y: evt.points?.[0].y
			};
		}

		if (!(evt.id in pool)) {
			pool[evt.id] = evt;
		} else {
			pool[evt.id].points.push(...evt.points);
		}
	}

	function processAnimationPool() {
		let poolList = Object.values(pool);

		for (let index = 0; index < poolList.length; index++) {
			const move = poolList[index];
			const movePoint = move.points?.[0];

			if (!movePoint) {
				delete pool[move.id];

				continue;
			}

			users[move.id].x = movePoint.x;
			users[move.id].y = movePoint.y;
			move.points.shift();
		}

		requestAnimationFrame(processAnimationPool);
	}

	function pushNewPosition() {
		if (!currentMovePoints.length) return;

		sendNewPos({
			...currentUser,
			points: currentMovePoints,
			name
		});
		currentMovePoints = [];
	}

	let debouncedSend = throttle(pushNewPosition, 200);

	function handleMousemove(event: MouseEvent) {
		currentMovePoints.push({
			x: Math.round(event.clientX),
			y: Math.round(event.clientY)
		});
		debouncedSend();
	}

	onMount(() => {
		connect({
			onJoin: (data) => {
				currentUser = data;
			},
			onNewPos
		});

		requestAnimationFrame(processAnimationPool);
	});
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="root" on:mousemove={throttle(handleMousemove, 10)}>
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

		& span {
			translate: 0 1.5rem;
			color: #727272;
		}
	}
</style>
