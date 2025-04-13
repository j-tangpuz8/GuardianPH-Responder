import {View, Text, StyleSheet, TouchableOpacity, Image} from "react-native";
import {useIncident} from "@/context/IncidentContext";
import all from "@/utils/getIcon";
import {useEffect, useState} from "react";
import {useRouter} from "expo-router";

export default function RespondingHeader() {
  const {incidentState} = useIncident();
  const router = useRouter();
  // Initialize with null instead of "enroute" to avoid showing incorrect status
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);

  useEffect(() => {
    // Set the status from incident state whenever it changes
    if (incidentState?.responderStatus) {
      console.log("Header: Setting status to", incidentState.responderStatus);
      setCurrentStatus(incidentState.responderStatus);
    } else {
      // If responderStatus is not present, default to "enroute"
      console.log(
        "No responderStatus found in incidentState, defaulting to enroute"
      );
      setCurrentStatus("enroute");
    }
  }, [incidentState]);

  useEffect(() => {
    console.log("Full incident state:", incidentState);
  }, []);

  const getStatusText = (status: string | null | undefined) => {
    const statusMap: {[key: string]: string} = {
      enroute: "ENROUTE",
      onscene: "ON SCENE",
      medicalFacility: "MEDICAL FACILITY",
      rtb: "RETURN TO BASE",
      close: "CLOSE INCIDENT",
    };
    // Use "ENROUTE" as default if status is missing
    return statusMap[status || "enroute"] || "ENROUTE";
  };

  const handlePatientDetailsPress = () => {
    router.push("/(responding)/patient-details");
  };

  const handleVitalSignsPress = () => {
    router.push("/(responding)/vital-signs");
  };

  const renderBottomContainer = () => {
    const status = incidentState?.responderStatus || "enroute";

    if (status === "onscene") {
      return (
        <TouchableOpacity
          style={styles.actionContainer}
          onPress={handlePatientDetailsPress}>
          <Text style={styles.actionText}>PATIENT DETAILS</Text>
        </TouchableOpacity>
      );
    } else if (status === "medicalFacility") {
      return (
        <TouchableOpacity
          style={styles.actionContainer}
          onPress={handleVitalSignsPress}>
          <Text style={styles.actionText}>VITAL SIGNS</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <View style={styles.etaContainer}>
          <View style={styles.etaItem}>
            <Text style={styles.etaLabel}>ETA</Text>
            <Text style={styles.etaValue}>4min</Text>
          </View>
          <Text style={styles.etaSeparator}>•</Text>
          <View style={styles.etaItem}>
            <Text style={styles.etaLabel}>DIS</Text>
            <Text style={styles.etaValue}>600m</Text>
          </View>
        </View>
      );
    }
  };

  return (
    <View style={styles.main}>
      <View style={styles.container}>
        <View style={styles.mainContent}>
          <Image
            source={all.getEmergencyIcon(
              incidentState?.emergencyType || "Fire"
            )}
            style={styles.icon}
          />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {getStatusText(incidentState?.responderStatus)}
            </Text>
            <Text style={styles.address}>
              {incidentState?.location?.address || "Location unavailable"}
            </Text>
          </View>
        </View>
      </View>

      {renderBottomContainer()}
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    display: "flex",
    flexDirection: "column",
  },
  container: {
    padding: 8,
    paddingBottom: 0,
    backgroundColor: "#3498db",
  },
  mainContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  icon: {
    width: 55,
    height: 60,
    borderRadius: 100,
  },
  titleContainer: {
    marginBottom: 3,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  address: {
    color: "white",
    fontSize: 14,
    opacity: 0.9,
  },
  etaContainer: {
    flexDirection: "row",
    backgroundColor: "#FF6B6B",
    padding: 4,
    alignItems: "center",
  },
  etaItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  etaSeparator: {
    color: "white",
    fontSize: 20,
    opacity: 0.7,
  },
  etaLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  etaValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  actionContainer: {
    backgroundColor: "#FF6B6B",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
