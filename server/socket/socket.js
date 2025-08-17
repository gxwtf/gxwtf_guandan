import roomHandler from './roomHandler.js';
import gameHandler from './gameHandler.js';

export const rooms = new Map();

// 主Socket.IO处理函数
export default function setupSocket(io) {
    
    io.on('connection', (socket) => {
        roomHandler(socket, io, rooms);
        // 绑定游戏事件处理器
        gameHandler(socket, io, rooms);
    });
}