import {
  StyleSheet,
  Text,
  View,
  Modal,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import React, {useState, useEffect, useRef, useMemo, useCallback} from "react";
import {useIncident} from "@/context/IncidentContext";
import {useCheckIn} from "@/context/CheckInContext";
import all from "@/utils/getIcon";
import {useShakeAnimation} from "@/hooks/useShakeAnimation";
import DenyIncidentModal from "./deny-incident-modal";
import {useRouter} from "expo-router";
import {assignResponder} from "@/api/incidents/useUpdateIncident";
import {
  useIncidentForResponder,
  denyIncident,
} from "@/api/incidents/useFetchIncident";
import {useAuth} from "@/context/AuthContext";
import useLocation from "@/hooks/useLocation";
import {useSound} from "@/utils/PlaySound";
import {Incident} from "@/types/incident";

export default function NewIncidentModal({sounds}: {sounds: any}) {
  const {setCurrentIncident} = useIncident();
  const {authState} = useAuth();
  const {isOnline} = useCheckIn();
  const {getUserLocation, getAddressFromCoords} = useLocation();
  const [visible, setVisible] = useState(false);
  const shakeStyle = useShakeAnimation(visible);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [isDenying, setIsDenying] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const router = useRouter();
  const [address, setAddress] = useState<string | null>(null);
  const [currentIncidentIndex, setCurrentIncidentIndex] = useState(0);

  const {data: incidents = []} = useIncidentForResponder(
    authState?.user_id || ""
  );
  const currentIncident = incidents[currentIncidentIndex];

  const soundState = useRef({
    hasPlayed: false,
    currentSound: null as any,
  });

  const getIncidentSound = useCallback(
    (incidentType: string) => {
      if (!sounds) return null;

      const type = incidentType || "";
      if (type.includes("Medical")) return sounds.medical;
      if (type.includes("Police")) return sounds.police;
      if (type.includes("Fire")) return sounds.fire;
      return sounds.general;
    },
    [sounds]
  );

  const stopAllSounds = useCallback(async () => {
    try {
      const soundPromises = [];

      if (sounds?.medical && !sounds.medical.isLoading) {
        soundPromises.push(sounds.medical.stopSound());
      }
      if (sounds?.police && !sounds.police.isLoading) {
        soundPromises.push(sounds.police.stopSound());
      }
      if (sounds?.fire && !sounds.fire.isLoading) {
        soundPromises.push(sounds.fire.stopSound());
      }
      if (sounds?.general && !sounds.general.isLoading) {
        soundPromises.push(sounds.general.stopSound());
      }

      await Promise.allSettled(soundPromises);

      soundState.current.hasPlayed = false;
      soundState.current.currentSound = null;
    } catch (error) {
      console.error("Error stopping sounds:", error);
    }
  }, [sounds]);

  const playIncidentSound = useCallback(
    async (incidentType: string) => {
      if (soundState.current.hasPlayed) return;

      try {
        const sound = getIncidentSound(incidentType);
        if (!sound || sound.isLoading) return;

        await stopAllSounds();
        await sound.playSound();

        soundState.current.hasPlayed = true;
        soundState.current.currentSound = sound;
      } catch (error) {
        console.error("Error playing sound:", error);
      }
    },
    [getIncidentSound, stopAllSounds]
  );

  useEffect(() => {
    if (incidents.length > 0) {
      if (!visible) {
        setVisible(true);
      }
      if (currentIncident && !soundState.current.hasPlayed) {
        playIncidentSound(currentIncident.incidentType);
      }
    } else {
      setVisible(false);
      stopAllSounds();
    }
    return () => {
      stopAllSounds();
    };
  }, [incidents, currentIncident, visible, playIncidentSound, stopAllSounds]);

  const fetchAddress = useCallback(
    async (lat: number, lon: number) => {
      try {
        const address = await getAddressFromCoords(lat, lon);
        setAddress(address);
      } catch (error) {
        console.error("Error fetching address:", error);
        setAddress("Location unavailable");
      }
    },
    [getAddressFromCoords]
  );

  useEffect(() => {
    let isMounted = true;
    if (currentIncident?.incidentDetails?.coordinates) {
      const {lat, lon} = currentIncident.incidentDetails.coordinates;
      fetchAddress(lat, lon).then(() => {
        if (!isMounted) return;
      });
    }

    return () => {
      isMounted = false;
    };
  }, [currentIncident, fetchAddress]);

  const handleRespond = async () => {
    try {
      await stopAllSounds();
      setIsAssigning(true);

      if (!currentIncident || !authState?.user_id) return;

      const responderLoc = await getUserLocation();
      if (!responderLoc) throw new Error("Could not get responder location");

      await assignResponder(currentIncident._id, authState.user_id, {
        lat: responderLoc.latitude,
        lon: responderLoc.longitude,
      });

      if (setCurrentIncident) {
        await setCurrentIncident({
          ...currentIncident,
          responderCoordinates: {
            lat: responderLoc.latitude,
            lon: responderLoc.longitude,
          },
          incidentDetails: {
            ...currentIncident.incidentDetails,
            location: address || "",
          },
        });
      }
      router.push("/(responding)");
    } catch (error) {
      console.error("Error responding to incident:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeny = async () => {
    await stopAllSounds();
    setIsDenying(true);
    setVisible(false);
    setShowDenyModal(true);
  };

  const handleDenyConfirm = async (reason: string) => {
    if (currentIncident?._id) {
      await denyIncident(currentIncident._id);

      if (currentIncidentIndex < incidents.length - 1) {
        setCurrentIncidentIndex((prev) => prev + 1);
        setVisible(true);
      } else {
        setVisible(false);
      }
    }
    setShowDenyModal(false);
    setIsDenying(false);
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
                    {address || "Location unavailable"}
                  </Text>
                </View>
              </View>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.respondButton}
                  onPress={handleRespond}
                  disabled={isAssigning}>
                  <Text style={styles.buttonText}>
                    {isAssigning ? "Responding..." : "Respond"}
                  </Text>
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
        onConfirm={handleDenyConfirm}
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
