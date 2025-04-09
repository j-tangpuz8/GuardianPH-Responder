import {View, Text, StyleSheet, TouchableOpacity, Image} from "react-native";
import {useIncident} from "@/context/IncidentContext";
import all from "@/utils/getIcon";
import {useEffect} from "react";

export default function RespondingHeader() {
  const {incidentState} = useIncident();

  useEffect(() => {
    console.log(JSON.stringify(incidentState, null, 2));
  }, []);

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
            <Text style={styles.title}>ENROUTE</Text>
            <Text style={styles.address}>
              {incidentState?.location?.address || "Location unavailable"}
            </Text>
          </View>
        </View>
      </View>
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
});
