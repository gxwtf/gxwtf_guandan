import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

export const createSocketConnection = (roomId: string) => {
    const socket = io(SOCKET_URL, {
        autoConnect: false,
        reconnection: true,
        transports: ['websocket']
    });

    socket.connect();
    socket.emit('joinRoom', roomId);

    return {
        socket,
        disconnect: () => {
            socket.disconnect();
        }
    };
};