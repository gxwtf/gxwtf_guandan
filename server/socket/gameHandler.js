// 统一使用Game类
socket.on('playCards', ({ roomId, cards }) => {
  const room = rooms.get(roomId);
  const game = room.game;
  
  try {
    game.validateMove(socket.id, cards);
    game.processMove(socket.id, cards);
    
    if (game.checkRoundEnd()) {
      const rankings = game.determineRankings();
      game.updateTeamLevels(rankings);
      io.to(roomId).emit('roundEnd', {
        rankings,
        teamLevels: game.teamLevels
      });
    }
  } catch (error) {
    socket.emit('error', error.message);
  }
});