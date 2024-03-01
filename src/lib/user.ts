import type { NewPosEvent, Point } from './types';

export class User {
	id: string;
	color: string;
	name: string;
	x: number;
	y: number;
	points: Array<Point>;
	shapes: {
		points: Array<Point>;
		isClosed: boolean;
	}[] = [];
	isDrawing = false;

	constructor(event: NewPosEvent) {
		this.id = event.id;
		this.color = event.color;
		this.name = event.name;
		this.x = event.points?.[0].x;
		this.y = event.points?.[0].y;
		this.points = event.points;
		this.shapes = [];
	}

	nextPoint() {
		return this.points?.[0];
	}

	addNewPoints(points: Point[]) {
		this.points.push(...points);
	}

	updatePos(point: Point) {
		this.x = point.x;
		this.y = point.y;
	}

	addPathPoint(point: Point) {
		if (!point.mouseIsDown) {
			this.isDrawing = false;
			return;
		}

		if (this.isDrawing) {
			this.shapes[this.shapes.length - 1].points.push(point);
		} else {
			this.shapes.push({ points: [point], isClosed: false });
			this.isDrawing = true;
		}
	}
}
