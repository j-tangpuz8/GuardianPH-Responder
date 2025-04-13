import {
  StyleSheet,
  Text,
  View,
  Modal,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import React, {useState, useEffect} from "react";
import {useIncident} from "@/context/IncidentContext";
import {useCheckIn} from "@/context/CheckInContext";
import all from "@/utils/getIcon";
import {useShakeAnimation} from "@/hooks/useShakeAnimation";
import DenyIncidentModal from "./deny-incident-modal";
import {useRouter} from "expo-router";
import {getAddressFromCoords} from "@/utils/geocoding";
import {assignResponder} from "@/api/incidents/useUpdateIncident";
import {fetchRecentIncident} from "@/api/incidents/useFetchIncident";
import {useAuth} from "@/context/AuthContext";
import useLocation from "@/hooks/useLocation";

export default function NewIncidentModal() {
  const {incidentState, setCurrentIncident, clearIncident} = useIncident();
  const {authState} = useAuth();
  const {isOnline} = useCheckIn();
  const {getUserLocation} = useLocation();
  const [visible, setVisible] = useState(false);
  const [currentIncident, setCurrentIncidentState] = useState<any>(null);
  const shakeStyle = useShakeAnimation(visible);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [isDenying, setIsDenying] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isOnline || isDenying || isAssigning) {
      setVisible(false);
      return;
    }

    const fetchIncident = async () => {
      try {
        const data = await fetchRecentIncident();

        if (!data) {
          setVisible(false);
          return;
        }

        const lat = data.incidentDetails?.coordinates?.lat;
        const lon = data.incidentDetails?.coordinates?.lon;

        let address = "Location unavailable";
        if (lat && lon) {
          address = await getAddressFromCoords(lat, lon);
        }

        // context state
        if (setCurrentIncident) {
          await setCurrentIncident({
            emergencyType: data.incidentType,
            channelId: data.channelId || "test-default",
            incidentId: data._id,
            dispatcher: data.dispatcher
              ? {
                  _id: data.dispatcher,
                  firstName: "",
                  lastName: "",
                  email: "",
                  phone: "",
                  role: "dispatcher",
                }
              : undefined,
            lgu: data.lgu
              ? {
                  _id: data.lgu,
                  firstName: "",
                  lastName: "",
                  email: "",
                  phone: "",
                  role: "lgu",
                }
              : undefined,
            timestamp: new Date(data.createdAt).getTime(),
            location: {
              lat: lat || undefined,
              lon: lon || undefined,
              address,
            },
          });
        }
        // local state
        setCurrentIncidentState({
          ...data,
          location: {
            address,
            coordinates: {
              lat,
              lon,
            },
          },
        });
        setVisible(true);
      } catch (error) {
        console.error("Error fetching recent incident:", error);
        setVisible(false);
      }
    };

    const intervalId = setInterval(fetchRecentIncident, 3000);
    fetchIncident();

    return () => {
      clearInterval(intervalId);
    };
  }, [isOnline, setCurrentIncident, isDenying, isAssigning]);

  const handleDeny = async () => {
    setIsDenying(true);
    setVisible(false);
    setShowDenyModal(true);
  };

  const handleRespond = async () => {
    if (setCurrentIncident && currentIncident && authState?.user_id) {
      try {
        setIsAssigning(true);

        // responders location
        const myLocation = await getUserLocation();
        if (!myLocation) {
          throw new Error("error getting responders location");
        }

        await assignResponder(currentIncident._id, authState?.user_id, {
          lat: myLocation?.latitude,
          lon: myLocation?.longitude,
        });

        // volunterr's location
        const lat = currentIncident.incidentDetails?.coordinates?.lat;
        const lon = currentIncident.incidentDetails?.coordinates?.lon;

        let address =
          currentIncident.location?.address || "Location unavailable";
        if (!address && lat && lon) {
          address = await getAddressFromCoords(lat, lon);
        }

        await setCurrentIncident({
          emergencyType: currentIncident.incidentType,
          channelId: currentIncident.channelId,
          incidentId: currentIncident._id,
          dispatcher: currentIncident.dispatcher,
          lgu: currentIncident.lgu,
          timestamp: new Date(currentIncident.createdAt).getTime(),
          location: {
            lat,
            lon,
            address,
          },
        });
        router.replace("/(responding)");
        setVisible(false);
      } catch (error) {
        console.error("error assining responder: ", error);
      } finally {
        setIsAssigning(false);
      }
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
