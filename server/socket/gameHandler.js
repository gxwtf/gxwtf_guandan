import GameState from '../game/Game.js';
import { identifyCardType, compareCardTypes, CardTypes } from '../utils/cardUtils.js';

export default (socket, io, rooms) => {
  // 开始游戏
  socket.on('startGame', (roomId) => {
    const room = rooms.get(roomId);
    if (!room || room.status !== 'waiting') return;

    // 创建游戏状态
    const players = {};
    Object.keys(room.players).forEach(playerId => {
      const player = room.players[playerId];
      players[playerId] = {
        username: player.username,
        position: player.position,
        team: player.team
      };
    });

    const gameState = new GameState(players, room.settings);
    gameState.initializeGame();

    // 保存游戏状态
    room.gameState = gameState;
    room.status = 'playing';

    // 广播游戏开始
    io.to(roomId).emit('gameStarted', {
      playerHands: gameState.playerHands,
      currentTurn: gameState.currentTurn
    });
  });

  // 出牌
  socket.on('playCards', ({ roomId, cards }) => {
    const room = rooms.get(roomId);
    if (!room || room.status !== 'playing') return;

    const gameState = room.gameState;
    const playerId = socket.id;

    // 验证是否是当前回合
    if (gameState.currentTurn !== playerId) {
      return socket.emit('error', '现在不是你的回合');
    }

    // 验证玩家是否有这些牌
    const playerHand = gameState.playerHands[playerId];
    if (!validateCards(playerHand, cards)) {
      return socket.emit('error', '你并没有这些牌');
    }

    // 识别牌型
    const cardType = identifyCardType(cards);
    if (!cardType) {
      return socket.emit('error', '牌型不合法');
    }

    // 如果不是首出，需要比较牌型大小
    if (gameState.lastPlay && !compareCardTypes(cardType, gameState.lastPlay.type)) {
      return socket.emit('error', '牌型不匹配或牌力不足');
    }

    // 更新游戏状态
    gameState.currentPlay = {
      playerId,
      cards,
      type: cardType
    };

    // 从玩家手牌中移除这些牌
    gameState.playerHands[playerId] = playerHand.filter(
      card => !cards.some(c => c.suit === card.suit && c.rank === card.rank)
    );

    // 如果玩家出完牌，则游戏结束
    if (gameState.playerHands[playerId].length === 0) {
      endGame(roomId, gameState);
      return;
    }

    // 设置上一轮出牌
    gameState.lastPlay = gameState.currentPlay;

    // 轮转到下一个玩家
    gameState.currentTurn = gameState.getNextPlayer();

    // 广播游戏状态更新
    io.to(roomId).emit('gameStateUpdate', {
      currentPlay: gameState.currentPlay,
      lastPlay: gameState.lastPlay,
      currentTurn: gameState.currentTurn,
      playerHands: gameState.playerHands
    });
  });

  // 跳过回合
  socket.on('passTurn', (roomId) => {
    const room = rooms.get(roomId);
    if (!room || room.status !== 'playing') return;

    const gameState = room.gameState;
    const playerId = socket.id;

    // 验证是否是当前回合
    if (gameState.currentTurn !== playerId) {
      return socket.emit('error', '现在不是你的回合');
    }

    // 如果当前没有出牌（即自己是首出），则不能跳过
    if (!gameState.lastPlay) {
      return socket.emit('error', '你是首出玩家，不能跳过');
    }

    // 轮转到下一个玩家
    gameState.currentTurn = gameState.getNextPlayer();

    // 广播游戏状态更新
    io.to(roomId).emit('gameStateUpdate', {
      currentTurn: gameState.currentTurn
    });
  });

  // 结束游戏
  function endGame(roomId, gameState) {
    // 在endGame()中更新升级
    const ranks = getPlayerRanks(); // 获取玩家排名 [头游, 二游, 三游, 末游]
    const headPlayerTeam = this.players[ranks[0]].team;
    if (headPlayerTeam === this.players[ranks[1]].team) {
      this.currentLevel = Math.min(this.currentLevel + 3, 14); // 14代表A
    } else if (headPlayerTeam === this.players[ranks[2]].team) {
      this.currentLevel += 2;
    } else {
      this.currentLevel += 1;
    }
    // A级特殊规则
    if (this.currentLevel === 14 && ranks[3].team === headPlayerTeam) {
      this.currentLevel = 13; // 未通过A级，回退到K
    }
  }

  // 确定赢家队伍
  function determineWinningTeam(gameState) {
    // 根据出完牌的玩家队伍确定赢家
    const finishedPlayer = Object.keys(gameState.playerHands).find(
      playerId => gameState.playerHands[playerId].length === 0
    );

    return gameState.players[finishedPlayer].team;
  }

  // 确定进贡关系
  function determineTribute(gameState) {
    // 根据规则确定进贡关系
    // 这里简化处理：输家向赢家进贡
    const winningTeam = determineWinningTeam(gameState);
    const losingTeam = winningTeam === 'A' ? 'B' : 'A';

    const winningPlayers = Object.keys(gameState.players).filter(
      playerId => gameState.players[playerId].team === winningTeam
    );

    const losingPlayers = Object.keys(gameState.players).filter(
      playerId => gameState.players[playerId].team === losingTeam
    );

    return {
      fromPlayers: losingPlayers,
      toPlayers: winningPlayers
    };
  }

  // 验证玩家是否有这些牌
  function validateCards(playerHand, cardsToPlay) {
    const handCopy = [...playerHand];

    for (const card of cardsToPlay) {
      const index = handCopy.findIndex(
        c => c.suit === card.suit && c.rank === card.rank
      );

      if (index === -1) return false;
      handCopy.splice(index, 1);
    }

    return true;
  }
};