import type { Point } from './types';
import type { User } from './user';

export class Canvas {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.handleResize();
		this.context = canvas.getContext('2d')!;
		this.context.lineJoin = 'round';
		this.context.lineCap = 'round';
	}

	clear() {
		this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
	}

	handleResize() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}

	renderUser(user: User) {
		this.context.lineWidth = 2;
		this.context.strokeStyle = '#333'; // user.color;
		this.context.beginPath();
		this.context.ellipse(user.x, user.y, 10, 10, 0, 0, 2 * Math.PI);
		this.context.stroke();
	}

	renderUserShapes(user: User) {
		this.context.strokeStyle = '#333'; //user.color;
		this.context.lineWidth = 16;

		user.shapes.forEach((shape) => {
			if (!shape.points.length) return;

			this.context.moveTo(shape.points[0].x, shape.points[0].y);
			this.context.beginPath();

			shape.points.forEach((point) => this.context.lineTo(point.x, point.y));

			this.context.stroke();
		});
	}

	render(user: User) {
		this.renderUser(user);
		this.renderUserShapes(user);
	}
}
