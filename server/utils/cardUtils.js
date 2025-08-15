// 牌型常量
export const CardTypes = {
  SINGLE: 'single',         // 单张
  PAIR: 'pair',             // 对子
  TRIPLE: 'triple',         // 三张
  STRAIGHT: 'straight',     // 顺子
  STRAIGHT_PAIRS: 'straight_pairs', // 连对
  AIRPLANE: 'airplane',     // 飞机
  BOMB: 'bomb',             // 炸弹
  KING_BOMB: 'king_bomb',   // 王炸
  FOUR_WITH_TWO: 'four_with_two' // 四带二
};

// 牌值权重
const cardWeights = {
  '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, 
  '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  '2': 15, 'BJ': 16, 'RJ': 17
};

// 识别牌型
export function identifyCardType(cards) {
  const sortedCards = sortCards(cards);
  const cardCount = sortedCards.length;
  
  // 单张
  if (cardCount === 1) return { type: CardTypes.SINGLE, value: cardWeights[sortedCards[0].rank] };
  
  // 对子
  if (cardCount === 2 && sameRank(sortedCards)) {
    return { type: CardTypes.PAIR, value: cardWeights[sortedCards[0].rank] };
  }
  
  // 王炸
  if (cardCount === 2 && isKingBomb(sortedCards)) {
    return { type: CardTypes.KING_BOMB, value: 100 };
  }
  
  // 三张
  if (cardCount === 3 && sameRank(sortedCards)) {
    return { type: CardTypes.TRIPLE, value: cardWeights[sortedCards[0].rank] };
  }
  
  // 炸弹
  if (cardCount === 4 && sameRank(sortedCards)) {
    return { type: CardTypes.BOMB, value: cardWeights[sortedCards[0].rank] + 20 };
  }
  
  // 顺子 (5张或以上连续单牌)
  if (cardCount >= 5 && isStraight(sortedCards)) {
    return { type: CardTypes.STRAIGHT, value: cardWeights[sortedCards[0].rank] };
  }
  
  // 连对 (3对或以上连续对子)
  if (cardCount >= 6 && cardCount % 2 === 0 && isStraightPairs(sortedCards)) {
    return { type: CardTypes.STRAIGHT_PAIRS, value: cardWeights[sortedCards[0].rank] };
  }
  
  // 飞机 (2个或以上连续三张)
  if (cardCount >= 6 && cardCount % 3 === 0 && isAirplane(sortedCards)) {
    return { type: CardTypes.AIRPLANE, value: cardWeights[sortedCards[0].rank] };
  }
  
  // 四带二
  if (cardCount === 6 && isFourWithTwo(sortedCards)) {
    return { type: CardTypes.FOUR_WITH_TWO, value: cardWeights[findFourCard(sortedCards).rank] };
  }
  
  return null; // 无效牌型
}

// 比较牌型大小
export function compareCardTypes(play1, play2) {
  // 王炸最大
  if (play1.type === CardTypes.KING_BOMB) return 1;
  if (play2.type === CardTypes.KING_BOMB) return -1;
  
  // 炸弹比其他牌型大
  if (play1.type === CardTypes.BOMB && play2.type !== CardTypes.BOMB) return 1;
  if (play2.type === CardTypes.BOMB && play1.type !== CardTypes.BOMB) return -1;
  
  // 同类型比较
  if (play1.type === play2.type) {
    return play1.value - play2.value;
  }
  
  // 不同类型不能比较
  return null;
}

// 辅助函数
function sortCards(cards) {
  return [...cards].sort((a, b) => cardWeights[b.rank] - cardWeights[a.rank]);
}

function sameRank(cards) {
  return cards.every(card => card.rank === cards[0].rank);
}

function isKingBomb(cards) {
  return cards.some(c => c.rank === 'BJ') && cards.some(c => c.rank === 'RJ');
}

// 其他辅助函数实现略...