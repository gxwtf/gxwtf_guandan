/**
 * 游戏房间类，管理房间状态和玩家操作
 * @property {Map} players - 房间内玩家集合（键：playerId，值：Player）
 * @property {GameSettings} settings - 游戏设置
 * @property {string} status - 房间状态
 * @property {number|null} owner - 房主座位位置
 * @property {Game|null} game - 游戏实例
 */

import GameSettings from '../game/GameSettings.js';

export default class Room {
    constructor() {
        this.players = new Map();
        this.settings = new GameSettings();
        this.owner = null;
        this.status = 'waiting';
        this.game = null;
    }

    togglePlayerType(player, position) {
        if (player.type == 'player') player.becomeSpectator();
        else if (player.type == 'spectator') player.becomePlayer(position);
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

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }

    getReadyCount() {
        return Array.from(this.players.values())
            .filter(p => p.isReady && p.position !== null).length;
    }

    assignTeams() {
        Array.from(this.players.values()).forEach(player => {
            if ([1, 3].includes(player.position)) player.team = 'A';
            if ([2, 4].includes(player.position)) player.team = 'B';
            else player.team = null;
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

    handleSeatChange(playerId, newPosition) {
        const player = this.players.get(playerId);

        // 离座处理
        if (newPosition === null) {
            if (!player?.position) return;
            this.togglePlayerType(player, null);
            this.updateOwner();
            this.assignTeams();
            return;
        }

        // 座位有效性验证
        if (![1, 2, 3, 4].includes(newPosition)) {
            throw new Error('INVALID_POSITION');
        }

        // 检查座位冲突
        if (Array.from(this.players.values()).some(p => p.position === newPosition)) {
            throw new Error('SEAT_OCCUPIED');
        }

        // 新玩家入座
        if (player.type === 'spectator') this.togglePlayerType(player, newPosition);

        // 更新座位位置
        player.position = newPosition;
        player.isReady = false;
        this.assignTeams();
        this.updateOwner();
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
}