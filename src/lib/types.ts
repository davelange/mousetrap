export type Point = {
	x: number;
	y: number;
};

export type UserId = {
	id: string;
	color: string;
};

export type User = UserId & {
	x: number;
	y: number;
};

export type Move = User & {
	step: number;
	duration: number;
	initialPos: Point;
};
