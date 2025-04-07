import {
  StyleSheet,
  Text,
  View,
  Modal,
  Image,
  TouchableOpacity,
} from "react-native";
import React, {useEffect} from "react";
import MapView, {PROVIDER_GOOGLE} from "react-native-maps";
import {useCheckIn} from "@/context/CheckInContext";
import {useAuth} from "@/context/AuthContext";
import NewIncidentModal from "@/components/modals/new-incident-modal";

export default function CheckInPage() {
  const {isOnline, setIsOnline} = useCheckIn();
  const {onLogout} = useAuth();

  const handleClick = () => {
    setIsOnline(!isOnline);
  };

  // useEffect(() => {
  //   onLogout!();
  // }, []);

  return (
    <View style={styles.container}>
      <NewIncidentModal />
      {/* <MapView style={styles.map} provider={PROVIDER_GOOGLE} /> */}

      {/* <Modal transparent visible={true} animationType="fade">
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
                source={require("@/assets/images/AMBU.png")}
                style={{width: 80, height: 40, marginRight: 10}}
              />
              <Text style={styles.title}>AMBU 123</Text>
            </View>
            <Text style={styles.subtitle}>Bantay Mandaue Command Center</Text>
            <View style={styles.statusContainer}>
              <Text
                style={[
                  styles.statusText,
                  {color: isOnline ? "#8BC34A" : "#FF6B6B"},
                ]}>
                {isOnline ? "ONLINE" : "OFFLINE"}
              </Text>
              <Text style={styles.message}>
                {!isOnline
                  ? "Please Check In to Recieve Dispatch"
                  : "On Active Standby, Waiting for Dispatch"}
              </Text>
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
          </View>
        </View>
      </Modal> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
