import roomHandler from './roomHandler.js';
import gameHandler from './gameHandler.js';

// 房间存储结构
export const rooms = new Map();

// 主Socket.IO处理函数
export default function setupSocket(io) {
    io.on('connection', (socket) => {
        console.log('用户连接', socket.id);

        // 绑定房间事件处理器
        roomHandler(socket, io, rooms);
        // 绑定游戏事件处理器
        gameHandler(socket, io, rooms);
    });
}