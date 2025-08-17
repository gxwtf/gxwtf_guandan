import React from 'react';

interface SettingsPanelProps {
  settings: any;
  isOwner: boolean;
  onUpdateSettings: (newSettings: any) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  settings, 
  isOwner,
  onUpdateSettings 
}) => {
  if (!isOwner) return null;
  
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 shadow-lg border border-slate-700/50">
      <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-slate-700/50 flex items-center">
        <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
        房间设置
      </h3>
      
      <div className="space-y-3">
        {/* 思考时间设置 */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300">思考时间</span>
          <div className="flex items-center space-x-2">
            <button 
              className="w-7 h-7 rounded bg-slate-700 flex items-center justify-center"
              onClick={() => onUpdateSettings({ timeLimit: Math.max(10, settings.timeLimit - 5) })}
              disabled={settings.unlimitedTime}
            >
              -
            </button>
            <span className="w-16 text-center">
              {settings.unlimitedTime ? '无限制' : `${settings.timeLimit}秒`}
            </span>
            <button 
              className="w-7 h-7 rounded bg-slate-700 flex items-center justify-center"
              onClick={() => onUpdateSettings({ timeLimit: Math.min(90, settings.timeLimit + 5) })}
              disabled={settings.unlimitedTime}
            >
              +
            </button>
            <div className="ml-2 flex items-center">
              <input 
                type="checkbox" 
                id="unlimitedTime"
                checked={settings.unlimitedTime}
                onChange={() => onUpdateSettings({ unlimitedTime: !settings.unlimitedTime })}
                className="h-3.5 w-3.5 mr-1"
              />
              <label htmlFor="unlimitedTime" className="text-xs">无限制</label>
            </div>
          </div>
        </div>
        
        {/* 进贡规则 */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300">进贡规则</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.tribute}
              onChange={() => onUpdateSettings({ tribute: !settings.tribute })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            <span className="ml-2 text-xs">
              {settings.tribute ? '开启' : '关闭'}
            </span>
          </label>
        </div>
        
        {/* 游戏模式 */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300">游戏模式</span>
          <div className="flex space-x-1">
            <button 
              className={`px-2 py-1 rounded text-xs ${
                settings.gameMode === 'single' 
                  ? 'bg-emerald-600' 
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
              onClick={() => onUpdateSettings({ gameMode: 'single' })}
            >
              单局
            </button>
            <button 
              className={`px-2 py-1 rounded text-xs ${
                settings.gameMode === 'multi' 
                  ? 'bg-emerald-600' 
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
              onClick={() => onUpdateSettings({ gameMode: 'multi' })}
            >
              多局
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;