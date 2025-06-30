import {View, Text, StyleSheet, TouchableOpacity, Image} from "react-native";
import {useIncidentStore} from "@/context";
import all from "@/utils/getIcon";
import {useEffect, useState} from "react";
import {useRouter} from "expo-router";

export default function RespondingHeader() {
  const {incidentState} = useIncidentStore();
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);

  useEffect(() => {
    if (incidentState?.responderStatus) {
      setCurrentStatus(incidentState.responderStatus);
    } else {
      setCurrentStatus("enroute");
    }
  }, [incidentState]);

  const getStatusText = (status: string | null | undefined) => {
    const statusMap: {[key: string]: string} = {
      enroute: "ENROUTE",
      onscene: "ON SCENE",
      facility: "FACILITY",
      rtb: "RETURN TO BASE",
    };
    return statusMap[status || "enroute"] || "ENROUTE";
  };

  const handlePatientDetailsPress = () => {
    router.push("/(responding)/medical/patient-details");
  };

  const handleFireDetailsPress = () => {
    router.push("/(responding)/fire/fire-details");
  };

  const handleVitalSignsPress2 = () => {
    router.push("/(responding)/medical/handover-vital-signs");
  };

  const renderBottomContainer = () => {
    const status = incidentState?.responderStatus || "enroute";
    const incidentType = incidentState?.incidentType || "";

    if (status === "onscene") {
      if (incidentType.includes("Fire")) {
        return (
          <TouchableOpacity
            style={styles.actionContainer}
            onPress={handleFireDetailsPress}>
            <Text style={styles.actionText}>FIRE DETAILS</Text>
          </TouchableOpacity>
        );
      } else if (incidentType.includes("Medical")) {
        return (
          <TouchableOpacity
            style={styles.actionContainer}
            onPress={handlePatientDetailsPress}>
            <Text style={styles.actionText}>PATIENT DETAILS</Text>
          </TouchableOpacity>
        );
      }
    } else if (status === "facility") {
      if (incidentType.includes("Fire")) {
        return (
          <TouchableOpacity
            style={styles.actionContainer}
            onPress={handleFireDetailsPress}>
            <Text style={styles.actionText}>FIRE DETAILS</Text>
          </TouchableOpacity>
        );
      } else if (incidentType.includes("Medical")) {
        return (
          <TouchableOpacity
            style={styles.actionContainer2}
            onPress={handleVitalSignsPress2}>
            <Text style={styles.actionText}>PRE-HOSPITAL</Text>
          </TouchableOpacity>
        );
      }
    }

    return null;
  };

  return (
    <View style={styles.main}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: incidentState?.incidentType?.includes("Fire")
              ? "#e74c3c"
              : incidentState?.incidentType?.includes("Medical")
              ? "#3498db"
              : "#e74c3c",
          },
        ]}>
        <View style={styles.mainContent}>
          <Image
            source={all.GetEmergencyIcon(incidentState?.incidentType!)}
            style={styles.icon}
          />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {getStatusText(incidentState?.responderStatus)}
            </Text>
            <Text style={styles.address}>
              {incidentState?.incidentDetails?.location ||
                "Location unavailable"}
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
    paddingBottom: 5,
  },
  mainContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  icon: {
    width: 60,
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
    width: "100%",
    justifyContent: "center",
  },
  actionContainer2: {
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
