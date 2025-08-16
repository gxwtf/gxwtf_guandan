import roomHandler from './roomHandler.js';
import gameHandler from './gameHandler.js';

// 房间存储结构
import RoomManager from '../room/roomManager.js';

export const rooms = new Map();

// 主Socket.IO处理函数
export default function setupSocket(io) {
    
    const roomManager = new RoomManager(io);
    RoomManager.instance = roomManager;
    
    io.on('connection', (socket) => {
        roomHandler(socket, io, roomManager);
        // 绑定游戏事件处理器
        gameHandler(socket, io, rooms);
    });
}