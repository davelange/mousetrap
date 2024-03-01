<script lang="ts">
	import { Canvas } from '$lib/canvas';
	import { User } from '$lib/user';
	import { joinSocket } from '$lib/socket';
	import type { NewPosEvent } from '$lib/types';
	import { throttle } from '$lib/utils';
	import { onMount } from 'svelte';

	export let name: string;
	export let color: string;

	let canvasEl: HTMLCanvasElement;
	let canvas: Canvas;

	let userId = '';
	let users: Record<string, User> = {};
	let mouseIsDown = false;

	$: user = users[userId];

	let { connect, sendNewPos } = joinSocket();

	function onNewPos(evt: NewPosEvent) {
		if (evt.id === userId) return;

		if (!(evt.id in users)) {
			users[evt.id] = new User(evt);
		} else {
			users[evt.id].addNewPoints(evt.points);
		}
	}

	function render() {
		canvas.clear();

		Object.values(users).forEach((user) => {
			canvas.renderUser(user);
			canvas.renderUserShapes(user);
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

		render();

		requestAnimationFrame(processAnimationPool);
	}

	function pushNewPosition() {
		if (!user.currentMoveBatch.length) return;

		sendNewPos({
			...user,
			points: user.currentMoveBatch
		});
		user.currentMoveBatch = [];
	}

	let debouncedSend = throttle(pushNewPosition, 200);

	function handleMousemove(event: MouseEvent) {
		if (user) {
			user.handleMousemove(event, mouseIsDown);
			debouncedSend();
		}
	}

	onMount(() => {
		connect({
			onJoin: (data) => {
				userId = data.id;
				users[userId] = new User({
					id: userId,
					name,
					color,
					points: []
				});
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
	}
</style>
