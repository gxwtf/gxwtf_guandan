'use client';
import React from 'react';
import { useEffect, useState } from 'react';
import { socket } from '@/app/socket';

export default function RoomPage({
  params
}: {
  params: Promise<{ roomId: string }>
}) {
  const resolvedParams = React.use(params);
  const roomId = resolvedParams.roomId;
  const [players, setPlayers] = useState(0);

  useEffect(() => {
    const handlePlayerJoined = (data: { totalPlayers: number; playerId: string }) => {
      setPlayers(data.totalPlayers);
      console.log(`新玩家加入: ${data.playerId}`);
    };

    const handlePlayerLeft = (data: { totalPlayers: number; playerId: string }) => {
      setPlayers(data.totalPlayers);
      console.log(`玩家离开: ${data.playerId}`);
    };

    socket.on('playerJoined', handlePlayerJoined);
    socket.on('playerLeft', handlePlayerLeft);

    return () => {
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('playerLeft', handlePlayerLeft);
    };
  }, [roomId]);

  return (
    <div>
      <h1>房间ID：{roomId}</h1>
      <p>当前人数：{players}</p>
    </div>
  );
}