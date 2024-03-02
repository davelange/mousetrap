import type { NewPosEvent, Point } from './types';

type UserOptions = NewPosEvent & {
	isLocalUser?: boolean;
};

export class User {
	id: string;
	isLocalUser = false;
	name: string;
	x: number;
	y: number;
	points: Array<Point>;
	pointsQueue: Array<Point> = [];
	shapes: Array<{
		points: Array<Point>;
		isClosed: boolean;
	}> = [];
	isDrawing = false;

	constructor(options: UserOptions) {
		this.id = options.id;
		this.name = options.name;
		this.x = options.points?.[0]?.x;
		this.y = options.points?.[0]?.y;
		this.points = options.points;
		this.isLocalUser = options.isLocalUser || false;
	}

	handleMousemove(event: MouseEvent, mouseIsDown: boolean) {
		const point = {
			x: Math.round(event.clientX),
			y: Math.round(event.clientY),
			mouseIsDown
		};

		this.pointsQueue.push(point);
		this.points.push(point);
	}

	getNextPoint() {
		if (!this.points.length) {
			return {
				x: this.x,
				y: this.y,
				mouseIsDown: false
			};
		}

		if (this.isLocalUser) {
			return this.points[this.points.length - 1];
		}

		return this.points[0];
	}

	clearPoint() {
		if (this.points.length > 1) {
			this.points.shift();
		}
	}

	updatePosition() {
		const p = this.getNextPoint();

		this.x = p?.x;
		this.y = p?.y;
	}

	addPointToShape() {
		const point = this.getNextPoint();

		if (!point.mouseIsDown) {
			this.isDrawing = false;
			return;
		}

		const startNewShape = !this.isDrawing;

		if (startNewShape) {
			this.shapes.push({ points: [point], isClosed: false });
			this.isDrawing = true;
		} else {
			this.shapes[this.shapes.length - 1].points.push(point);
		}
	}
}
