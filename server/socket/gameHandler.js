import Game from '../game/Game.js';
import Deck from '../game/Deck.js';

export default (io, socket, rooms) => {
  // 游戏核心逻辑
  const handleGameStart = (roomId) => {
    const room = rooms.get(roomId);
    
    // 创建游戏实例
    room.game = new Game({
      players: Array.from(room.players.values())
        .filter(p => p.isReady)
        .map(p => ({
          id: p.id,
          team: p.team
        })),
      settings: room.settings
    });

    // 初始化牌局
    const deck = new Deck();
    deck.shuffle();
    
    // 发牌并理牌
    room.game.initialize(deck);
    
    // 获取玩家手牌数据
    const gameState = room.game.serialize();
    
    // 广播游戏开始
    io.to(roomId).emit('gameStarted', {
      players: gameState.players,
      currentLevel: gameState.currentLevel,
      handCards: gameState.handCards
    });
  };

  // 准备状态监听
  socket.on('toggleReady', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (player) {
      player.isReady = !player.isReady;
      
      // 检查准备状态
      const readyPlayers = Array.from(room.players.values())
        .filter(p => p.isReady && p.position !== null);

      // 4人准备自动开始
      if (readyPlayers.length === 4) {
        handleGameStart(roomId);
      }

      io.to(roomId).emit('roomUpdate', {
        players: Object.fromEntries(room.players),
        readyCount: readyPlayers.length
      });
    }
  });

  // 出牌逻辑
  socket.on('playCards', ({ roomId, cards }) => {
    const room = rooms.get(roomId);
    try {
      const result = room.game.playCards(socket.id, cards);
      
      // 广播出牌结果
      io.to(roomId).emit('cardsPlayed', {
        playerId: socket.id,
        cards: result.playedCards,
        currentPlayer: result.nextPlayer
      });

      // 回合结束处理
      if (result.roundEnd) {
        const rankings = room.game.determineRankings();
        io.to(roomId).emit('roundEnd', {
          rankings,
          teamLevels: room.game.teamLevels
        });
      }
    } catch (error) {
      socket.emit('error', error.message);
    }
  });
};