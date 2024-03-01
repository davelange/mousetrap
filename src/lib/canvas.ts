import type { User } from './user';

export class Canvas {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.handleResize();
		this.context = canvas.getContext('2d')!;
		this.context.lineWidth = 26;
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

	drawUser(user: User) {
		this.context.fillStyle = user.color;
		this.context.fillRect(user.x, user.y, 10, 10);
	}
	drawPath(user: User) {
		user.shapes.forEach((shape) => {
			if (!shape.points.length) return;

			this.context.beginPath();
			this.context.moveTo(shape.points[0].x, shape.points[0].y);

			shape.points.forEach((point) => this.context.lineTo(point.x, point.y));

			this.context.stroke();
		});
	}
}
