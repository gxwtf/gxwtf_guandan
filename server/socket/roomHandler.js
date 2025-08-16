import RoomManager from '../room/roomManager.js';
import Player from '../player/Player.js';

export default (socket, io) => {

    const roomManager = RoomManager.instance || new RoomManager(io);
	socket.on('joinRoom', ({ roomId, username = `用户${Math.random().toString(36).substring(2, 7)}` }) => {
		// 验证房间ID格式
		if (typeof roomId !== 'string' || roomId.length > 20) {
			return socket.emit('error', '房间ID无效');
		}

		socket.join(roomId);
		
		const room = roomManager.enterRoom(roomId);
		const player = new Player(socket.id, username, 'spectator');

		room.players.set(socket.id, player);
		
		roomManager.broadcastUpdate(roomId);

		// 在disconnect
		socket.on('disconnect', () => {
			roomManager.removePlayerFromRoom(roomId, socket.id);
			if (player.position !== null) {
				roomManager.updateRoomOwner(room);
			}
			roomManager.broadcastUpdate(roomId);
		});

		socket.on('takeSeat', ({ position }) => {
			try {
				const room = roomManager.getRoom(roomId);
				room.handleTakeSeat(socket.id, position);
				roomManager.broadcastUpdate(roomId);
			} catch (error) {
				socket.emit('error', error.message);
			}
		});

		socket.on('leaveSeat', () => {
			const room = roomManager.getRoom(roomId);
			room.handleLeaveSeat(socket.id);
			roomManager.broadcastUpdate(roomId);
		});

		socket.on('toggleReady', () => {
			const player = room.getPlayer(socket.id);
			player.toggleReady();
			roomManager.broadcastUpdate(roomId);
		});

		// 修复条件判断逻辑
		socket.on('updateSettings', (newSettings) => {
		    const player = room.getPlayer(socket.id);
		    // 修正权限判断：只有房主可以修改设置
		    if (player?.position !== room.owner) {
		        return socket.emit('error', '无权限修改设置');
		    }
		    room.updateSettings(newSettings);
		    roomManager.broadcastUpdate(roomId);
		});

		socket.on('startGame', () => {
			try {
				const room = roomManager.getRoom(roomId);
				room.startGame();
				roomManager.broadcastUpdate(io, roomId);
				io.to(roomId).emit('gameStarted', room.serialize());
			} catch (error) {
				socket.emit('error', error.message);
			}
		});
	});
};
