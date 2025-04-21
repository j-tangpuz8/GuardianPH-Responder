import {
  StyleSheet,
  Text,
  View,
  Modal,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import React, {useState, useEffect, useRef, useMemo} from "react";
import {useIncident} from "@/context/IncidentContext";
import {useCheckIn} from "@/context/CheckInContext";
import all from "@/utils/getIcon";
import {useShakeAnimation} from "@/hooks/useShakeAnimation";
import DenyIncidentModal from "./deny-incident-modal";
import {useRouter} from "expo-router";
import {assignResponder} from "@/api/incidents/useUpdateIncident";
import {
  fetchRecentIncident,
  denyIncident,
} from "@/api/incidents/useFetchIncident";
import {useAuth} from "@/context/AuthContext";
import useLocation from "@/hooks/useLocation";
import {useSound} from "@/utils/PlaySound";

export default function NewIncidentModal() {
  const {incidentState, setCurrentIncident, clearIncident} = useIncident();
  const {authState} = useAuth();
  const {isOnline} = useCheckIn();
  const {getUserLocation, getAddressFromCoords} = useLocation();
  const [visible, setVisible] = useState(false);
  const [currentIncident, setCurrentIncidentState] = useState<any>(null);
  const shakeStyle = useShakeAnimation(visible);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [isDenying, setIsDenying] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const router = useRouter();
  const medicalSound = useSound(require("@/assets/sounds/ambulance.mp3"));
  const policeSound = useSound(require("@/assets/sounds/police.mp3"));
  const fireSound = useSound(require("@/assets/sounds/fire.mp3"));
  const generalSound = useSound(require("@/assets/sounds/general.mp3"));

  const sounds = useMemo(
    () => ({
      medical: medicalSound,
      police: policeSound,
      fire: fireSound,
      general: generalSound,
    }),
    [medicalSound, policeSound, fireSound, generalSound]
  );

  const hasPlayedSound = useRef(false);
  const deniedIncidents = useRef<Set<string>>(new Set());
  const getIncidentSound = (incidentType: string) => {
    const type = incidentType || "";

    if (type.includes("Medical")) return sounds.medical;
    if (type.includes("Police")) return sounds.police;
    if (type.includes("Fire")) return sounds.fire;
    return sounds.general;
  };

  const stopAllSounds = () => {
    sounds.medical.stopSound();
    sounds.police.stopSound();
    sounds.fire.stopSound();
    sounds.general.stopSound();
  };

  useEffect(() => {
    if (visible && currentIncident && !hasPlayedSound.current) {
      const {playSound} = getIncidentSound(currentIncident.incidentType);
      playSound();
      hasPlayedSound.current = true;
    }

    if (!visible) {
      stopAllSounds();
      hasPlayedSound.current = false;
    }
  }, [visible, currentIncident, sounds]);

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

        if (deniedIncidents.current.has(data._id)) {
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
          const existingHospital = incidentState?.selectedHospital;
          await setCurrentIncident({
            emergencyType: data.incidentType,
            channelId: data.channelId || "fad-call",
            incidentId: data._id,
            user: data.user,
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
            responderStatus: data.responderStatus
              ? String(data.responderStatus)
              : "enroute",

            location: {
              lat: lat || undefined,
              lon: lon || undefined,
              address,
            },
            selectedHospital: existingHospital,
            selectedHospitalId: data.selectedHospital || null,
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

    const intervalId = setInterval(fetchIncident, 3000);
    fetchIncident();

    return () => {
      clearInterval(intervalId);
    };
  }, [isOnline, setCurrentIncident, isDenying, isAssigning]);

  const handleDeny = async () => {
    stopAllSounds();
    setIsDenying(true);
    setVisible(false);
    setShowDenyModal(true);
  };

  const handleRespond = async () => {
    stopAllSounds();
    if (setCurrentIncident && currentIncident && authState?.user_id) {
      try {
        setIsAssigning(true);
        router.replace("/(responding)");

        const [myLocation, address] = await Promise.all([
          getUserLocation(),
          getAddressFromCoords(
            currentIncident.incidentDetails?.coordinates?.lat,
            currentIncident.incidentDetails?.coordinates?.lon
          ),
        ]);

        if (!myLocation) {
          throw new Error("error getting responders location");
        }

        // assign the responder
        await assignResponder(currentIncident._id, authState?.user_id, {
          lat: myLocation?.latitude,
          lon: myLocation?.longitude,
        });

        // set incidentState
        await setCurrentIncident({
          emergencyType: currentIncident.incidentType,
          channelId: currentIncident.channelId,
          incidentId: currentIncident._id,
          user: currentIncident.user,
          dispatcher: currentIncident.dispatcher,
          lgu: currentIncident.lgu,
          responderStatus: currentIncident?.responderStatus,
          location: {
            lat: currentIncident.incidentDetails?.coordinates?.lat,
            lon: currentIncident.incidentDetails?.coordinates?.lon,
            address: address || "Location unavailable",
          },
          selectedHospital: currentIncident.selectedHospital,
          selectedHospitalId: currentIncident.selectedHospitalId,
        });

        setVisible(false);
      } catch (error) {
        console.error("error assigning responder: ", error);
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
                  source={all.GetEmergencyIcon(currentIncident?.incidentType)}
                  style={styles.icon}
                />
                <View style={styles.textContainer}>
                  <Text style={styles.incidentType}>
                    {currentIncident.incidentType?.toUpperCase()}
                  </Text>
                  <Text
                    style={styles.incidentLocation}
                    numberOfLines={2}
                    ellipsizeMode="tail">
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
        incidentId={currentIncident?._id}
        onClose={() => {
          setShowDenyModal(false);
          setIsDenying(false);
        }}
        onConfirm={(reason) => {
          if (clearIncident) {
            clearIncident();
          }
          if (currentIncident?._id) {
            deniedIncidents.current.add(currentIncident._id);
            denyIncident(currentIncident._id);
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
    width: 60,
    height: 60,
    marginRight: 20,
  },
  textContainer: {
    flex: 1,
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
    flexWrap: "wrap",
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
