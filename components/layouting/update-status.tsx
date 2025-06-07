import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import CloseIncidentDrawer from "./close-incident-drawer";
import FacilityDrawer from "./facilities-drawer";
import {
  updateResponderStatus,
  requestCloseIncident,
} from "@/api/incidents/useUpdateIncident";
import {useIncident} from "@/context/IncidentContext";
import {STYLING_CONFIG} from "@/constants/styling-config";

interface UpdateStatusModalProps {
  visible: boolean;
  onClose: () => void;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function UpdateStatusModal({
  visible,
  onClose,
}: UpdateStatusModalProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [closeIncidentVisible, setCloseIncidentVisible] =
    useState<boolean>(false);
  const [showFacilities, setShowFacilities] = useState<boolean>(false);
  const {incidentState, setCurrentIncident} = useIncident();

  useEffect(() => {
    if (incidentState?.responderStatus) {
      const statusMapping: {[key: string]: string} = {
        enroute: "enroute",
        onscene: "onscene",
        facility: "facility",
        rtb: "rtb",
      };
      const mappedStatus =
        statusMapping[incidentState.responderStatus] || "enroute";
      setCurrentStatus(mappedStatus);
    }
  }, [incidentState?.responderStatus]);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const handleStatusPress = async (status: string) => {
    if (!incidentState?._id || !setCurrentIncident) return;

    try {
      if (status === "rtb") {
        await requestCloseIncident(incidentState._id);
        await setCurrentIncident({
          ...incidentState,
          responderStatus: "rtb",
        });
        setCloseIncidentVisible(true);
      } else if (status === "facility") {
        await updateResponderStatus(incidentState._id, "facility");
        setCurrentStatus(status);
        await setCurrentIncident({
          ...incidentState,
          responderStatus: "facility",
        });
        setShowFacilities(true);
      } else {
        const statusMap: {[key: string]: any} = {
          onscene: "onscene",
          enroute: "enroute",
        };
        await updateResponderStatus(incidentState._id, statusMap[status]);
        setCurrentStatus(status);
        await setCurrentIncident({
          ...incidentState,
          responderStatus: statusMap[status],
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.drawer,
                {
                  transform: [{translateY: slideAnim}],
                },
              ]}>
              <View style={styles.handle} />
              <Text style={styles.title}>UPDATE STATUS</Text>

              <TouchableOpacity
                onPress={() => handleStatusPress("onscene")}
                style={[
                  styles.statusButton,
                  currentStatus === "onscene" && styles.activeButton,
                ]}>
                <Text
                  style={[
                    styles.statusText,
                    currentStatus === "onscene" && styles.activeText,
                  ]}>
                  ONSCENE
                </Text>
                {currentStatus === "onscene" && (
                  <Text style={[styles.statusSubtext, styles.activeText]}>
                    (CURRENT)
                  </Text>
                )}
              </TouchableOpacity>

              {/*//// for fire incidents only /////*/}
              {incidentState?.incidentType == "Fire" && (
                <TouchableOpacity style={styles.statusButton}>
                  <Text style={styles.statusText}>ALARM LEVEL</Text>

                  <Text style={{color: "white"}}>(FIRST ALARM)</Text>
                </TouchableOpacity>
              )}
              {/*//// for fire incidents only /////*/}

              <TouchableOpacity
                onPress={() => handleStatusPress("facility")}
                style={[
                  styles.statusButton,
                  currentStatus === "facility" && styles.activeButton,
                ]}>
                <Text
                  style={[
                    styles.statusText,
                    currentStatus === "facility" && styles.activeText,
                  ]}>
                  {incidentState?.incidentType == "Fire"
                    ? "FIRE HYDRANTS"
                    : "MEDICAL FACILITY"}
                </Text>
                {currentStatus === "facility" && (
                  <Text style={[styles.statusSubtext, styles.activeText]}>
                    (CURRENT)
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleStatusPress("rtb")}
                style={[
                  styles.statusButton,
                  currentStatus === "rtb" && styles.activeButton,
                ]}>
                <Text
                  style={[
                    styles.statusText,
                    currentStatus === "rtb" && styles.activeText,
                  ]}>
                  CLOSE INCIDENT
                </Text>

                {currentStatus === "rtb" && (
                  <Text style={[styles.statusSubtext, styles.activeText]}>
                    (RTB)
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {closeIncidentVisible && (
        <CloseIncidentDrawer
          visible={closeIncidentVisible}
          onClose={() => setCloseIncidentVisible(false)}
        />
      )}
      {showFacilities && (
        <FacilityDrawer
          visible={showFacilities}
          onClose={() => setShowFacilities(false)}
          onSelectFacility={() => setCurrentStatus("facility")}
          facilityType={
            incidentState?.incidentType as keyof typeof STYLING_CONFIG
          }
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 50,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  drawer: {
    backgroundColor: "#34495e",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 10,
    maxHeight: "80%",
    opacity: 0.9,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#fff",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 10,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  statusButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    backgroundColor: "#34495e",
    borderWidth: 1,
    borderColor: "white",
  },
  activeButton: {
    backgroundColor: "white",
  },
  statusText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  activeText: {
    color: "#34495e",
  },
  statusSubtext: {
    color: "white",
    fontSize: 12,
    opacity: 0.8,
  },
});
