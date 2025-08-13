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

  // 新增房间存储
  const rooms = new Map();

  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('joinRoom', (roomId) => {
      // 验证房间ID格式
      if (typeof roomId !== 'string' || roomId.length > 20) {
        return socket.emit('error', 'Invalid room ID');
      }

      // 自动创建房间
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          players: [],
          createdAt: Date.now(),
          status: 'waiting'
        });
        console.log(`New room created: ${roomId}`);
      }

      socket.join(roomId);
      rooms.get(roomId).players.push(socket.id);

      // 新增广播逻辑
      io.to(roomId).emit('roomStatus', {
        roomId,
        players: rooms.get(roomId).players.length,
        status: rooms.get(roomId).status
      });

      // 玩家加入时广播给全体成员
      io.to(roomId).emit('playerJoined', {
        playerId: socket.id,
        totalPlayers: rooms.get(roomId).players.length
      });

      // 玩家断开时更新并广播
      socket.on('disconnect', () => {
        const room = rooms.get(roomId);
        if (room) {
          room.players = room.players.filter(id => id !== socket.id);
          io.to(roomId).emit('playerLeft', {
            playerId: socket.id,
            totalPlayers: room.players.length
          });
        }
      });
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
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