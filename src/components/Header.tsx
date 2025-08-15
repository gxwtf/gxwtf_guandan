import React from 'react';

interface HeaderProps {
  roomId: string;
  onLeave: () => void;
}

const Header: React.FC<HeaderProps> = ({ roomId, onLeave }) => {
  return (
    <div className="flex justify-between items-center py-4">
      <div>
        <h1 className="text-xl font-bold">广学掼蛋</h1>
        <div className="text-slate-400 text-sm">房间号: {roomId}</div>
      </div>
      <button 
        onClick={onLeave}
        className="px-4 py-2 bg-gradient-to-r from-slate-700/60 to-slate-800/60 hover:from-slate-700/80 hover:to-slate-800/80 rounded-lg transition border border-slate-700/50 text-sm flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
        </svg>
        离开房间
      </button>
    </div>
  );
};

export default Header;