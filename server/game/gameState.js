export default class GameState {
  constructor(players, settings) {
    this.players = players; // 玩家信息 {id: {username, position, team}}
    this.settings = settings;
    this.status = 'playing'; // playing, tribute, ended
    this.deck = []; // 牌堆
    this.playerHands = {}; // 玩家手牌 {playerId: [card1, card2...]}
    this.currentTurn = null; // 当前出牌玩家ID
    this.currentPlay = null; // 当前回合出的牌 {playerId, cards, type}
    this.lastPlay = null; // 上一回合出的牌
    this.round = 1; // 当前轮次
    this.scores = { teamA: 0, teamB: 0 };
    this.tributePhase = null; // 进贡阶段信息
  }

  // 初始化游戏（洗牌、发牌）
  initializeGame() {
    // 创建牌堆并洗牌
    this.deck = this.createDeck();
    this.shuffleDeck(this.deck);
    
    // 发牌
    this.dealCards();
    
    // 确定首发玩家（随机选择）
    const playerIds = Object.keys(this.playerHands);
    this.currentTurn = playerIds[Math.floor(Math.random() * playerIds.length)];
  }

  createDeck() {
    // 创建标准牌+大小王（两副牌）
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    
    // 两副牌
    for (let i = 0; i < 2; i++) {
      suits.forEach(suit => {
        ranks.forEach(rank => {
          deck.push({ suit, rank });
        });
      });
      
      // 添加大小王
      deck.push({ suit: 'joker', rank: 'BJ' }); // 小王
      deck.push({ suit: 'joker', rank: 'RJ' }); // 大王
    }
    
    return deck;
  }

  shuffleDeck(deck) {
    // Fisher-Yates洗牌算法
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  dealCards() {
    const playerIds = Object.keys(this.players);
    playerIds.forEach(playerId => {
      this.playerHands[playerId] = [];
    });
    
    // 每人发27张牌
    for (let i = 0; i < 27; i++) {
      playerIds.forEach(playerId => {
        this.playerHands[playerId].push(this.deck.pop());
      });
    }
  }

  // 获取下一个玩家
  getNextPlayer() {
    const playerIds = Object.keys(this.players);
    const currentIndex = playerIds.indexOf(this.currentTurn);
    const nextIndex = (currentIndex + 1) % playerIds.length;
    return playerIds[nextIndex];
  }
}