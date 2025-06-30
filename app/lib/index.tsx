import {
  StyleSheet,
  Text,
  View,
  Modal,
  Image,
  TouchableOpacity,
} from "react-native";
import React, {useEffect} from "react";
import {useCheckIn} from "@/context/checkInContext";
import {useAuthStore, useIncidentStore} from "@/context";
import {useWebSocket} from "@/context/webSocketContext";
import NewIncidentModal from "@/components/modals/new-incident-modal";
import {clearDeniedIncidents} from "@/api/incidents/useFetchIncident";
import {useFetchResponder} from "@/api/users/useFetchResponder";
import {useAssignmentIcon} from "@/hooks/useAssignmentIcon";
import {useSound} from "@/utils/PlaySound";
import {logInfo, logWarn} from "@/utils/logger";
import {router} from "expo-router";

export default function CheckInPage() {
  const {isOnline, setIsOnline} = useCheckIn();
  const {user_id, logout} = useAuthStore();
  const {isConnected} = useWebSocket();
  const {data: responderData} = useFetchResponder(user_id || "");
  const assignmentIcon = useAssignmentIcon();
  const {incidentState} = useIncidentStore();

  const medicalSound = useSound(require("@/assets/sounds/ambulance.mp3"));
  const policeSound = useSound(require("@/assets/sounds/police.mp3"));
  const fireSound = useSound(require("@/assets/sounds/fire.mp3"));
  const generalSound = useSound(require("@/assets/sounds/general.mp3"));

  const handleClick = () => {
    const newStatus = !isOnline;
    logInfo(
      "CHECKIN",
      `Responder ${newStatus ? "checking in" : "checking out"}`,
      {
        responderId: user_id,
        newStatus,
      }
    );
    setIsOnline(newStatus);
  };

  // status msg based on online status and WebSocket connection
  const getStatusMessage = () => {
    if (!isOnline) {
      return "Please Check In to Receive Dispatch";
    }
    if (!isConnected) {
      return "Connecting to Dispatch System...";
    }
    return "On Active Standby, Waiting for Dispatch";
  };

  const getStatusColor = () => {
    if (!isOnline) return "#FF6B6B";
    if (!isConnected) return "#FFA500";
    return "#8BC34A";
  };

  useEffect(() => {
    if (incidentState) {
      router.push("/(responding)");
    }
  }, []);

  return (
    <View style={styles.container}>
      {isOnline && (
        <NewIncidentModal
          sounds={{
            medical: medicalSound,
            police: policeSound,
            fire: fireSound,
            general: generalSound,
          }}
        />
      )}
      {/* <MapView style={styles.map} provider={PROVIDER_GOOGLE} /> */}

      <Modal transparent visible={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}>
              <Image
                source={assignmentIcon}
                style={{width: 100, height: 50}}
                resizeMode="contain"
              />
              <Text style={styles.title}>
                {responderData?.firstName} {responderData?.lastName}
              </Text>
            </View>
            <Text style={styles.subtitle}>Bantay Mandaue Command Center</Text>
            <View style={styles.statusContainer}>
              <Text style={[styles.statusText, {color: getStatusColor()}]}>
                {isOnline ? "ONLINE" : "OFFLINE"}
              </Text>
              <Text style={styles.message}>{getStatusMessage()}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.checkInButton,
                {backgroundColor: isOnline ? "#FF6B6B" : "#8BC34A"},
              ]}
              onPress={handleClick}>
              <Text style={styles.buttonText}>
                {isOnline ? "Check-Out" : "Check-In"}
              </Text>
            </TouchableOpacity>
            {!isOnline && (
              <>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    logInfo("TESTING", "Clearing denied incidents list");
                    clearDeniedIncidents();
                  }}>
                  <Text style={styles.clearButtonWarning}>
                    *For testing purposes only
                  </Text>
                  <Text style={styles.clearButtonText}>
                    CLEAR DENIED INCIDENTS LIST
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    logInfo("AUTH", "User logging out");
                    logout();
                  }}>
                  <Text style={styles.clearButtonText}>LOGOUT</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  clearButton: {
    backgroundColor: "#E5E4E2",
    padding: 8,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  clearButtonWarning: {
    fontSize: 12,
    fontWeight: "500",
    color: "red",
    fontStyle: "italic",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 5,
    width: "90%",
    alignItems: "center",
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginVertical: 15,
  },
  statusContainer: {
    backgroundColor: "#34495e",
    padding: 15,
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },
  statusText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  message: {
    color: "white",
    fontSize: 14,
    marginBottom: 5,
  },
  checkInButton: {
    backgroundColor: "#8BC34A",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
