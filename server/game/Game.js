export default class Game {
    constructor(room, settings) {
        this.room = room;
        this.settings = settings;
        this.players = this.preparePlayers();
        this.roundHistory = [];
        this.teamLevels = { A: 2, B: 2 };
        this.currentRound = 1;
        this.status = 'waiting';
    }

    endRound() {
        const rankings = this.determineRankings();
        const winningTeam = this.players.find(p => p.position === rankings[0]).team;

        this.roundHistory.push({
            round: this.currentRound,
            rankings,
            winningTeam,
            timestamp: Date.now()
        });

        this.updateTeamLevels(winningTeam);
        super.endRound();
    }

    determineRankings() {
        // 按出完牌的顺序排序（最后出完牌的为末游）
        return this.players
            .sort((a, b) => b.finishedOrder - a.finishedOrder)
            .map(p => p.id);
    }

    // 核心升级逻辑
    updateTeamLevels(rankings) {
        const [first, second] = rankings;
        const firstTeam = this.players.find(p => p.id === first).team;
        const secondTeam = this.players.find(p => p.id === second).team;

        if (this.teamLevels[firstTeam] === 14) { // A级特殊处理
            if (rankings[3] === firstTeam) {
                if (++this.aLevelFailedCount >= 3) {
                    this.teamLevels[firstTeam] = 2;
                    this.aLevelFailedCount = 0;
                }
                return;
            }
        }

        if (firstTeam === secondTeam) {
            this.teamLevels[firstTeam] = Math.min(this.teamLevels[firstTeam] + 3, 14);
        } else if ([1, 3].includes(rankings.indexOf(secondTeam))) {
            this.teamLevels[firstTeam] = Math.min(this.teamLevels[firstTeam] + 2, 14);
        } else {
            this.teamLevels[firstTeam] = Math.min(this.teamLevels[firstTeam] + 1, 14);
        }
    }

    initialize() {
        // 每局重置牌组
        this.deck = new Deck(this.settings.levelCard || '2');
        this.deck.shuffle();
    
        // 验证玩家数量
        if (this.players.length !== 4) {
            throw new Error('需要4名玩家开始游戏');
        }
    
        // 发牌并记录原始顺序
        this.players.forEach((player, index) => {
            player.gameState = {
                hand: this.deck.draw(27),
                originalHand: [], // 将在sort后保留原始顺序
                finishedOrder: null,
                isBanker: index === 0 // 首局第一个玩家为庄家
            };
            this.sortPlayerCards(player);
            player.gameState.originalHand = [...player.gameState.hand];
        });
    
        // 日志输出发牌结果
        console.log(`第${this.currentRound}局发牌完成：`, 
            this.players.map(p => ({
                user: p.username,
                count: p.gameState.hand.length,
                sample: p.gameState.hand.slice(0,5).map(c => `${c.suit}${c.rank}`)
            }))
        );
    }
    
    // 理牌核心逻辑
    sortPlayerCards(player) {
        const suitOrder = ['♠', '♥', '♣', '♦']; // 固定花色顺序：黑桃 > 红桃 > 梅花 > 方块
        
        player.gameState.hand.sort((a, b) => {
            const rankOrder = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
            
            const getValue = card => {
                if (card.rank === 'RJ' || card.rank === 'BJ') return 100; // 王牌最大
                if (card.isLevel) return 90 + rankOrder.indexOf(card.rank); // 级牌
                
                const base = rankOrder.indexOf(card.rank) * 10;
                const suitWeight = (4 - suitOrder.indexOf(card.suit)) * 2; // 黑桃权重最高
                return base + suitWeight;
            };
            
            return getValue(a) - getValue(b);
        });
    }
}