import Player from '../player/Player.js';
import Room from '../room/Room.js';

export default (socket, io, rooms) => {

	const broadcastUpdate = (roomId) => {
		const room = rooms.get(roomId);
		io.to(roomId).emit('roomUpdate', room?.serialize());
	};

	const enterRoom = (roomId) => {
		if (!rooms.has(roomId)) {
			rooms.set(roomId, new Room(roomId));
		}
		return rooms.get(roomId);
	};

	socket.on('joinRoom', ({ roomId, username }) => {
		// 验证房间ID
		if (typeof roomId !== 'string' || roomId.length > 20) {
			return socket.emit('error', '房间ID无效');
		}

		socket.join(roomId);
		const room = enterRoom(roomId);
		const player = new Player(socket.id, username, 'spectator');

		room.players.set(socket.id, player);
		broadcastUpdate(roomId);

		// 断开连接处理
		socket.on('disconnect', () => {
			room.removePlayer(socket.id);
			broadcastUpdate(roomId);
		});

		socket.on('seatChange', ({ newPosition }) => {
			try {
				const room = rooms.get(roomId);

				if (newPosition === null) { // 离座操作
					room.handleSeatChange(socket.id, null);
				} else if (typeof newPosition === 'number') { // 占座/换座
					room.handleSeatChange(socket.id, newPosition);
				}

				broadcastUpdate(roomId);
			} catch (error) {
				socket.emit('error', error.message);
			}
		});

		socket.on('toggleReady', () => {
			const player = room.players.get(socket.id);
			player?.toggleReady();
			broadcastUpdate(roomId);
		});

		socket.on('updateSettings', (newSettings) => {
			const player = room.players.get(socket.id);
			if (player?.position !== room.owner) {
				return socket.emit('error', '无权限修改设置');
			}
			room.updateSettings(newSettings);
			broadcastUpdate(roomId);
		});

		socket.on('startGame', () => {
			try {
				room.startGame();
				io.to(roomId).emit('gameStarted', room.serialize());
				broadcastUpdate(roomId);
			} catch (error) {
				socket.emit('error', error.message);
			}
		});
	});
};