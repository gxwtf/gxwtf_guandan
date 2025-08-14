"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { socket } from '@/app/socket';

interface Player {
  id: string;
  username: string;
  position: number | null;
  isReady: boolean;
  isOwner: boolean;
  team: string | null;
}

interface RoomState {
  players: Record<string, Player>;
  spectators: string[];
  settings: {
    timeLimit: number;
    tribute: boolean;
    gameMode: string;
    unlimitedTime: boolean;
  };
  readyCount: number;
  owner: number | null;
}

const defaultSettings = {
  timeLimit: 30,
  tribute: true,
  gameMode: 'multi',
  unlimitedTime: false
};

const GameRoom = () => {
  const { roomId } = useParams();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [roomState, setRoomState] = useState<RoomState>({
    players: {},
    spectators: [],
    settings: defaultSettings,
    readyCount: 0,
    owner: null
  });
  const [playerId, setPlayerId] = useState('');

  // 随机生成一个用户名
  useEffect(() => {
    const randomName = `玩家${Math.floor(Math.random() * 1000)}`;
    setUsername(randomName);
  }, []);

  // 连接到Socket.IO
  useEffect(() => {
    if (!roomId || !username) return;

    // 生成随机的玩家头像颜色
    const avatarColors = [
      'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 
      'bg-purple-400', 'bg-pink-400', 'bg-indigo-400'
    ];
    const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    // 加入房间
    socket.emit('joinRoom', { 
      roomId, 
      username,
      avatarColor: randomColor
    });

    // 设置玩家ID
    setPlayerId(socket.id);

    // 监听房间更新
    const handleRoomUpdate = (data: RoomState) => {
      setRoomState(data);
    };

    // 监听游戏开始
    const handleGameStart = () => {
      // 实际游戏开始后可以跳转到游戏页面
      // router.push(`/game/${roomId}`);
      alert('游戏开始！');
    };

    // 监听错误信息
    const handleError = (msg: string) => {
      alert(`错误: ${msg}`);
    };

    socket.on('roomUpdate', handleRoomUpdate);
    socket.on('gameStarted', handleGameStart);
    socket.on('error', handleError);

    return () => {
      socket.off('roomUpdate', handleRoomUpdate);
      socket.off('gameStarted', handleGameStart);
      socket.off('error', handleError);
      socket.disconnect();
    };
  }, [roomId, username, router]);

  // 占座功能
  const takeSeat = (position: number) => {
    socket.emit('takeSeat', { position });
  };

  // 离座功能
  const leaveSeat = () => {
    socket.emit('leaveSeat');
  };

  // 准备状态切换
  const toggleReady = () => {
    socket.emit('toggleReady');
  };

  // 更新房间设置（仅房主可用）
  const updateSettings = (newSettings: Partial<RoomState['settings']>) => {
    socket.emit('updateSettings', newSettings);
  };

  // 开始游戏（仅房主可用）
  const startGame = () => {
    socket.emit('startGame');
  };

  // 获取当前玩家的信息
  const currentPlayer = roomState.players[playerId];
  
  // 计算就座的玩家
  const seatedPlayers = Object.values(roomState.players).filter(
    player => player.position !== null
  );

  // 计算空座位
  const allPositions = [1, 2, 3, 4];
  const occupiedPositions = seatedPlayers.map(p => p.position);
  const availablePositions = allPositions.filter(
    pos => !occupiedPositions.includes(pos)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* 顶部导航 */}
        <header className="flex justify-between items-center py-4 border-b border-slate-700 mb-8">
          <h1 className="text-2xl font-bold">掼蛋房间: {roomId}</h1>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            离开房间
          </button>
        </header>

        {/* 主游戏区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 座位区域 */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-6 text-center">座位区域</h2>
              
              {/* 游戏座位布局 */}
              <div className="relative h-[500px]">
                {/* 顶部座位 (1号和2号) */}
                <div className="flex justify-center space-x-32 mb-16">
                  {[1, 2].map(pos => (
                    <Seat 
                      key={pos}
                      position={pos}
                      player={seatedPlayers.find(p => p.position === pos)}
                      currentPlayer={currentPlayer}
                      availablePositions={availablePositions}
                      onTakeSeat={takeSeat}
                      onLeaveSeat={leaveSeat}
                    />
                  ))}
                </div>
                
                {/* 游戏区域中心 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-40 h-40 rounded-full border-4 border-yellow-500/30 flex items-center justify-center">
                    <span className="text-sm text-slate-400">房间ID: {roomId}</span>
                  </div>
                </div>
                
                {/* 底部座位 (3号和4号) */}
                <div className="flex justify-center space-x-32 mt-16">
                  {[3, 4].map(pos => (
                    <Seat 
                      key={pos}
                      position={pos}
                      player={seatedPlayers.find(p => p.position === pos)}
                      currentPlayer={currentPlayer}
                      availablePositions={availablePositions}
                      onTakeSeat={takeSeat}
                      onLeaveSeat={leaveSeat}
                    />
                  ))}
                </div>
                
                {/* 队友连线 */}
                <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-t-2 border-pink-500/30 border-dashed pointer-events-none"></div>
                <div className="absolute top-3/4 left-1/4 w-1/2 h-1/2 border-t-2 border-blue-500/30 border-dashed pointer-events-none"></div>
              </div>
            </div>
            
            {/* 准备按钮 */}
            <div className="mt-6 flex justify-center">
              {currentPlayer?.position !== null ? (
                <button
                  onClick={toggleReady}
                  disabled={roomState.readyCount === 4 && seatedPlayers.length === 4}
                  className={`px-8 py-4 rounded-full text-lg font-bold w-full max-w-md transition-all ${
                    currentPlayer?.isReady
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } ${roomState.readyCount === 4 && seatedPlayers.length === 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {currentPlayer?.isReady ? '取消准备' : '准备游戏'}
                  <span className="ml-2 bg-black/30 px-3 py-1 rounded-full">
                    已准备: {roomState.readyCount}/4
                  </span>
                </button>
              ) : (
                <p className="text-center text-slate-400 py-4">您当前是观战者，请选择一个位置加入游戏</p>
              )}
              
              {/* 房主开始游戏按钮 */}
              {currentPlayer?.isOwner && roomState.readyCount === 4 && seatedPlayers.length === 4 && (
                <button
                  onClick={startGame}
                  className="ml-4 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-full text-lg font-bold animate-pulse"
                >
                  开始游戏 ▶
                </button>
              )}
            </div>
          </div>
          
          {/* 控制面板 */}
          <div>
            {/* 房主设置面板 */}
            {currentPlayer?.isOwner && (
              <div className="bg-slate-800/50 rounded-xl p-6 shadow-lg mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="w-3 h-3 bg-amber-400 rounded-full mr-2"></span>
                  房主设置
                </h3>
                
                <div className="space-y-4">
                  <SettingItem 
                    label="思考时间" 
                    value={roomState.settings.unlimitedTime ? '无限制' : `${roomState.settings.timeLimit}秒`}
                  >
                    <div className="flex items-center space-x-2">
                      <button 
                        className="px-3 py-1 bg-slate-700 rounded hover:bg-slate-600"
                        onClick={() => updateSettings({ timeLimit: Math.max(10, roomState.settings.timeLimit - 5) })}
                      >
                        -
                      </button>
                      <input 
                        type="range" 
                        min="10" 
                        max="90" 
                        step="5"
                        value={roomState.settings.timeLimit}
                        onChange={e => updateSettings({ timeLimit: parseInt(e.target.value) })}
                        className="w-full"
                        disabled={roomState.settings.unlimitedTime}
                      />
                      <button 
                        className="px-3 py-1 bg-slate-700 rounded hover:bg-slate-600"
                        onClick={() => updateSettings({ timeLimit: Math.min(90, roomState.settings.timeLimit + 5) })}
                      >
                        +
                      </button>
                    </div>
                    <div className="mt-2 flex items-center">
                      <label className="flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={roomState.settings.unlimitedTime}
                          onChange={() => updateSettings({ unlimitedTime: !roomState.settings.unlimitedTime })}
                          className="mr-2 h-4 w-4"
                        />
                        <span className="text-sm">无时间限制</span>
                      </label>
                    </div>
                  </SettingItem>
                  
                  <SettingItem 
                    label="进贡规则" 
                    value={roomState.settings.tribute ? '开启' : '关闭'}
                  >
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={roomState.settings.tribute}
                        onChange={() => updateSettings({ tribute: !roomState.settings.tribute })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      <span className="ml-3 text-sm">
                        {roomState.settings.tribute ? '开启' : '关闭'}
                      </span>
                    </label>
                  </SettingItem>
                  
                  <SettingItem 
                    label="游戏模式" 
                    value={roomState.settings.gameMode === 'single' ? '单局' : '多局'}
                  >
                    <div className="flex space-x-2">
                      <button 
                        className={`px-3 py-1 rounded transition ${
                          roomState.settings.gameMode === 'single' 
                            ? 'bg-blue-600' 
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                        onClick={() => updateSettings({ gameMode: 'single' })}
                      >
                        单局
                      </button>
                      <button 
                        className={`px-3 py-1 rounded transition ${
                          roomState.settings.gameMode === 'multi' 
                            ? 'bg-blue-600' 
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                        onClick={() => updateSettings({ gameMode: 'multi' })}
                      >
                        多局
                      </button>
                    </div>
                  </SettingItem>
                </div>
              </div>
            )}
            
            {/* 玩家信息面板 */}
            <div className="bg-slate-800/50 rounded-xl p-6 shadow-lg mb-8">
              <h3 className="text-lg font-semibold mb-4">房间信息</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm">玩家数量</p>
                  <p className="text-xl font-bold">{seatedPlayers.length}/4</p>
                </div>
                
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm">准备状态</p>
                  <p className="text-xl font-bold">{roomState.readyCount}/4</p>
                </div>
                
                <div className="bg-slate-700/50 p-4 rounded-lg col-span-2">
                  <p className="text-slate-400 text-sm">思考时间</p>
                  <p className="text-lg font-bold">
                    {roomState.settings.unlimitedTime 
                      ? '无限制' 
                      : `${roomState.settings.timeLimit}秒`
                    }
                  </p>
                </div>
              </div>
            </div>
            
            {/* 观战者面板 */}
            {roomState.spectators.length > 0 && (
              <div className="bg-slate-800/50 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  观战者 <span className="ml-2 bg-slate-700 px-2 py-1 rounded-full text-xs">{roomState.spectators.length}</span>
                </h3>
                
                <div className="space-y-2">
                  {roomState.spectators.map((spectatorId, index) => {
                    const spectator = roomState.players[spectatorId];
                    return (
                      <div key={index} className="flex items-center p-2 rounded-lg hover:bg-slate-700/50">
                        <div className="w-8 h-8 rounded-full bg-slate-600 mr-3"></div>
                        <span className="text-sm truncate">{spectator?.username || '玩家'}</span>
                        {playerId === spectatorId && (
                          <span className="ml-auto bg-slate-700 px-2 py-0.5 rounded text-xs">我</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 座位组件
const Seat = ({ position, player, currentPlayer, availablePositions, onTakeSeat, onLeaveSeat }: any) => {
  const isCurrentPlayer = player?.id === currentPlayer?.id;
  const isEmpty = !player;
  const isAvailable = availablePositions.includes(position);
  const teamColors = position <= 2 ? 'border-pink-500' : 'border-blue-500';
  
  // 根据位置确定座位方向
  const seatRotation = position % 2 === 0 ? 'rotate-180' : '';

  return (
    <div className={`w-32 h-32 relative ${seatRotation}`}>
      {player ? (
        <div className={`h-full rounded-xl ${teamColors} border-4 flex flex-col items-center justify-center bg-slate-900/70 p-4 relative group`}>
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-slate-800 px-3 py-1 rounded-full text-xs font-bold">
            {position}号位
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-slate-700 mb-2 overflow-hidden">
              {player.id && (
                <div className="w-full h-full flex items-center justify-center text-lg font-bold">
                  {player.username.slice(0, 2)}
                </div>
              )}
            </div>
            
            <div className="text-center">
              <p className="font-bold text-sm truncate w-24">{player.username}</p>
              {player.isReady ? (
                <span className="text-xs bg-green-800/80 px-2 py-0.5 rounded-full">已准备</span>
              ) : (
                <span className="text-xs bg-slate-700/80 px-2 py-0.5 rounded-full">未准备</span>
              )}
            </div>
            
            {player.isOwner && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400"></div>
            )}
          </div>
          
          {isCurrentPlayer && (
            <button 
              onClick={onLeaveSeat}
              className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-red-600 hover:bg-red-700 px-4 py-1 rounded-full text-xs hidden group-hover:block transition"
            >
              离开座位
            </button>
          )}
        </div>
      ) : (
        <div className={`h-full rounded-xl border-4 ${teamColors} flex items-center justify-center bg-slate-900/30 relative group ${isAvailable ? 'cursor-pointer' : ''}`}>
          {isAvailable ? (
            <button 
              onClick={() => onTakeSeat(position)}
              className="flex flex-col items-center"
            >
              <div className="text-4xl">+</div>
              <div className="mt-2">加入位置</div>
            </button>
          ) : (
            <span className="text-slate-500">座位已满</span>
          )}
        </div>
      )}
    </div>
  );
};

// 设置项组件
const SettingItem = ({ label, value, children }: { label: string, value: string | number, children: React.ReactNode }) => {
  return (
    <div className="border-b border-slate-700 pb-4 last:border-0 last:pb-0">
      <div className="flex justify-between items-start">
        <div className="w-1/3">
          <label className="block font-medium text-slate-300">{label}</label>
          <div className="text-sm text-slate-500 mt-1">{value}</div>
        </div>
        <div className="w-2/3">
          {children}
        </div>
      </div>
    </div>
  );
};

export default GameRoom;