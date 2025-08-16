export default class Player {
    constructor(id, username, type = 'spectator') {
        this.id = id;
        this.username = username;
        this.type = type; // player/spectator
        this.position = null;
        this.isReady = false;
        this.joinTime = Date.now();
        this.team = null;
    }

    // 转换为观众
    becomeSpectator() {
        this.type = 'spectator';
        this.position = null;
        this.isReady = false;
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

    // 保持原有房主计算逻辑
    get isOwner() {
        return this.position === this.ownerPosition;
    }

    serialize() {
        return {
            id: this.id,
            username: this.username,
            position: this.position,
            isReady: this.isReady,
            isOwner: this.position === this.ownerPosition,
            team: this.team
        };
    }
}