"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { socket } from '@/app/socket';
import Header from '@/components/Header';
import GameBoard from '@/components/rooms/GameBoard';
import SettingsPanel from '@/components/rooms/SettingsPanel';
import InfoPanel from '@/components/rooms/InfoPanel';
import SpectatorsList from '@/components/rooms/SpectatorsList';
import ReadyButton from '@/components/ReadyButton';

interface Player {
  id: string;
  username: string;
  position: number | null;
  isReady: boolean;
  isOwner: boolean;
  team: string | null;
}

interface RoomState {
  roomId: string;
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
  const [roomState, setRoomState] = useState<RoomState>({
    roomId: Array.isArray(roomId) ? roomId[0] : roomId,
    players: {},
    spectators: [],
    settings: defaultSettings,
    readyCount: 0,
    owner: null
  });
  const [playerId, setPlayerId] = useState<string>('');

  // 加入房间
  useEffect(() => {
    if (!roomId) return;

    const randomName = `玩家${Math.floor(1000 + Math.random() * 9000)}`;
    const playerName = randomName;

    // 加入房间
    socket.connect();
    socket.emit('joinRoom', { 
      roomId, 
      username: playerName
    });

    // 设置玩家ID
    setPlayerId(socket.id);

    // 监听房间更新
    socket.on('roomUpdate', (data: RoomState) => {
      setRoomState(prev => ({
        ...prev,
        ...data,
        readyCount: Object.values(data.players)
          .filter(player => player.isReady && player.position !== null)
          .length
      }));
    });

    // 监听游戏开始
    socket.on('gameStarted', () => {
      router.push(`/game/${roomId}`);
    });

    // 监听错误
    socket.on('error', (msg: string) => {
      console.error(msg);
    });

    return () => {
      socket.off('roomUpdate');
      socket.off('gameStarted');
      socket.off('error');
      socket.disconnect();
    };
  }, [roomId, router]);

  // 获取当前玩家信息
  const currentPlayer = roomState.players[playerId];
  const isSeated = currentPlayer && currentPlayer.position !== null;
  const isReady = currentPlayer?.isReady || false;
  const isOwner = currentPlayer?.isOwner || false;

  // 获取观众列表
  const spectators = roomState.spectators.map(id => roomState.players[id]).filter(Boolean);
  
  // 获取座位玩家
  const seatedPlayers = Object.values(roomState.players).filter(
    player => player.position !== null
  );
  
  // 是否可以开始游戏
  const canStartGame = isOwner && roomState.readyCount === 4 && seatedPlayers.length === 4;

  // 事件处理函数
  const handleTakeSeat = (position: number) => {
    socket.emit('takeSeat', { position });
  };

  const handleLeaveSeat = () => {
    socket.emit('leaveSeat');
  };

  const handleToggleReady = () => {
    socket.emit('toggleReady');
  };

  const handleUpdateSettings = (newSettings: Partial<RoomState['settings']>) => {
    socket.emit('updateSettings', newSettings);
  };

  const handleStartGame = () => {
    socket.emit('startGame');
  };

  const handleLeaveRoom = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <Header roomId={roomState.roomId} onLeave={handleLeaveRoom} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          {/* 左侧控制面板 */}
          <div className="md:col-span-1 space-y-4">
            <SettingsPanel 
              settings={roomState.settings} 
              isOwner={isOwner}
              onUpdateSettings={handleUpdateSettings} 
            />
            
            <InfoPanel 
              seatedPlayers={seatedPlayers.length}
              readyCount={roomState.readyCount}
              settings={roomState.settings}
            />
            
            <SpectatorsList 
              spectators={spectators} 
              currentPlayerId={playerId} 
            />
          </div>
          
          {/* 主游戏区域 */}
          <div className="md:col-span-2">
            <GameBoard 
              roomState={roomState} 
              currentPlayerId={playerId}
              onTakeSeat={handleTakeSeat}
              onLeaveSeat={handleLeaveSeat}
            />
            
            <ReadyButton 
              isReady={isReady}
              readyCount={roomState.readyCount}
              isSeated={isSeated}
              isOwner={isOwner}
              canStartGame={canStartGame}
              onToggleReady={handleToggleReady}
              onStartGame={handleStartGame}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;