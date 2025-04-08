import {
  StyleSheet,
  Text,
  View,
  Modal,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import React, {useState, useEffect, useRef} from "react";
import {useIncident} from "@/context/IncidentContext";
import {useCheckIn} from "@/context/CheckInContext";
import all from "@/utils/getIcon";
import {useShakeAnimation} from "@/hooks/useShakeAnimation";
import DenyIncidentModal from "./deny-incident-modal";
import {useRouter} from "expo-router";

export default function NewIncidentModal() {
  const {incidentState, setCurrentIncident, clearIncident} = useIncident();
  const {isOnline} = useCheckIn();
  const [visible, setVisible] = useState(false);
  const [currentIncident, setCurrentIncidentState] = useState<any>(null);
  const shakeStyle = useShakeAnimation(visible);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [isDenying, setIsDenying] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isOnline || isDenying) {
      setVisible(false);
      return;
    }

    const fetchRecentIncident = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/incidents/responder/recent`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setVisible(false);
            return;
          }
          throw new Error(`Server responded with ${response.status}`);
        }

        const data = await response.json();
        setCurrentIncidentState(data);
        setVisible(true);

        if (setCurrentIncident) {
          await setCurrentIncident({
            emergencyType: data.incidentType,
            channelId: data.channelId,
            incidentId: data._id,
            dispatcher: data.dispatcher,
            timestamp: new Date(data.createdAt).getTime(),
            location: {
              lat: data.incidentDetails?.coordinates?.lat,
              lon: data.incidentDetails?.coordinates?.lon,
            },
          });
        }
      } catch (error) {
        console.error("Error fetching recent incident:", error);
        setVisible(false);
      }
    };

    const intervalId = setInterval(fetchRecentIncident, 3000);
    fetchRecentIncident();

    return () => {
      clearInterval(intervalId);
    };
  }, [isOnline, setCurrentIncident, currentIncident, isDenying]);

  const handleDeny = async () => {
    setIsDenying(true);
    setVisible(false);
    setShowDenyModal(true);
  };

  const handleRespond = async () => {
    if (setCurrentIncident && currentIncident) {
      await setCurrentIncident({
        emergencyType: currentIncident.incidentType,
        channelId: currentIncident.channelId,
        incidentId: currentIncident._id,
        dispatcher: currentIncident.dispatcher,
        timestamp: new Date(currentIncident.createdAt).getTime(),
        location: {
          lat: currentIncident.incidentDetails?.coordinates?.lat,
          lon: currentIncident.incidentDetails?.coordinates?.lon,
        },
      });
      router.replace("/(responding)");
      setVisible(false);
    }
  };

  return (
    <>
      {!isDenying && visible && currentIncident && (
        <Modal transparent visible={visible} animationType="fade">
          <View style={styles.modalContainer}>
            <Animated.View style={[styles.modalContent, shakeStyle]}>
              <View style={styles.header}>
                <Text style={styles.headerText}>NEW INCIDENT</Text>
              </View>
              <View
                style={[
                  styles.incidentDetails,
                  {
                    backgroundColor: all.getIncidentTypeColor(
                      currentIncident?.incidentType
                    ),
                  },
                ]}>
                <Image
                  source={all.getEmergencyIcon(currentIncident?.incidentType)}
                  style={styles.icon}
                />
                <View>
                  <Text style={styles.incidentType}>
                    {currentIncident.incidentType?.toUpperCase()}
                  </Text>
                  <Text style={styles.incidentLocation}>
                    {currentIncident.location?.address ||
                      "Location unavailable"}
                  </Text>
                </View>
              </View>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.respondButton}
                  onPress={handleRespond}>
                  <Text style={styles.buttonText}>Respond</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.denyButton}
                  onPress={handleDeny}>
                  <Text style={styles.buttonText}>Deny</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      )}
      <DenyIncidentModal
        visible={showDenyModal}
        onClose={() => {
          setShowDenyModal(false);
          setIsDenying(false);
        }}
        onConfirm={() => {
          if (clearIncident) {
            clearIncident();
          }
          setShowDenyModal(false);
          setIsDenying(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#34495e",
    borderRadius: 5,
    width: "90%",
    alignItems: "center",
    paddingVertical: 20,
  },
  header: {
    backgroundColor: "#FF6B6B",
    width: "100%",
    padding: 10,
    alignItems: "center",
  },
  headerText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  incidentDetails: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    width: "100%",
  },
  icon: {
    width: 80,
    height: 50,
    marginRight: 10,
  },
  incidentType: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  incidentLocation: {
    color: "white",
    fontSize: 14,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 20,
  },
  respondButton: {
    flex: 3,
    backgroundColor: "#8BC34A",
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  denyButton: {
    flex: 2,
    backgroundColor: "#FF6B6B",
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
