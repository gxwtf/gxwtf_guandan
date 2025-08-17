const SUITS = ['♥', '♠', '♣', '♦'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SPECIALS = ['BJ', 'RJ']; // 小王、大王

export default class Deck {
  constructor(levelCard='2') {
    this.cards = [];
    this.levelCard = levelCard; // 级牌
    this.generateDeck();
  }

  generateDeck() {
    // 生成108张牌（两副）
    for (let i = 0; i < 2; i++) {
      SUITS.forEach(suit => {
        RANKS.forEach(rank => {
          this.cards.push({
            suit,
            rank,
            isLevel: rank === this.levelCard,
            isRedHeart: suit === '♥'
          });
        });
      });
      // 添加大小王
      this.cards.push({ suit: 'JOKER', rank: 'BJ', isLevel: false });
      this.cards.push({ suit: 'JOKER', rank: 'RJ', isLevel: false });
    }
  }

  shuffle() {
    // Fisher-Yates洗牌算法
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw(count=27) {
    return this.cards.splice(0, count);
  }
}