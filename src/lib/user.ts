import type { NewPosEvent, Point } from './types';

type UserOptions = NewPosEvent & {
	isLocalUser?: boolean;
};

type Shape = {
	points: Array<Point>;
	isClosed: boolean;
	color: string;
};

const CHUNK_POINTS_THRESHOLD = 3;

export class User {
	id: string;
	isLocalUser = false;
	name: string;
	trackerColor: string = '';
	x: number;
	y: number;
	points: Array<Point>;
	pointsQueue: Array<Point> = [];
	shapes: Array<Shape> = [];
	isDrawing = false;

	constructor(options: UserOptions) {
		this.id = options.id;
		this.name = options.name;
		this.x = options.points?.[0]?.x;
		this.y = options.points?.[0]?.y;
		this.points = options.points;
		this.trackerColor = options.trackerColor;
		this.isLocalUser = options.isLocalUser || false;
	}

	handleMousemove(event: MouseEvent, mouseIsDown: boolean, color: string) {
		const point = {
			x: Math.round(event.clientX),
			y: Math.round(event.clientY),
			mouseIsDown,
			color
		};

		this.pointsQueue.push(point);
		this.points.push(point);
	}

	getNextPoints() {
		if (!this.points.length) {
			return [];
		}

		if (this.isLocalUser) {
			return [this.points[this.points.length - 1]];
		}

		if (this.points.length > CHUNK_POINTS_THRESHOLD) {
			const safeChunkLastIdx = this.points
				.slice(0, CHUNK_POINTS_THRESHOLD)
				.findIndex(
					(item, _idx, arr) => item.mouseIsDown !== arr[0].mouseIsDown
				);

			return this.points.slice(
				0,
				safeChunkLastIdx === -1 ? CHUNK_POINTS_THRESHOLD : safeChunkLastIdx
			);
		}

		return [this.points[0]];
	}

	clearPoints(count: number) {
		if (this.points.length === 1) {
			return;
		}

		this.points.splice(0, count);
	}

	updateTrackerPosition(point: Point) {
		if (point) {
			this.x = point.x;
			this.y = point.y;
		}
	}

	addPointToShape(points: Point[]) {
		if (!points.length) {
			return [];
		}

		if (!points[0].mouseIsDown) {
			this.isDrawing = false;
			return;
		}

		const startNewShape = !this.isDrawing;

		if (startNewShape) {
			this.shapes.push({
				points: points,
				isClosed: false,
				color: points[0].color
			});
			this.isDrawing = true;
		} else {
			this.shapes[this.shapes.length - 1].points.push(...points);
		}
	}

	handleFrame() {
		const points = this.getNextPoints();

		this.updateTrackerPosition(points[0]);
		this.addPointToShape(points);
		this.clearPoints(points.length);
	}

	undoShape() {
		this.shapes.splice(this.shapes.length - 1, 1);
	}
}
