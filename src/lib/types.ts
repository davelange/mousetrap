export type Point = {
	x: number;
	y: number;
};

export type User = Point & {
	id: string;
	color: string;
	name: string;
};

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
