import React from 'react';

interface ReadyButtonProps {
  isReady: boolean;
  readyCount: number;
  isSeated: boolean;
  isOwner: boolean;
  canStartGame: boolean;
  onToggleReady: () => void;
  onStartGame: () => void;
}

const ReadyButton: React.FC<ReadyButtonProps> = ({ 
  isReady,
  readyCount,
  isSeated,
  isOwner,
  canStartGame,
  onToggleReady,
  onStartGame
}) => {
  if (!isSeated) {
    return (
      <div className="text-center text-slate-500 text-sm py-4">
        请选择空座位加入游戏
      </div>
    );
  }

  return (
    <div className="mt-6">
      <button
        onClick={onToggleReady}
        className={`w-full py-3 rounded-lg font-medium flex items-center justify-center ${
          isReady
            ? 'bg-gradient-to-r from-amber-700/70 to-amber-800/70 hover:from-amber-700/90 hover:to-amber-800/90'
            : 'bg-gradient-to-r from-emerald-700/70 to-emerald-800/70 hover:from-emerald-700/90 hover:to-emerald-800/90'
        } transition-all duration-300 relative overflow-hidden`}
      >
        <span>
          {isReady ? '取消准备' : '准备游戏'} 
          <span className="ml-2 bg-black/30 px-2.5 py-1 rounded-full text-xs">
            {readyCount}/4
          </span>
        </span>
        {isReady && (
          <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-amber-600/50 to-transparent flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </button>
      
      {isOwner && canStartGame && (
        <button
          onClick={onStartGame}
          className="mt-3 w-full py-3 bg-gradient-to-r from-emerald-700/90 to-emerald-800/90 hover:from-emerald-600 hover:to-emerald-700 rounded-lg font-medium flex items-center justify-center transition transform hover:scale-[1.02] active:scale-[0.98]"
        >
          开始游戏
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ReadyButton;