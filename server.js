import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  // 房间存储结构
  const rooms = new Map();

  // 广播房间数据给所有成员
  const broadcastRoomData = (roomId) => {
    const room = rooms.get(roomId);
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
  const updateRoomOwner = (roomId) => {
    const room = rooms.get(roomId);
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

  io.on('connection', (socket) => {
    console.log('用户连接', socket.id);

    socket.on('joinRoom', ({ roomId, username = `用户${Math.random().toString(36).substring(2, 7)}` }) => {
      // 验证房间ID格式
      if (typeof roomId !== 'string' || roomId.length > 20) {
        return socket.emit('error', '房间ID无效');
      }

      // 创建房间（如果不存在）
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          players: {},
          spectators: [],
          settings: {
            timeLimit: 30,  // 默认思考时间30秒
            tribute: true, // 默认进贡
            gameMode: 'multi', // 'single'或'multi'
            unlimitedTime: false // 无时间限制
          },
          status: 'waiting', // waiting/playing
          owner: null // 最小位置号玩家为房主
        });
        console.log(`新房间已创建: ${roomId}`);
      }

      const room = rooms.get(roomId);
      const playerId = socket.id;

      // 加入房间
      socket.join(roomId);
      
      // 作为观众加入
      room.spectators.push(playerId);
      room.players[playerId] = {
        id: playerId,
        username,
        position: null, // 初始未选择位置
        isReady: false,
        isOwner: false,
        team: null
      };

      // 发送初始房间数据
      broadcastRoomData(roomId);

      // 断开连接处理
      socket.on('disconnect', () => {
        console.log('用户断开连接', socket.id);
        
        // 从观众或玩家列表中移除
        room.spectators = room.spectators.filter(id => id !== playerId);
        
        if (room.players[playerId]) {
          // 释放座位
          const position = room.players[playerId].position;
          delete room.players[playerId];
          
          // 如果玩家已就坐需要更新房主
          if (position !== null) {
            updateRoomOwner(roomId);
          }
        }
        
        broadcastRoomData(roomId);
      });

      // === 位置相关事件 ===
      // 占用座位
      socket.on('takeSeat', ({ position }) => {
        const player = room.players[playerId];
        
        // 检查位置是否有效且未被占用
        if (![1, 2, 3, 4].includes(position) || 
            Object.values(room.players).some(p => p.position === position)) {
          return socket.emit('error', '位置无效或被占用');
        }
        
        // 从观众列表移除（如果存在）
        room.spectators = room.spectators.filter(id => id !== playerId);
        
        // 更新玩家位置
        player.position = position;
        player.isReady = false; // 切换位置时取消准备
        
        // 设置队伍（1-3为队友，2-4为队友）
        player.team = position % 2 === 1 ? 'A' : 'B';
        
        // 更新房主
        if (room.owner === null || position < room.owner) {
          room.owner = position;
          player.isOwner = true;
        }

        broadcastRoomData(roomId);
      });

      // 离开座位（变为观众）
      socket.on('leaveSeat', () => {
        const player = room.players[playerId];
        if (!player || player.position === null) return;
        
        // 清除准备状态
        player.isReady = false;
        
        // 记录当前位置并释放
        const prevPosition = player.position;
        player.position = null;
        player.team = null;
        player.isOwner = false;
        
        // 加入观众列表
        if (!room.spectators.includes(playerId)) {
          room.spectators.push(playerId);
        }
        
        // 更新房主
        updateRoomOwner(roomId);
        
        broadcastRoomData(roomId);
      });

      // === 准备状态相关 ===
      socket.on('toggleReady', () => {
        const player = room.players[playerId];
        if (!player || player.position === null) return;
        
        player.isReady = !player.isReady;
        broadcastRoomData(roomId);
      });

      // === 房间设置 ===
      socket.on('updateSettings', (newSettings) => {
        const player = room.players[playerId];
        // 只有房主才能修改设置
        if (!player || !player.isOwner) return;
        
        Object.assign(room.settings, newSettings);
        broadcastRoomData(roomId);
      });

      // === 开始游戏 ===
      socket.on('startGame', () => {
        const player = room.players[playerId];
        
        // 检查：必须是房主且所有玩家已准备
        if (!player || !player.isOwner) return;
        
        const seatedPlayers = Object.values(room.players)
          .filter(p => p.position !== null);
          
        if (seatedPlayers.length !== 4 || 
            !seatedPlayers.every(p => p.isReady)) {
          return socket.emit('error', '需要4位玩家全部准备');
        }
        
        room.status = 'playing';
        broadcastRoomData(roomId);
        
        // 广播游戏开始
        io.to(roomId).emit('gameStarted', {
          players: room.players,
          settings: room.settings
        });
      });
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});