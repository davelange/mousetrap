<script lang="ts">
	import { Canvas } from '$lib/canvas';
	import { User } from '$lib/user';
	import { joinSocket } from '$lib/socket';
	import type { NewPosEvent, UndoShapeEvent } from '$lib/types';
	import { throttle } from '$lib/utils';
	import { onMount } from 'svelte';

	const SEND_POS_INTERVAL = 200;

	export let name: string;

	let canvasEl: HTMLCanvasElement;
	let canvas: Canvas;
	let userId = '';
	let users: Record<string, User> = {};
	let mouseIsDown = false;
	let currentColor = '#000000';

	$: user = users[userId];

	let { connect, sendNewPos, sendUndoShape } = joinSocket();

	function onNewPos(evt: NewPosEvent) {
		if (evt.id === userId) return;

		if (!(evt.id in users)) {
			users[evt.id] = new User({
				...evt,
				isLocalUser: false
			});
		} else {
			users[evt.id].points.push(...evt.points);
		}
	}

	function onUndoShape(evt: UndoShapeEvent) {
		if (evt.userId === userId) return;

		users[evt.userId].undoShape();
	}

	function processAnimationPool() {
		let list = Object.values(users);

		canvas.clear();

		for (let index = 0; index < list.length; index++) {
			const user = list[index];
			user.handleFrame();
			canvas.render(user);
		}

		requestAnimationFrame(processAnimationPool);
	}

	function pushNewPosition() {
		if (!user.pointsQueue.length) return;

		sendNewPos({
			id: user.id,
			trackerColor: user.trackerColor,
			name: user.name,
			points: user.pointsQueue
		});

		user.pointsQueue = [];
	}

	let debouncedSend = throttle(pushNewPosition, SEND_POS_INTERVAL);

	function handleMousemove(event: MouseEvent) {
		if (user) {
			user?.handleMousemove(event, mouseIsDown, currentColor);
			debouncedSend();
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.code === 'KeyZ' && event.metaKey && !user.isDrawing) {
			user.undoShape();
			sendUndoShape({ userId });
		}
	}

	onMount(() => {
		connect({
			onJoin: (data) => {
				userId = data.id;
				users[userId] = new User({
					id: userId,
					name,
					points: [],
					isLocalUser: true,
					trackerColor: data.color
				});
			},
			onNewPos,
			onUndoShape
		});

		canvas = new Canvas(canvasEl);

		requestAnimationFrame(processAnimationPool);
	});
</script>

<svelte:window
	on:resize={() => canvas.handleResize}
	on:keydown={handleKeyDown}
/>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="root"
	on:mousemove={throttle(handleMousemove, 5)}
	on:mousedown={() => (mouseIsDown = true)}
	on:mouseup={() => (mouseIsDown = false)}
>
	<canvas class="canvas" bind:this={canvasEl}></canvas>

	<div style="position: absolute; z-index: 10">
		<input type="color" bind:value={currentColor} />
	</div>
</div>

<style>
	.root {
		font-family: system-ui, sans-serif;
		height: 100%;
		background-color: #eee;
		display: flex;
	}
	.canvas {
		position: absolute;
		width: 100%;
		height: 100%;
	}
</style>
