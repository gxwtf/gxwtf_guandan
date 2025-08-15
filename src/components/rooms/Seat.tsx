import React from 'react';

interface SeatProps {
  position: number;
  player: any;
  isCurrentPlayer: boolean;
  isEmpty: boolean;
  onTakeSeat: (position: number) => void;
  onLeaveSeat: () => void;
}

const Seat: React.FC<SeatProps> = ({ 
  position, 
  player, 
  isCurrentPlayer,
  isEmpty,
  onTakeSeat,
  onLeaveSeat
}) => {
  const teamColor = position === 1 || position === 3 
    ? 'border-amber-500' 
    : 'border-indigo-500';
    
  return (
    <div className="relative w-28">
      {/* 统一容器（始终显示） */}
      <div className={`aspect-square rounded-full ${teamColor} border-2 ${isEmpty ? 'bg-transparent' : 'bg-slate-800'} transition-all`}>
        {!isEmpty ? (
          <>
            {/* 头像区域 */}
            <div className="w-full h-full rounded-full overflow-hidden">
              <img
                src={player.avatar || `https://cn.cravatar.com/avatar/b37ec0e93b9f9f557ae7542640b7d755?d=${encodeURIComponent('https://gxwtf.cn/gytb.png')}&s=100`}
                className="w-full h-full object-cover"
                alt="玩家头像"
              />
            </div>

            {/* 房主标识 */}
            {player.isOwner && (
              <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-amber-400 border border-slate-800 flex items-center justify-center">
                <span className="text-[8px] font-bold text-slate-900">★</span>
              </div>
            )}

            {/* 离开按钮 */}
            {isCurrentPlayer && (
              <button
                onClick={onLeaveSeat}
                className="absolute top-1 right-1 bg-slate-800/80 text-xs hover:bg-slate-700 px-1.5 py-0.5 rounded"
              >
                离开
              </button>
            )}
          </>
        ) : (
          <button
            onClick={() => onTakeSeat(position)}
            className="w-full h-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-3xl">+</span>
          </button>
        )}
      </div>

      {/* 底部信息（仅当有玩家时显示） */}
      {!isEmpty && (
        <div className="mt-2 text-center space-y-1">
          <p className="text-xs font-medium truncate px-1 text-slate-300">
            {player.username}
          </p>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${player.isReady ? 'bg-emerald-800/60' : 'bg-slate-700/60'}`}>
            {player.isReady ? '已准备' : '等待中'}
          </span>
        </div>
      )}
    </div>
  );
};

export default Seat;