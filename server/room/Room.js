import GameSettings from '../game/GameSettings.js';

export default class Room {
    constructor() {
        this.players = new Map(); // <playerId, Player>
        this.settings = new GameSettings();
        this.status = 'waiting';
        this.owner = null;
        this.status = 'waiting';
        this.game = null; // 游戏开始后初始化Game实例
    }

    togglePlayerType(player, position) {
        if (player.type == 'player') player.becomeSpectator();
        else if(player.type == 'spectator') player.becomePlayer(position);
        this.players.set(player.id, player);
        this.updateOwner();
    }

    removePlayer(playerId) {
        this.players.delete(playerId);
        this.updateOwner();
    }

    // 更新房主
    updateOwner() {
        const seatedPlayers = Array.from(this.players.values())
            .filter(p => p.position !== null);

        // 改为存储房主位置
        this.owner = seatedPlayers.length > 0
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
        });
    }

    serialize() {
        return {
            players: Object.fromEntries( // 转换为普通对象
                Array.from(this.players.entries()).map(([id, p]) => [id, p.serialize(this.owner)])
            ),
            settings: this.settings,
            readyCount: this.getReadyCount(),
            owner: this.owner,
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
        if(player.type=='spectator') this.togglePlayerType(player,position);
        else player.position = position;
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

        this.togglePlayerType(player,null);
    }
}