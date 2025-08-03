import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/context";
import { useCheckIn } from "@/context/CheckInContext";
import { logWebSocket, logError, logInfo, logWarn } from "@/utils/logger";
import { Incident } from "@/types/incident";
import { CONFIG } from "@/constants/config";

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  pendingAssignment: Incident | null;
  respondToAssignment: (incidentId: string, accepted: boolean) => Promise<void>;
  clearPendingAssignment: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider = ({ children }: any) => {
  const { token } = useAuthStore();
  const { isOnline } = useCheckIn();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [pendingAssignment, setPendingAssignment] = useState<Incident | null>(
    null
  );
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const initializeSocket = useCallback(() => {
    if (!token || !isOnline) {
      logWebSocket(
        "CONNECTION",
        "Cannot initialize socket - missing token or not online",
        { hasToken: !!token, isOnline }
      );
      return;
    }

    try {
      logWebSocket("CONNECTION", "Initializing socket connection...");

      const newSocket = io(CONFIG.SOCKET_URL, {
        auth: {
          token: token,
        },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      newSocket.on("connect", () => {
        logWebSocket("CONNECTION", "Socket connected successfully", { socketId: newSocket.id });
        setIsConnected(true);
        startHeartbeat(newSocket);
      });

      newSocket.on("disconnect", (reason) => {
        logWebSocket("CONNECTION", "Socket disconnected", { reason });
        setIsConnected(false);
        setPendingAssignment(null);
        stopHeartbeat();
      });

      newSocket.on("connect_error", (error) => {
        logError("WEBSOCKET_CONNECTION", "Socket connection error", error);
        setIsConnected(false);
        stopHeartbeat();
      });

      newSocket.on("assignmentRequest", (data) => {
        logWebSocket("ASSIGNMENT", "Received assignment request", data);
        setPendingAssignment(data.incident);
      });

      newSocket.on("assignmentAccepted", (data) => {
        logWebSocket("ASSIGNMENT", "Assignment accepted by server", data);
        setPendingAssignment(null);
      });

      newSocket.on("assignmentDeclined", (data) => {
        logWebSocket("ASSIGNMENT", "Assignment declined by server", data);
        setPendingAssignment(null);
      });

      newSocket.on("error", (error) => {
        logError("WEBSOCKET_GENERAL", "Socket error received", error);
      });

      setSocket(newSocket);
    } catch (error) {
      logError("WEBSOCKET_INIT", "Failed to initialize socket", error);
    }
  }, [token, isOnline]);

  const startHeartbeat = useCallback((socketInstance: Socket) => {
    stopHeartbeat();
    heartbeatIntervalRef.current = setInterval(() => {
      if (socketInstance && socketInstance.connected) {
        socketInstance.emit("ping", { timestamp: Date.now() });
      }
    }, CONFIG.WEBSOCKET.HEARTBEAT_INTERVAL);
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const respondToAssignment = useCallback(
    async (incidentId: string, accepted: boolean) => {
      if (!socket) {
        throw new Error("Socket not available");
      }
      try {
        logWebSocket("ASSIGNMENT", "Responding to assignment", { incidentId, accepted });

        socket.emit("respondToAssignment", {
          incidentId,
          accepted,
        });

        setPendingAssignment(null);
        logInfo("WEBSOCKET_ASSIGNMENT", "Assignment response sent successfully");
      } catch (error) {
        logError("WEBSOCKET_RESPONSE", "Failed to respond to assignment", error);
        throw error;
      }
    },
    [socket]
  );

  const clearPendingAssignment = useCallback(() => {
    logWebSocket("ASSIGNMENT", "Clearing pending assignment");
    setPendingAssignment(null);
  }, []);

  useEffect(() => {
    if (token && isOnline) {
      initializeSocket();
    } else if (socket) {
      logWebSocket("CONNECTION", "Cleaning up socket - user offline or logged out");
      socket.disconnect();
      setSocket(null);
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [token, isOnline, initializeSocket]);

  const value: WebSocketContextType = {
    socket,
    isConnected,
    pendingAssignment,
    respondToAssignment,
    clearPendingAssignment,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
