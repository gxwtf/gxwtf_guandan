'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createSocketConnection } from '@/lib/socket';

export default function RoomPage() {
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        if (!id) return;

        const { socket, disconnect } = createSocketConnection(id as string);

        // 添加事件监听
        socket.on('userJoined', (data) => {
            console.log('新用户加入:', data);
        });

        return () => {
            disconnect();
        };
    }, [id]);

    return (
        <div>
            <h1>房间号：{id}</h1>
        </div>
    );
}