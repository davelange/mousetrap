import { Channel, Socket } from 'phoenix';
import type { User, UserId } from './types';

const WS_ENDPOINT_URL = 'ws://localhost:4000/socket';

export function joinSocket() {
	let channel: Channel;

	function connect({
		onJoin,
		onNewPos
	}: {
		onJoin: (pos: UserId) => void;
		onNewPos: (pos: User) => void;
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

		// Attach listener for new_pos event
		channel.on('new_pos', onNewPos);
	}

	function sendNewPos(move: User) {
		channel?.push('new_pos', move);
	}

	return { connect, sendNewPos };
}
