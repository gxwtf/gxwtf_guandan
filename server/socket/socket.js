// server/socket/index.js
import roomHandler from './roomHandler.js';
import gameHandler from './gameHandler.js';
import tributeHandler from './tributeHandler.js';

// 房间存储结构
export const rooms = new Map();

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

// 主Socket.IO处理函数
export default function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log('用户连接', socket.id);
    
    // 绑定房间事件处理器
    roomHandler(socket, io, rooms);
    
    // 绑定游戏事件处理器
    gameHandler(socket, io, rooms);
    
    socket.on('disconnect', () => {
      console.log('用户断开连接', socket.id);
      
      // 处理玩家断开连接
      for (const [roomId, room] of rooms) {
        if (room.players[socket.id]) {
          // 释放座位
          const position = room.players[socket.id].position;
          delete room.players[socket.id];
          
          // 从观众列表移除
          room.spectators = room.spectators.filter(id => id !== socket.id);
          
          // 如果玩家已就坐需要更新房主
          if (position !== null) {
            updateRoomOwner(room);
          }
          
          broadcastRoomData(io, roomId, room);
        }
      }
    });
  });
}