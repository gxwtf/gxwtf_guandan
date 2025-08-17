'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { socket } from '@/app/socket';
import Header from '@/components/Header';
import GameBoard from '@/components/room/GameBoard';
import SettingsPanel from '@/components/room/SettingsPanel';
import InfoPanel from '@/components/room/InfoPanel';
import SpectatorsList from '@/components/room/SpectatorsList';
import ReadyButton from '@/components/ReadyButton';

interface Player {
  id: string;
  username: string;
  position: number | null;
  isReady: boolean;
  isOwner: boolean;
  team: string | null;
  type?: string;
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

export default function RoomPage() {
  const { roomId } = useParams();
  const [roomState, setRoomState] = useState<RoomState>({
    roomId: Array.isArray(roomId) ? roomId[0] : roomId,
    players: {},
    spectators: [],
    settings: defaultSettings,
    readyCount: 0,
    owner: null
  });
  const [playerId, setPlayerId] = useState<string>('');
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [gameState, setGameState] = useState<any>(null);

  useEffect(() => {
    if (!roomId) return;

    const randomName = `玩家${Math.floor(1000 + Math.random() * 9000)}`;
    socket.connect();
    socket.emit('joinRoom', { roomId, username: randomName });
    setPlayerId(socket.id);

    socket.on('roomUpdate', (data: RoomState) => {
      const newSpectators = Object.entries(data.players)
        .filter(([_, player]) => player.type === 'spectator')
        .map(([id]) => id);
      
      setRoomState(prev => ({
        ...prev,
        ...data,
        spectators: newSpectators,
        readyCount: Object.values(data.players)
          .filter(player => player.isReady && player.position !== null).length
      }));
    });

    socket.on('gameStarted', (initialGameState) => {
      setIsGameStarted(true);
      setGameState(initialGameState);
    });

    return () => {
      socket.off('roomUpdate');
      socket.off('gameStarted');
      socket.disconnect();
    };
  }, [roomId]);

  const renderGameInterface = () => (
    <div className="game-container min-h-screen bg-slate-800 text-white p-4">
      <Header roomId={roomState.roomId} />
      
      {/* 对手区域 */}
      <div className="opponent-area mb-20">
        <div className="flex justify-center gap-8">
          {[1, 2, 3].map(pos => (
            <div key={pos} className="w-32 h-48 bg-slate-700 rounded-lg">
              {pos === 1 && '左对手'}
              {pos === 2 && '上对手'}
              {pos === 3 && '右对手'}
            </div>
          ))}
        </div>
      </div>

      {/* 游戏中央区域 */}
      <div className="game-center mb-20 text-center">
        <div className="played-cards flex justify-center gap-4 mb-8">
          {/* 出牌区域 */}
        </div>
        <div className="timer text-2xl mb-4">剩余时间：30秒</div>
        <div className="level text-xl">当前等级：2</div>
      </div>

      {/* 玩家区域 */}
      <div className="player-area fixed bottom-0 left-0 right-0 bg-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="hand-cards flex gap-2 mb-4">
            {['♠2', '♥5', '♣K', '♦10', '小王', '大王'].map((card, i) => (
              <div key={i} className="w-20 h-28 bg-white text-black rounded-lg flex items-center justify-center">
                {card}
              </div>
            ))}
          </div>
          <div className="controls flex gap-4 justify-center">
            <button className="px-6 py-2 bg-blue-600 rounded-lg">出牌</button>
            <button className="px-6 py-2 bg-red-600 rounded-lg">不出</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRoomInterface = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <Header roomId={roomState.roomId} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          <div className="md:col-span-1 space-y-4">
            <SettingsPanel
              settings={roomState.settings}
              isOwner={roomState.players[playerId]?.isOwner}
              onUpdateSettings={(newSettings) => socket.emit('updateSettings', newSettings)}
            />
            <InfoPanel
              seatedPlayers={Object.values(roomState.players).filter(p => p.position !== null).length}
              readyCount={roomState.readyCount}
              settings={roomState.settings}
            />
            <SpectatorsList
              spectators={roomState.spectators.map(id => roomState.players[id])}
              currentPlayerId={playerId}
            />
          </div>
          
          <div className="md:col-span-2">
            <GameBoard
              roomState={roomState}
              currentPlayerId={playerId}
              onSeatChange={(newPosition) => socket.emit('seatChange', { newPosition })}
            />
            <ReadyButton
              isReady={roomState.players[playerId]?.isReady || false}
              readyCount={roomState.readyCount}
              isSeated={!!roomState.players[playerId]?.position}
              isOwner={roomState.players[playerId]?.isOwner}
              canStartGame={roomState.players[playerId]?.isOwner && roomState.readyCount === 4}
              onToggleReady={() => socket.emit('toggleReady')}
              onStartGame={() => socket.emit('startGame')}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return isGameStarted ? renderGameInterface() : renderRoomInterface();
}