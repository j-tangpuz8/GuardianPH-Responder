import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import {io, Socket} from "socket.io-client";
import {useAuthStore} from "@/context";
import {useCheckIn} from "@/context/CheckInContext";
import {logWebSocket, logError, logInfo, logWarn} from "@/utils/logger";
import {Incident} from "@/types/incident";
import {sendAssignmentResponse} from "@/api/websocket/websocketApi";
import {CONFIG} from "@/constants/config";

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  pendingAssignment: Incident | null;
  respondToAssignment: (incidentId: string, accepted: boolean) => Promise<void>;
  clearPendingAssignment: () => void;
  leaveIncidentRoom: (incidentId: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider = ({children}: any) => {
  const {token, user_id} = useAuthStore();
  const {isOnline} = useCheckIn();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [pendingAssignment, setPendingAssignment] = useState<Incident | null>(
    null
  );
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const initializeSocket = useCallback(() => {
    if (!user_id || !isOnline) {
      logWebSocket(
        "CONNECTION",
        "Cannot initialize socket - missing user_id or not online",
        {
          userId: user_id,
          isOnline,
        }
      );
      return;
    }

    try {
      logWebSocket("CONNECTION", "Initializing socket connection", {
        url: CONFIG.SOCKET_URL,
      });

      const newSocket = io(CONFIG.SOCKET_URL, {
        auth: {
          userId: user_id,
          userType: "responder",
        },
        transports: ["websocket", "polling"],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: CONFIG.WEBSOCKET.RECONNECT_ATTEMPTS,
        reconnectionDelay: CONFIG.WEBSOCKET.RECONNECT_DELAY,
        reconnectionDelayMax: CONFIG.WEBSOCKET.RECONNECT_DELAY_MAX,
      });

      newSocket.on("connect", () => {
        logWebSocket("CONNECTION", "Socket connected successfully", {
          socketId: newSocket.id,
          userId: user_id,
        });
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        startHeartbeat(newSocket);
        if (user_id) {
          newSocket.emit("joinResponderRoom", {responderId: user_id});
        }
      });

      newSocket.on("disconnect", (reason) => {
        logWebSocket("CONNECTION", "Socket disconnected", {reason});
        setIsConnected(false);
        setPendingAssignment(null);
        stopHeartbeat();
        if (user_id) {
          newSocket.emit("leaveResponderRoom", {responderId: user_id});
        }
      });

      newSocket.on("connect_error", (error) => {
        logError("WEBSOCKET_CONNECTION", "Socket connection error", error);
        setIsConnected(false);
        stopHeartbeat();
      });

      newSocket.on("reconnect", (attemptNumber) => {
        logWebSocket("CONNECTION", "Socket reconnected", {attemptNumber});
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        startHeartbeat(newSocket);
      });

      newSocket.on("reconnect_attempt", (attemptNumber) => {
        logWarn("WEBSOCKET_CONNECTION", "Socket reconnection attempt", {
          attemptNumber,
        });
        reconnectAttemptsRef.current = attemptNumber;
      });

      newSocket.on("reconnect_failed", () => {
        logError(
          "WEBSOCKET_CONNECTION",
          "Socket reconnection failed after max attempts",
          {
            maxAttempts: CONFIG.WEBSOCKET.RECONNECT_ATTEMPTS,
          }
        );
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
  }, [user_id, isOnline]);

  const startHeartbeat = useCallback(
    (socketInstance: Socket) => {
      stopHeartbeat();

      heartbeatIntervalRef.current = setInterval(async () => {
        if (socketInstance && socketInstance.connected && user_id) {
          try {
            socketInstance.emit("ping", {
              responderId: user_id,
              timestamp: Date.now(),
            });
          } catch (error) {
            logWarn("WEBSOCKET_HEARTBEAT", "Heartbeat failed", error);
          }
        }
      }, CONFIG.WEBSOCKET.HEARTBEAT_INTERVAL);

      logWebSocket("HEARTBEAT", "Heartbeat started");
    },
    [user_id]
  );

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
      logWebSocket("HEARTBEAT", "Heartbeat stopped");
    }
  }, []);

  const leaveIncidentRoom = useCallback(
    (incidentId: string) => {
      if (socket && incidentId) {
        socket.emit("leaveIncidentRoom", {incidentId});
        logWebSocket("ROOM", "Left incident room", {incidentId});
      }
    },
    [socket]
  );

  // respond to assignment
  const respondToAssignment = useCallback(
    async (incidentId: string, accepted: boolean) => {
      if (!socket || !user_id) {
        logError(
          "WEBSOCKET_RESPONSE",
          "Cannot respond to assignment - socket or user not available",
          {
            hasSocket: !!socket,
            hasUserId: !!user_id,
          }
        );
        throw new Error("Socket or user not available");
      }

      try {
        logWebSocket("ASSIGNMENT", "Responding to assignment", {
          incidentId,
          accepted,
          responderId: user_id,
        });

        await sendAssignmentResponse(socket, {
          incidentId,
          responderId: user_id,
          dispatcherId: pendingAssignment?.dispatcherId || "unknown",
          accepted,
        });

        if (accepted && incidentId) {
          socket.emit("joinIncidentRoom", {incidentId});
          logWebSocket("ROOM", "Joined incident room", {incidentId});
        }

        setPendingAssignment(null);

        logInfo(
          "WEBSOCKET_ASSIGNMENT",
          "Assignment response sent successfully",
          {
            incidentId,
            accepted,
          }
        );
      } catch (error) {
        logError(
          "WEBSOCKET_RESPONSE",
          "Failed to respond to assignment",
          error
        );
        throw error;
      }
    },
    [socket, user_id, pendingAssignment]
  );

  // clear pending assignment
  const clearPendingAssignment = useCallback(() => {
    logWebSocket("ASSIGNMENT", "Clearing pending assignment");
    setPendingAssignment(null);
  }, []);

  useEffect(() => {
    if (user_id && isOnline) {
      initializeSocket();
    } else {
      if (socket) {
        logWebSocket(
          "CONNECTION",
          "Cleaning up socket connection - user offline or logged out"
        );
        if (user_id) {
          socket.emit("leaveResponderRoom", {responderId: user_id});
        }
        stopHeartbeat();
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setPendingAssignment(null);
      }
    }

    return () => {
      if (socket) {
        logWebSocket("CONNECTION", "Cleaning up socket connection on unmount");
        stopHeartbeat();
        socket.disconnect();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user_id, isOnline, initializeSocket, stopHeartbeat]);

  useEffect(() => {
    return () => {
      if (socket) {
        logWebSocket("CONNECTION", "Disconnecting socket on component unmount");
        stopHeartbeat();
        socket.disconnect();
      }
    };
  }, [socket, stopHeartbeat]);

  const value: WebSocketContextType = {
    socket,
    isConnected,
    pendingAssignment,
    respondToAssignment,
    clearPendingAssignment,
    leaveIncidentRoom,
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
