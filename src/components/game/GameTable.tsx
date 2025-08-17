interface GameTableProps {
  players: Player[];
  currentPlayerId: string;
  onPlay: (cards: string[]) => void;
}

export default function GameTable({
  players,
  currentPlayerId,
  onPlay
}: GameTableProps) {
  // 座位布局逻辑
  const positionedPlayers = positionPlayers(players, currentPlayerId);

  return (
    <div className="relative h-screen bg-green-800">
      {/* 顶部队伍等级 */}
      <LevelIndicator teamA={2} teamB={2} />

      {/* 四个玩家座位 */}
      {positionedPlayers.map(player => (
        <PlayerSeat
          key={player.id}
          position={player.position}
          username={player.username}
          cards={player.id === currentPlayerId ? player.hand : []}
          isCurrent={player.id === currentPlayerId}
        />
      ))}

      {/* 倒计时组件 */}
      <Timer seconds={30} />

      {/* 操作按钮组 */}
      <ControlButtons 
        onPlay={onPlay}
        onPass={() => onPlay([])}
      />
    </div>
  );
}

export function GameTable() {
  return (
    <div className="game-container">
      {/* 顶部对手区域 */}
      <PlayerSeat position="top" />
      
      {/* 中央游戏区 */}
      <div className="game-middle">
        <LevelIndicator />
        <Timer duration={30} />
      </div>

      {/* 底部玩家区域 */}
      <div className="player-area">
        <CardHand cards={[]} />
        <ControlButtons />
      </div>
    </div>
  );
}