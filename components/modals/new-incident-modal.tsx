import {
  StyleSheet,
  Text,
  View,
  Modal,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useIncidentStore } from "@/context";
import { useAuthStore } from "@/context";
import { useWebSocket } from "@/context/webSocketContext";
import all from "@/utils/getIcon";
import { useShakeAnimation } from "@/hooks/useShakeAnimation";
import DenyIncidentModal from "./deny-incident-modal";
import { useRouter } from "expo-router";
import { assignResponder } from "@/api/incidents/useUpdateIncident";
import { denyIncident } from "@/api/incidents/useFetchIncident";
import useLocation from "@/hooks/useLocation";
import { logIncident, logSound, logLocation, logError } from "@/utils/logger";

export default function NewIncidentModal({ sounds }: { sounds: any }) {
  const { setCurrentIncident } = useIncidentStore();
  const { user_id } = useAuthStore();
  const { getUserLocation, getAddressFromCoords } = useLocation();
  const { pendingAssignment, respondToAssignment } = useWebSocket();
  const [visible, setVisible] = useState(false);
  const shakeStyle = useShakeAnimation(visible);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [isDenying, setIsDenying] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const router = useRouter();
  const [address, setAddress] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const lastIncidentIdRef = useRef<string | null>(null);

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
    if (!mountedRef.current) {
      return;
    }

    try {
      logSound("CONTROL", "Stopping all sounds");
      const soundPromises = [];

      if (sounds?.medical?.stopSound && !sounds.medical.isLoading) {
        soundPromises.push(
          sounds.medical.stopSound().catch((error: unknown) => {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            logSound("CONTROL", "Medical sound stop error (ignored)", {
              error: errorMessage,
            });
          })
        );
      }
      if (sounds?.police?.stopSound && !sounds.police.isLoading) {
        soundPromises.push(
          sounds.police.stopSound().catch((error: unknown) => {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            logSound("CONTROL", "Police sound stop error (ignored)", {
              error: errorMessage,
            });
          })
        );
      }
      if (sounds?.fire?.stopSound && !sounds.fire.isLoading) {
        soundPromises.push(
          sounds.fire.stopSound().catch((error: unknown) => {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            logSound("CONTROL", "Fire sound stop error (ignored)", {
              error: errorMessage,
            });
          })
        );
      }
      if (sounds?.general?.stopSound && !sounds.general.isLoading) {
        soundPromises.push(
          sounds.general.stopSound().catch((error: unknown) => {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            logSound("CONTROL", "General sound stop error (ignored)", {
              error: errorMessage,
            });
          })
        );
      }

      if (soundPromises.length > 0) {
        await Promise.allSettled(soundPromises);
      }

      logSound("CONTROL", "All sounds stopped successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logSound("CONTROL", "Non-critical error during sound cleanup", {
        error: errorMessage,
      });
    }
  }, [sounds]);

  const playIncidentSound = useCallback(
    async (incidentType: string, incidentId: string) => {
      if (!mountedRef.current) {
        return;
      }

      try {
        const sound = getIncidentSound(incidentType);
        if (!sound) {
          logSound("PLAYBACK", "No sound available for incident type", {
            incidentType,
          });
          return;
        }

        // check if sound is ready
        if (sound.isLoading || !sound.isReady) {
          logSound("PLAYBACK", "Sound not ready, waiting...", {
            incidentType,
            isLoading: sound.isLoading,
            isReady: sound.isReady,
          });

          setTimeout(() => {
            if (sound.isReady && !sound.isLoading) {
              playIncidentSound(incidentType, incidentId);
            }
          }, 500);
          return;
        }

        logSound("PLAYBACK", "Playing incident sound", {
          incidentType,
          incidentId,
        });

        await stopAllSounds();
        await new Promise((resolve) => setTimeout(resolve, 100));
        await sound.playSound();

        logSound("PLAYBACK", "Incident sound played successfully", {
          incidentType,
          incidentId,
        });
      } catch (error) {
        logError("SOUND_PLAYBACK", "Error playing sound", error);
      }
    },
    [getIncidentSound, stopAllSounds]
  );

  // handle WebSocket requests
  useEffect(() => {
    if (pendingAssignment) {
      const currentIncidentId = pendingAssignment._id;

      logIncident("ASSIGNMENT", "New assignment request received", {
        incidentId: currentIncidentId,
        incidentType: pendingAssignment.incidentType,
      });

      // play sound for new incidents (different id)
      if (lastIncidentIdRef.current !== currentIncidentId) {
        lastIncidentIdRef.current = currentIncidentId;

        if (!visible) {
          setVisible(true);
          logIncident("MODAL", "Opening incident modal for new assignment");
        }

        playIncidentSound(pendingAssignment.incidentType, currentIncidentId);
      }
    } else {
      if (visible) {
        setVisible(false);
        lastIncidentIdRef.current = null;
        logIncident("MODAL", "Closing incident modal - no pending assignment");
      }
      if (!isAssigning && !isDenying) {
        stopAllSounds();
      }
    }

    return () => {
      if (!isAssigning && !isDenying) {
        stopAllSounds();
      }
    };
  }, [
    pendingAssignment,
    visible,
    playIncidentSound,
    stopAllSounds,
    isAssigning,
    isDenying,
  ]);

  const fetchAddress = useCallback(
    async (lat: number, lon: number) => {
      try {
        logLocation("GEOCODING", "Fetching address from coordinates", {
          lat,
          lon,
        });
        const address = await getAddressFromCoords(lat, lon);
        setAddress(address);
        logLocation("GEOCODING", "Address fetched successfully", { address });
      } catch (error) {
        logError("LOCATION_GEOCODING", "Error fetching address", error);
        setAddress("Location unavailable");
      }
    },
    [getAddressFromCoords]
  );

  console.log("Visible.... ", visible);

  useEffect(() => {
    let isMounted = true;
    if (pendingAssignment?.incidentDetails?.coordinates) {
      const { lat, lon } = pendingAssignment.incidentDetails.coordinates;
      fetchAddress(lat, lon).then(() => {
        if (!isMounted) return;
      });
    }

    return () => {
      isMounted = false;
    };
  }, [pendingAssignment, fetchAddress]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // handle respond to incident
  const handleRespond = async () => {
    try {
      logIncident("RESPONSE", "Responder accepting assignment", {
        incidentId: pendingAssignment?._id,
      });

      await stopAllSounds();
      setIsAssigning(true);

      if (!pendingAssignment || !user_id) {
        logError("INCIDENT_RESPONSE", "Missing required data for response", {
          hasIncident: !!pendingAssignment,
          hasUserId: !!user_id,
        });
        return;
      }

      const responderLoc = await getUserLocation();
      if (!responderLoc) {
        logError("LOCATION_RESPONSE", "Could not get responder location");
        throw new Error("Could not get responder location");
      }

      // respond via socket
      await respondToAssignment(pendingAssignment._id, true);
      // lat lng coords send to db
      await assignResponder(pendingAssignment._id, {
        lat: responderLoc.latitude,
        lon: responderLoc.longitude,
      });

      // incident context state update
      if (setCurrentIncident) {
        await setCurrentIncident({
          ...pendingAssignment,
          responderCoordinates: {
            lat: responderLoc.latitude,
            lon: responderLoc.longitude,
          },
          incidentDetails: {
            ...pendingAssignment.incidentDetails,
            location: address || "",
          },
        });
        logIncident(
          "CONTEXT",
          "Incident context updated with responder location"
        );
      }

      router.push("/(responding)");
    } catch (error) {
      logError("INCIDENT_RESPONSE", "Error responding to incident", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeny = async () => {
    logIncident("RESPONSE", "Responder denying assignment", {
      incidentId: pendingAssignment?._id,
    });

    await stopAllSounds();
    setIsDenying(true);
    setVisible(false);
    setShowDenyModal(true);
  };

  const handleDenyConfirm = async (reason: string) => {
    if (pendingAssignment?._id) {
      try {
        logIncident("DENIAL", "Processing incident denial", {
          incidentId: pendingAssignment._id,
          reason,
        });

        await respondToAssignment(pendingAssignment._id, false);
        await denyIncident(pendingAssignment._id);
        logIncident("DENIAL", "Incident denied successfully");
      } catch (error) {
        logError("INCIDENT_DENIAL", "Error denying incident", error);
      }
    }
    setShowDenyModal(false);
    setIsDenying(false);
  };

  return (
    <>
      {!isDenying && visible && pendingAssignment && (
        // <Modal transparent visible={visible} animationType="fade">
        // IOS Testing
        <Modal transparent visible={visible} presentationStyle="overFullScreen">
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent]}>
              <View style={styles.header}>
                <Text style={styles.headerText}>NEW INCIDENT</Text>
              </View>
              <View
                style={[
                  styles.incidentDetails,
                  {
                    backgroundColor: all.getIncidentTypeColor(
                      pendingAssignment?.incidentType
                    ),
                  },
                ]}
              >
                <Image
                  source={all.GetEmergencyIcon(pendingAssignment?.incidentType)}
                  style={styles.icon}
                />
                <View style={styles.textContainer}>
                  <Text style={styles.incidentType}>
                    {pendingAssignment.incidentType?.toUpperCase()}
                  </Text>
                  <Text
                    style={styles.incidentLocation}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {address || "Location unavailable"}
                  </Text>
                </View>
              </View>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.respondButton}
                  onPress={handleRespond}
                  disabled={isAssigning}
                >
                  <Text style={styles.buttonText}>
                    {isAssigning ? "Responding..." : "Respond"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.denyButton}
                  onPress={handleDeny}
                >
                  <Text style={styles.buttonText}>Deny</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      <DenyIncidentModal
        visible={showDenyModal}
        incidentId={pendingAssignment?._id}
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
