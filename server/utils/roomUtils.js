// 广播房间数据给所有成员
export const broadcastRoomData = (io, roomId, room) => {
  if (!room) return;
  
  // 计算准备人数
  const readyCount = Object.values(room.players)
    .filter(player => player.isReady && player.position !== null)
    .length;

  // 发送更新后的房间状态
  io.to(roomId).emit('roomUpdate', {
    roomId,
    players: room.players,
    spectators: room.spectators,
    settings: room.settings,
    readyCount,
    owner: room.owner
  });
};

// 更新房主
export const updateRoomOwner = (room) => {
  if (!room) return;
  
  // 找到位置号最小的玩家作为新房主
  const seatedPlayers = Object.values(room.players).filter(p => p.position !== null);
  if (seatedPlayers.length > 0) {
    room.owner = seatedPlayers.reduce((min, p) => 
      p.position < min.position ? p : min
    ).position;
  } else {
    room.owner = null;
  }
  
  // 更新所有玩家的是否房主状态
  Object.values(room.players).forEach(player => {
    player.isOwner = player.position === room.owner;
  });
};