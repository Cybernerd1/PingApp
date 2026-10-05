import { useEffect, useState } from 'react';
import { socketService } from '../services/socketService';

export function useSocket() {
  const [isConnected, setIsConnected] = useState<boolean>(socketService.isConnected());

  useEffect(() => {
    socketService.connect();

    const unsubscribe = socketService.on('connection_status', (data: { connected: boolean }) => {
      setIsConnected(data.connected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isConnected,
    sendMessage: socketService.sendMessage.bind(socketService),
    sendTyping: socketService.sendTyping.bind(socketService),
    sendReadReceipt: socketService.sendReadReceipt.bind(socketService),
    onSocketEvent: socketService.on.bind(socketService),
  };
}
