import { Channel, Socket } from 'phoenix';
import type { NewPosEvent, UndoShapeEvent } from './types';
import type { User } from './user';

const WS_ENDPOINT_URL = 'ws://localhost:4000/socket';

export function joinSocket() {
	let channel: Channel;

	function connect({
		onJoin,
		onNewPos,
		onUndoShape
	}: {
		onJoin: (pos: User & { color: string }) => void;
		onNewPos: (pos: NewPosEvent) => void;
		onUndoShape: (event: UndoShapeEvent) => void;
	}) {
		const socket = new Socket(WS_ENDPOINT_URL);
		socket.connect();

		channel = socket.channel('mouse:lobby', {});

		channel
			.join()
			.receive('ok', (data) => {
				console.log('Joined successfully', data);
				onJoin(data);
			})
			.receive('error', (resp) => {
				console.log('Unable to join', resp);
			});

		// Attach listeners
		channel.on('new_pos', onNewPos);
		channel.on('undo_shape', onUndoShape);
	}

	function sendNewPos(move: NewPosEvent) {
		channel?.push('new_pos', move);
	}

	function sendUndoShape(data: UndoShapeEvent) {
		channel?.push('undo_shape', data);
	}

	return { connect, sendNewPos, sendUndoShape };
}
