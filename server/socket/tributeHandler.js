module.exports = (socket, io, rooms) => {
  socket.on('submitTribute', (data) => {
    // 提交进贡牌
  });
  
  socket.on('submitReturnCard', (data) => {
    // 提交返还牌
  });
  
  socket.on('antiTribute', (data) => {
    // 抗贡
  });
};