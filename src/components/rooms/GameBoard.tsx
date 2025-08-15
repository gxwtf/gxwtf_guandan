import React from 'react';
import Seat from './Seat';

interface GameBoardProps {
  roomState: any;
  currentPlayerId: string;
  onTakeSeat: (position: number) => void;
  onLeaveSeat: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  roomState,
  currentPlayerId,
  onTakeSeat,
  onLeaveSeat
}) => {
  // 获取所有座位状态
  const seats = [1, 2, 3, 4].map(position => {
    const player = Object.values(roomState.players).find(
      (p: any) => p.position === position
    );
    
    return {
      position,
      player: player || null,
      isEmpty: !player,
      isCurrentPlayer: player ? (player as any).id === currentPlayerId : false
    };
  });

  // 根据位置将座位分成两队
  const teamA = seats.filter(seat => seat.position === 1 || seat.position === 3);
  const teamB = seats.filter(seat => seat.position === 2 || seat.position === 4);

  return (
    <div className="bg-slate-800/30 rounded-xl p-6 shadow-lg border border-slate-700/50">
      <div className="flex justify-between mb-6">
        <div className="flex items-center">
          <span className="w-3 h-3 bg-amber-500 rounded-full mr-2"></span>
          <span className="text-sm font-medium">红队</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
          <span className="text-sm font-medium">蓝队</span>
        </div>
      </div>
      
      <div className="flex justify-center mb-10 gap-8">  {/* 增加间距到gap-8 */}
        {teamA.map((seat, index) => (
          <Seat 
            key={seat.position} 
            position={seat.position} 
            player={seat.player} 
            isEmpty={seat.isEmpty}
            isCurrentPlayer={seat.isCurrentPlayer}
            onTakeSeat={onTakeSeat}
            onLeaveSeat={onLeaveSeat}
          />
        ))}
      </div>
      
      <div className="relative bg-slate-900/50 rounded-lg p-6 flex items-center justify-center mb-8 min-h-[120px] border border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 to-slate-800/30"></div>
        
        <div className="relative z-10 flex items-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600/50 to-transparent border border-amber-500/20 mr-4"></div>
          <div>
            <div className="text-lg font-medium mb-1">房间 #{roomState.roomId}</div>
            <div className="text-slate-400 text-sm">正在等待玩家准备</div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center gap-8">  {/* 增加间距到gap-8 */}
        {teamB.map(seat => (
          <Seat 
            key={seat.position} 
            position={seat.position} 
            player={seat.player} 
            isEmpty={seat.isEmpty}
            isCurrentPlayer={seat.isCurrentPlayer}
            onTakeSeat={onTakeSeat}
            onLeaveSeat={onLeaveSeat}
          />
        ))}
      </div>
    </div>
  );
};

export default GameBoard;