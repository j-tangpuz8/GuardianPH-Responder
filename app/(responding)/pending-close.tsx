import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import React, {useEffect} from "react";
import {useIncident} from "@/context/IncidentContext";
import {useRouter} from "expo-router";
import {useFetchIncidentStatus} from "@/hooks/useFetchIncidentStatus";

export default function WaitingApprovalScreen() {
  const {incidentState, clearIncident} = useIncident();
  const router = useRouter();
  const {isFinished, loading, error, fetchStatus} = useFetchIncidentStatus(
    incidentState?.incidentId
  );

  // Poll for status changes
  useEffect(() => {
    if (!incidentState?.incidentId) {
      router.replace("/lib");
      return;
    }

    const intervalId = setInterval(() => {
      fetchStatus();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId);
  }, [incidentState?.incidentId, fetchStatus]);

  // when isFinished = true, clearIncident and go back to home
  useEffect(() => {
    if (isFinished) {
      const handleFinished = async () => {
        if (clearIncident) {
          await clearIncident();
        }
        router.replace("/lib");
      };

      handleFinished();
    }
  }, [isFinished, clearIncident, router]);

  // disabble back button in android device
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true
    );
    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0066CC" style={styles.spinner} />
      <Text style={styles.title}>Waiting for Approval</Text>
      <Text style={styles.subtitle}>
        Waiting for LGU Dispatcher to Approve Incident Closure
      </Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    padding: 20,
  },
  spinner: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#CCCCCC",
    textAlign: "center",
    marginBottom: 20,
  },
  errorText: {
    color: "#FF6B6B",
    marginTop: 20,
    textAlign: "center",
  },
});
