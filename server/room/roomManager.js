import Room from './Room.js';
import GameSettings from '../game/GameSettings.js';

export default class RoomManager {
    static instance = null;

    static getInstance() {
        return this.instance;
    }

    constructor(io) {
        if (RoomManager.instance) {
            return RoomManager.instance;
        }
        this.io = io;
        this.rooms = new Map();
        RoomManager.instance = this;
    }

    getRoom(roomId) {
        return this.rooms.get(roomId);
    }

    broadcastUpdate(roomId) {
        const room = this.rooms.get(roomId);
        this.io.to(roomId).emit('roomUpdate', room.serialize());
    }

    enterRoom(roomId) {
        console.log('Enter Room', roomId);
        if (!this.rooms.has(roomId)) {
            console.log('Create New Room');
            const newRoom = new Room(roomId);
            newRoom.settings = new GameSettings();
            this.rooms.set(roomId, newRoom);
        }
        return this.rooms.get(roomId);
    }

    handleSeatChange(roomId, playerId, position) {
        const room = this.getRoom(roomId);
        const player = room.players.get(playerId);

        // 保持原有座位校验逻辑
        if (![1, 2, 3, 4].includes(position) ||
            Array.from(room.players.values()).some(p => p.position === position)) {
            throw new Error('INVALID_POSITION');
        }

        player.position = position;
        player.isReady = false;
        this.assignTeams(room);
        this.updateRoomOwner(room);
    }

    updateRoomOwner(room) {
        const seatedPlayers = Array.from(room.players.values())
            .filter(p => p.position !== null);

        room.owner = seatedPlayers.length > 0
            ? seatedPlayers.reduce((min, p) => p.position < min.position ? p : min)
            : null;
    }

    removePlayerFromRoom(roomId, playerId) {
        const room = this.getRoom(roomId);
        if (room) {
            room.removePlayer(playerId);
            room.spectators.delete(playerId);
            this.broadcastUpdate(roomId);
        }
    }
}