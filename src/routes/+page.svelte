<script lang="ts">
	import { Canvas } from '$lib/canvas';
	import { User } from '$lib/user';
	import { joinSocket } from '$lib/socket';
	import type { Point, NewPosEvent } from '$lib/types';
	import { throttle } from '$lib/utils';
	import { onMount } from 'svelte';

	let canvasEl: HTMLCanvasElement;
	let canvas: Canvas;
	let currentUser = { id: '', color: '' };
	let name = '';
	let users: Record<string, User> = {};

	let currentMovePoints: Array<Point> = [];
	let mouseIsDown = false;

	let { connect, sendNewPos } = joinSocket();

	function onNewPos(evt: NewPosEvent) {
		if (!(evt.id in users)) {
			users[evt.id] = new User(evt);
		} else {
			users[evt.id].addNewPoints(evt.points);
		}
	}

	function drawUsers() {
		canvas.clear();

		let list = Object.values(users);

		list.forEach((user) => {
			canvas.drawUser(user);
			canvas.drawPath(user);
		});
	}

	function processAnimationPool() {
		let list = Object.values(users);

		for (let index = 0; index < list.length; index++) {
			const user = list[index];
			const movePoint = user.nextPoint();

			if (!movePoint) {
				continue;
			}

			user.updatePos(movePoint);
			user.addPathPoint(movePoint);
			user.points.shift();
		}

		drawUsers();

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
			y: Math.round(event.clientY),
			mouseIsDown
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

		canvas = new Canvas(canvasEl);

		requestAnimationFrame(processAnimationPool);
	});
</script>

<svelte:window on:resize={() => canvas.handleResize} />
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="root"
	on:mousemove={throttle(handleMousemove, 10)}
	on:mousedown={() => (mouseIsDown = true)}
	on:mouseup={() => (mouseIsDown = false)}
>
	<canvas class="canvas" bind:this={canvasEl}></canvas>
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
		border: 1px solid red;
	}
</style>
