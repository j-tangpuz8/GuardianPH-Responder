import {logWebSocket, logError, logInfo} from "@/utils/logger";
import {Incident} from "@/types/incident";

export interface AssignmentResponse {
  incidentId: string;
  responderId: string;
  dispatcherId: string;
  accepted: boolean;
  reason?: string;
}

export interface AssignmentRequest {
  incident: Incident;
  dispatcherId: string;
  responderId: string;
  message: string;
}

export const sendAssignmentResponse = (
  socket: any,
  response: AssignmentResponse
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!socket || !socket.connected) {
      const error = new Error("Socket not connected");
      logError(
        "WEBSOCKET_API",
        "Cannot send assignment response - socket not connected",
        error
      );
      reject(error);
      return;
    }

    try {
      logWebSocket("API", "Sending assignment response", response);

      socket.emit("respondToAssignment", response);

      logInfo(
        "WEBSOCKET_API",
        "Assignment response sent successfully",
        response
      );
      resolve();
    } catch (error) {
      logError("WEBSOCKET_API", "Error sending assignment response", error);
      reject(error);
    }
  });
};

export const sendHeartbeat = (
  socket: any,
  responderId: string
): Promise<void> => {
  return new Promise((resolve) => {
    if (!socket || !socket.connected) {
      resolve();
      return;
    }

    try {
      socket.emit("heartbeat", {responderId, timestamp: Date.now()});
      resolve();
    } catch (error) {
      logError("WEBSOCKET_API", "Error sending heartbeat", error);
      resolve();
    }
  });
};

// request status of server
export const requestStatus = (
  socket: any,
  responderId: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!socket || !socket.connected) {
      const error = new Error("Socket not connected");
      logError(
        "WEBSOCKET_API",
        "Cannot request status - socket not connected",
        error
      );
      reject(error);
      return;
    }

    try {
      logWebSocket("API", "Requesting status from server", {responderId});

      socket.emit("requestStatus", {responderId}, (response: any) => {
        if (response && response.success) {
          logInfo("WEBSOCKET_API", "Status request successful", response);
          resolve(response.data);
        } else {
          const error = new Error(response?.error || "Failed to get status");
          logError("WEBSOCKET_API", "Status request failed", error);
          reject(error);
        }
      });

      setTimeout(() => {
        const error = new Error("Status request timeout");
        logError("WEBSOCKET_API", "Status request timeout", error);
        reject(error);
      }, 5000);
    } catch (error) {
      logError("WEBSOCKET_API", "Error requesting status", error);
      reject(error);
    }
  });
};
