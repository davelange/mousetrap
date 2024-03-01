export type Point = {
	x: number;
	y: number;
	mouseIsDown: boolean;
};

/* export type User = {
	id: string;
	color: string;
	name: string;
	x: number;
	y: number;
	points: Array<Point>;
	shapes: Array<Point>[];
}; */

export type Move = {
	points: Array<Point>;
	id: string;
};

export type NewPosEvent = {
	id: string;
	color: string;
	name: string;
	points: Array<Point>;
};
