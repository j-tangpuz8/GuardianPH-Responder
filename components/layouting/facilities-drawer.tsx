import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {useIncidentStore} from "@/context";
import {useAuthStore} from "@/context";
import {useFetchFacilitiesByAssignment} from "@/api/facilities/useFetchFacilities";
import {useFetchResponder} from "@/api/users/useFetchResponder";
import {STYLING_CONFIG} from "@/constants/styling-config";
import useLocation from "@/hooks/useLocation";
import {updateIncidentSelectedFacility} from "@/api/incidents/useUpdateIncident";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

interface FacilityDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSelectFacility: (hospitalId?: string, hospitalName?: string) => void;
  facilityType: keyof typeof STYLING_CONFIG;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function FacilityDrawer({
  visible,
  onClose,
  onSelectFacility,
  facilityType,
}: FacilityDrawerProps & {facilityType: keyof typeof STYLING_CONFIG}) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const {incidentState, updateSelectedFacility} = useIncidentStore();
  const {user_id} = useAuthStore();
  const {data: responderData} = useFetchResponder(user_id || "");
  const {getAddressFromCoords} = useLocation();
  const [facilityDistances, setFacilityDistances] = useState<{
    [key: string]: {distance: number; duration: number};
  }>({});
  const [facilityAddresses, setFacilityAddresses] = useState<{
    [key: string]: string;
  }>({});

  const config = STYLING_CONFIG[facilityType];

  const {
    data: facilities,
    isLoading: loading,
    isError: error,
    refetch: refetchFacilities,
  } = useFetchFacilitiesByAssignment(responderData?.assignment || "");

  const fetchAddress = useCallback(
    async (lat: number, lon: number) => {
      try {
        const address = await getAddressFromCoords(lat, lon);
        return address;
      } catch (error) {
        console.error("Error fetching address:", error);
        return "Location unavailable";
      }
    },
    [getAddressFromCoords]
  );

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
      refetchFacilities();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    const calculateDistances = async () => {
      if (
        !facilities ||
        !incidentState?.incidentDetails?.coordinates ||
        !incidentState?.incidentDetails?.coordinates
      )
        return;

      const distances: {[key: string]: {distance: number; duration: number}} =
        {};

      for (const facility of facilities) {
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${incidentState.incidentDetails.coordinates.lat},${incidentState.incidentDetails.coordinates.lon}&destination=${facility.location.coordinates.lat},${facility.location.coordinates.lng}&key=${GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();

          if (data.status === "OK" && data.routes.length > 0) {
            const route = data.routes[0].legs[0];
            distances[facility._id] = {
              distance: route.distance.value,
              duration: route.duration.value,
            };
          }
        } catch (error) {
          console.error("Error calculating distance:", error);
        }
      }

      setFacilityDistances(distances);
    };

    calculateDistances();
  }, [facilities, incidentState?.incidentDetails?.coordinates]);

  useEffect(() => {
    const fetchAllAddresses = async () => {
      const addressPromises = facilities?.map(async (facility) => {
        const address = await fetchAddress(
          facility.location?.coordinates?.lat,
          facility.location?.coordinates?.lng
        );
        return {id: facility._id, address};
      });

      const addresses = await Promise.all(addressPromises || []);
      const addressMap = addresses.reduce((acc, {id, address}) => {
        acc[id] = address;
        return acc;
      }, {} as {[key: string]: string});

      setFacilityAddresses(addressMap);
    };

    if (facilities && facilities.length > 0) {
      fetchAllAddresses();
    }
  }, [facilities, fetchAddress]);

  if (!visible) return null;

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${meters}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.ceil(seconds / 60);
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
            <View
              style={[styles.header, {backgroundColor: config.headerColor}]}>
              <Text style={styles.title}>{config.label}</Text>
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
                    Finding nearby facilities...
                  </Text>
                </View>
              )}

              {/* Error State */}
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>Error: {error}</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => refetchFacilities()}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Empty State */}
              {!loading && !error && facilities?.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No facilities found nearby
                  </Text>
                  <TouchableOpacity style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Refresh</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* facilities List */}
              {!loading &&
                !error &&
                facilities?.map((facility) => (
                  <View key={facility._id} style={styles.hospitalItem}>
                    <View style={styles.hospitalInfo}>
                      <Image source={config.icon} style={styles.icon} />
                      <View style={styles.hospitalDetails}>
                        <Text style={styles.hospitalName}>{facility.name}</Text>
                        <Text style={styles.hospitalAddress} numberOfLines={1}>
                          {facilityAddresses[facility._id] ||
                            "Loading address..."}
                        </Text>
                        <View style={styles.hospitalMetrics}>
                          <Text style={styles.etaText}>
                            ETA{" "}
                            <Text style={styles.metricValue}>
                              {facilityDistances[facility._id]
                                ? formatDuration(
                                    facilityDistances[facility._id].duration
                                  )
                                : "Calculating..."}
                            </Text>
                          </Text>
                          <Text style={styles.disText}>
                            DIS{" "}
                            <Text style={styles.metricValue}>
                              {facilityDistances[facility._id]
                                ? formatDistance(
                                    facilityDistances[facility._id].distance
                                  )
                                : "Calculating..."}
                            </Text>
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.goButton}
                      onPress={async () => {
                        console.log("DEBUG: Selected facility:", facility);
                        await updateIncidentSelectedFacility(
                          incidentState?._id || "",
                          facility._id || ""
                        );
                        updateSelectedFacility(facility);
                        onClose();
                      }}>
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
  icon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
});
