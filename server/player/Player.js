/**
 * 玩家实体类
 * @property {string} id - 玩家唯一标识（socket.id）
 * @property {string} username - 显示名称
 * @property {'player'|'spectator'} type - 玩家类型
 * @property {number|null} position - 座位位置（1-4）
 */

export default class Player {
    constructor(id, username, type = 'spectator') {
        this.id = id;
        this.username = username;
        this.type = type;
        this.position = null;
        this.isReady = false;
        this.joinTime = Date.now();
        this.team = null;
        this.gameState = {
            hand: [],
            score: 0,
            finishedOrder: null,
            isBanker: false
        }
    }

    // 转换为观众
    becomeSpectator() {
        this.type = 'spectator';
        this.position = null;
        this.isReady = false;
        this.team = null;
    }

    // 转换为玩家
    becomePlayer(position) {
        this.type = 'player';
        this.position = position;
    }

    toggleReady() {
        if (this.position === null) return;
        this.isReady = !this.isReady;
    }

    serialize(owner) {
        return {
            id: this.id,
            username: this.username,
            position: this.position,
            isReady: this.isReady,
            isOwner: this.position === owner,
            team: this.team,
            type: this.type
        };
    }
}