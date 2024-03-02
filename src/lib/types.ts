export type Point = {
	x: number;
	y: number;
	mouseIsDown: boolean;
};

export type Move = {
	points: Array<Point>;
	id: string;
};

export type NewPosEvent = {
	id: string;
	name: string;
	points: Array<Point>;
};
