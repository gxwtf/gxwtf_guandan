export default class Deck {
  static createDeck() {
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

  static shuffleDeck(deck) {
    // Fisher-Yates洗牌算法
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

}