import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, {useEffect, useRef} from "react";
import {useIncident} from "@/context/IncidentContext";
import {useNearbyHospitals, Hospital} from "@/hooks/useGetHospitals";
import {addHospitalAndUpdateIncident} from "@/api/hospitals/useHospitals";

interface MedicalFacilityDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSelectFacility: (hospitalId?: string, hospitalName?: string) => void;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function MedicalFacilityDrawer({
  visible,
  onClose,
  onSelectFacility,
}: MedicalFacilityDrawerProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const {incidentState, updateSelectedHospital} = useIncident();
  const {hospitals, loading, error, refreshHospitals} = useNearbyHospitals({
    radius: 10000,
    limit: 3,
  });

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
      refreshHospitals();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  // set the selected hospital in the incident staet
  const handleSelectHospital = async (hospital: Hospital) => {
    if (!incidentState?.incidentId || !updateSelectedHospital) {
      Alert.alert("Error", "Cannot select hospital: No active incident");
      return;
    }
    try {
      updateSelectedHospital({
        id: hospital.id,
        name: hospital.name,
        location: hospital.location,
        vicinity: hospital.vicinity,
      });

      const result = await addHospitalAndUpdateIncident(
        hospital,
        incidentState.incidentId
      );

      if (result.success) {
        updateSelectedHospital(
          {
            id: hospital.id,
            name: hospital.name,
            location: hospital.location,
            vicinity: hospital.vicinity,
          },
          result.hospitalId
        );
        onSelectFacility(hospital.id, hospital.name);
      } else {
        Alert.alert(
          "Warning",
          "Hospital selected but could not be saved to database. Navigation will still work."
        );
      }
    } catch (error) {
      console.error("Error selecting hospital:", error);
      Alert.alert("Error", "Failed to select hospital. Please try again.");
    }
    onClose();
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${meters}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  };

  const calculateETA = (meters: number) => {
    const minutes = Math.ceil(meters / 500);

    if (minutes < 1) {
      return "< 1min";
    } else if (minutes < 60) {
      return `${minutes}min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}min`;
    }
  };

  return (
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
            <View style={styles.header}>
              <Text style={styles.title}>MEDICAL FACILITY</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContentContainer}
              showsVerticalScrollIndicator={true}
              bounces={true}>
              {/* Loading State */}
              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3498db" />
                  <Text style={styles.loadingText}>
                    Finding nearby hospitals...
                  </Text>
                </View>
              )}

              {/* Rest of the content */}
              {/* Error State */}
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>Error: {error}</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={refreshHospitals}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Empty State */}
              {!loading && !error && hospitals.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No hospitals found nearby
                  </Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={refreshHospitals}>
                    <Text style={styles.retryButtonText}>Refresh</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Hospital List */}
              {!loading &&
                !error &&
                hospitals.map((hospital) => (
                  <View key={hospital.id} style={styles.hospitalItem}>
                    <View style={styles.hospitalInfo}>
                      <View style={styles.hospitalDetails}>
                        <Text style={styles.hospitalName}>{hospital.name}</Text>
                        <Text style={styles.hospitalAddress} numberOfLines={1}>
                          {hospital.vicinity}
                        </Text>
                        <View style={styles.hospitalMetrics}>
                          <Text style={styles.etaText}>
                            ETA{" "}
                            <Text style={styles.metricValue}>
                              {calculateETA(hospital.distance)}
                            </Text>
                          </Text>
                          <Text style={styles.disText}>
                            DIS{" "}
                            <Text style={styles.metricValue}>
                              {formatDistance(hospital.distance)}
                            </Text>
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.goButton}
                      onPress={() => handleSelectHospital(hospital)}>
                      <Text style={styles.goButtonText}>GO</Text>
                    </TouchableOpacity>
                  </View>
                ))}
            </ScrollView>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 155,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  drawer: {
    backgroundColor: "white",
    width: "100%",
    maxHeight: "90%",
  },
  header: {
    backgroundColor: "#3498db",
    padding: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    right: 10,
    top: "70%",
    transform: [{translateY: -12}],
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 12,
    color: "white",
    fontWeight: "bold",
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  hospitalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  hospitalInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  hospitalDetails: {
    flex: 1,
  },
  hospitalName: {
    color: "#2c3e50",
    fontSize: 16,
    fontWeight: "bold",
  },
  hospitalAddress: {
    color: "#7f8c8d",
    fontSize: 12,
    marginTop: 2,
  },
  hospitalMetrics: {
    flexDirection: "row",
    marginTop: 4,
  },
  etaText: {
    color: "#7f8c8d",
    marginRight: 15,
    fontSize: 14,
  },
  disText: {
    color: "#7f8c8d",
    fontSize: 14,
  },
  metricValue: {
    color: "#2ecc71",
    fontWeight: "bold",
  },
  goButton: {
    backgroundColor: "#3498db",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  goButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    padding: 30,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#7f8c8d",
    fontSize: 16,
  },
  errorContainer: {
    padding: 30,
    alignItems: "center",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
  emptyContainer: {
    padding: 30,
    alignItems: "center",
  },
  emptyText: {
    color: "#7f8c8d",
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#3498db",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});
