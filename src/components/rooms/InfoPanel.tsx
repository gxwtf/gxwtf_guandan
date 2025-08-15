import React from 'react';

interface InfoPanelProps {
  seatedPlayers: number;
  readyCount: number;
  settings: any;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ 
  seatedPlayers, 
  readyCount,
  settings
}) => {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 shadow-lg border border-slate-700/50">
      <h3 className="text-sm font-semibold mb-3 pb-2 border-b border-slate-700/50">房间状态</h3>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-800/30 p-2 rounded text-center">
          <div className="text-slate-400 text-xs">玩家</div>
          <div className="text-lg font-medium">{seatedPlayers}/4</div>
        </div>
        
        <div className="bg-slate-800/30 p-2 rounded text-center">
          <div className="text-slate-400 text-xs">准备</div>
          <div className="text-lg font-medium">{readyCount}/4</div>
        </div>
        
        <div className="col-span-2 bg-slate-800/30 p-2 rounded mt-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">时间限制:</span>
            <span>
              {settings.unlimitedTime ? '无限制' : `${settings.timeLimit}秒`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;