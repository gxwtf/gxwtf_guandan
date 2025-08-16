export default class Game {
    constructor(room) {
        this.room = room;
        this.deck = new Deck();
        this.currentRound = 1;
        this.players = [...room.players.values()];
        this.initGame();
    }

    initGame() {
        this.deck.shuffle();
        this.dealCards();
    }

    dealCards() {
        const players = this.players;
        // 掼蛋发牌逻辑
        players.forEach(player => {
            player.hand = this.deck.draw(27); // 每人27张牌
        });
    }

    nextTurn() {
        // 回合管理逻辑
    }
}