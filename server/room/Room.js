import GameSettings from '../game/GameSettings.js';

export default class Room {
    // 需要添加spectators属性
    constructor() {
        this.spectators = new Set();
        this.players = new Map(); // <playerId, Player>
        this.settings = new GameSettings();
        this.status = 'waiting';
        this.owner = null;
        this.status = 'waiting';
        this.game = null; // 游戏开始后初始化Game实例
    }

    // 新增观众
    // 修改addSpectator方法
    addSpectator(player) {
        console.log('add spectator',player.username);
        this.spectators.add(player.id);
        if (player.type !== 'spectator') {
            player.becomeSpectator();
        }
        this.players.set(player.id, player);
    }

    // 转换为玩家
    promoteToPlayer(playerId, position) {
        const player = this.players.get(playerId);
        if (player && player.type === 'spectator') {
            player.becomePlayer(position);
            return true;
        }
        return false;
    }

    // 移除玩家
    removePlayer(playerId) {
        this.players.delete(playerId);
        this.updateOwner();
    }

    // 更新房主
    updateOwner() {
        const seatedPlayers = Array.from(this.players.values())
            .filter(p => p.position !== null);

        // 改为存储房主位置
        this.ownerPosition = seatedPlayers.length > 0
            ? seatedPlayers.reduce((min, p) => p.position < min.position ? p : min).position
            : null;
    }

    startGame() {
        if (!this.owner) throw new Error('房主不存在');

        const seatedPlayers = Array.from(this.players.values())
            .filter(p => p.position !== null);

        if (seatedPlayers.length !== 4 || !seatedPlayers.every(p => p.isReady)) {
            throw new Error('需要4位玩家全部准备');
        }

        this.status = 'playing';
        this.game = new Game(this);
    }

    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
    }

    getReadyCount() {
        return Array.from(this.players.values())
            .filter(p => p.isReady && p.position !== null).length;
    }

    assignTeams() {
        Array.from(this.players.values()).forEach(player => {
            if ([1, 3].includes(player.position)) player.team = 'A';
            if ([2, 4].includes(player.position)) player.team = 'B';
            // 新增观众队伍处理
            if (player.type === 'spectator') player.team = null;
        });
    }

    serialize() {
        return {
            roomId: this.id,
            players: Array.from(this.players.values()).map(p => p.serialize()),
            settings: this.settings,
            readyCount: this.getReadyCount(),
            owner: this.owner,
            ownerPosition: this.ownerPosition,
            spectators: Array.from(this.spectators),
            game: this.game?.serialize()
        };
    }

    handleTakeSeat(playerId, position) {
        const player = this.players.get(playerId);
        if (!player || ![1, 2, 3, 4].includes(position))
            throw new Error('INVALID_POSITION');

        // 校验座位冲突
        if (Array.from(this.players.values()).some(p => p.position === position)) {
            throw new Error('SEAT_OCCUPIED');
        }

        // 更新玩家状态
        player.position = position;
        player.isReady = false;
        this.assignTeams();
        this.updateOwner();
    }

    handleLeaveSeat(playerId) {
        const player = this.players.get(playerId);
        if (!player || !player.position) return;

        // 清除座位状态
        player.position = null;
        player.isReady = false;
        player.team = null;

        // 自动转为观众
        this.addSpectator(player);
        this.updateOwner();
    }
}