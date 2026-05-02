import { useEffect } from "react";
import { connectSocket, disconnectSocket } from "../services/socketService";

/**
 * 🔌 Custom Hook for WebSocket
 * @param {Function} onMessageReceived
 */
const useSocket = (onMessageReceived) => {
  
  useEffect(() => {
    // 🔌 Connect
    connectSocket(onMessageReceived);

    // 🔌 Disconnect on unmount
    return () => {
      disconnectSocket();
    };
  }, [onMessageReceived]);
};

export default useSocket;