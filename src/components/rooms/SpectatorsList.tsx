import React from 'react';

interface SpectatorsListProps {
  spectators: any[];
  currentPlayerId: string;
}

const SpectatorsList: React.FC<SpectatorsListProps> = ({ 
  spectators, 
  currentPlayerId 
}) => {
  // console.log(spectators,currentPlayerId);
  if (spectators.length === 0) return null;
  
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 shadow-lg border border-slate-700/50 mt-4">
      <h3 className="text-sm font-semibold mb-3 pb-2 border-b border-slate-700/50">
        观战者 <span className="text-slate-400 text-xs ml-1">({spectators.length})</span>
      </h3>
      
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {spectators.map((spectator, index) => (
          <div 
            key={index} 
            className="flex items-center p-1 text-sm rounded"
          >
            <div className="w-7 h-7 rounded-full bg-slate-700/60 mr-2 flex items-center justify-center text-xs">
              {spectator.username.charAt(0)}
            </div>
            <span className="text-slate-300 truncate max-w-[90px]">
              {spectator.username}
            </span>
            {currentPlayerId === spectator.id && (
              <span className="ml-auto text-2xs bg-slate-700 px-1.5 py-0.5 rounded">我</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpectatorsList;