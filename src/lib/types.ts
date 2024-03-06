export type Point = {
	x: number;
	y: number;
	mouseIsDown: boolean;
	color: string;
};

export type Move = {
	points: Array<Point>;
	id: string;
};

export type NewPosEvent = {
	id: string;
	name: string;
	trackerColor: string;
	points: Array<Point>;
};

export type UndoShapeEvent = {
	userId: string;
};
