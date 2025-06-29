import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import React, {useEffect, useState, useRef, useMemo, useCallback} from "react";
import useLocation from "@/hooks/useLocation";
import MapView, {Marker, PROVIDER_GOOGLE, Region} from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import {useIncidentStore} from "@/context";
import all from "@/utils/getIcon";
import {Ionicons} from "@expo/vector-icons";
import {useFocusEffect} from "expo-router";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const {width, height} = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const index = () => {
  const {lat, lon, errorMsg, getUserLocation} = useLocation();
  const {incidentState, clearActiveIncident} = useIncidentStore();

  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<MapView>(null);
  const mapInitialized = useRef(false);

  // responder
  const responderCoords = useMemo(() => {
    return incidentState?.responderCoordinates?.lat &&
      incidentState?.responderCoordinates?.lon
      ? {
          latitude: Number(incidentState?.responderCoordinates?.lat),
          longitude: Number(incidentState?.responderCoordinates?.lon),
        }
      : null;
  }, [
    incidentState?.responderCoordinates?.lat,
    incidentState?.responderCoordinates?.lon,
  ]);

  // incident / destination
  const incidentCoords = useMemo(() => {
    return incidentState?.incidentDetails?.coordinates?.lat &&
      incidentState?.incidentDetails?.coordinates?.lon
      ? {
          latitude: Number(incidentState.incidentDetails.coordinates.lat),
          longitude: Number(incidentState.incidentDetails.coordinates.lon),
        }
      : null;
  }, [
    incidentState?.incidentDetails?.coordinates?.lat,
    incidentState?.incidentDetails?.coordinates?.lon,
  ]);

  // console.log("incidentState", incidentState);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const getLocation = async () => {
        if (mapInitialized.current) return;

        try {
          setIsLoading(true);
          const locationData = await getUserLocation();

          if (!isMounted) return;

          if (
            locationData &&
            incidentState?.location?.lat &&
            incidentState?.location?.lon
          ) {
            const destLat = incidentCoords?.latitude;
            const destLon = incidentCoords?.longitude;

            const midLat = (locationData.latitude + destLat!) / 2;
            const midLon = (locationData.longitude + destLon!) / 2;

            const latDelta = Math.abs(locationData.latitude - destLat!) * 1.5;
            const lonDelta = Math.abs(locationData.longitude - destLon!) * 1.5;

            setMapRegion({
              latitude: midLat,
              longitude: midLon,
              latitudeDelta: Math.max(latDelta, LATITUDE_DELTA),
              longitudeDelta: Math.max(lonDelta, LONGITUDE_DELTA),
            });
          } else if (locationData) {
            setMapRegion({
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            });
          }

          mapInitialized.current = true;
        } catch (error) {
          console.error("Error getting location:", error);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      getLocation();

      return () => {
        isMounted = false;
      };
    }, [incidentState?.location?.lat, incidentState?.location?.lon])
  );

  // Update map when hospital selection changes
  // useEffect(() => {
  //   if (mapRef.current && responderCoords && hospitalCoords) {
  //     mapInitialized.current = false;

  //     const midLat = (responderCoords.latitude + hospitalCoords.latitude) / 2;
  //     const midLon = (responderCoords.longitude + hospitalCoords.longitude) / 2;

  //     const latDelta =
  //       Math.abs(responderCoords.latitude - hospitalCoords.latitude) * 1.5;
  //     const lonDelta =
  //       Math.abs(responderCoords.longitude - hospitalCoords.longitude) * 1.5;

  //     mapRef.current.animateToRegion(
  //       {
  //         latitude: midLat,
  //         longitude: midLon,
  //         latitudeDelta: Math.max(latDelta, LATITUDE_DELTA),
  //         longitudeDelta: Math.max(lonDelta, LONGITUDE_DELTA),
  //       },
  //       1000
  //     );
  //   }
  // }, [hospitalCoords, responderCoords]);

  // map loading state ui
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  // // err handling
  if (!responderCoords || !incidentCoords) {
    return (
      <View style={styles.container}>
        <Text>
          {errorMsg ||
            "Unable to load map data. Please check your location settings."}
        </Text>
      </View>
    );
  }

  // console.log(
  //   "Responding Screen - incidentState:",
  //   JSON.stringify(incidentState, null, 2)
  // );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={mapRegion!}
        showsUserLocation={true}
        showsMyLocationButton={false}
        initialRegion={mapRegion!}
        loadingEnabled={true}
        loadingIndicatorColor="#3498db"
        loadingBackgroundColor="#f9f9f9">
        {/* user location marker */}
        <Marker
          coordinate={responderCoords}
          title="Your Location"
          description="You are here"
          anchor={{x: 0.5, y: 0.5}}>
          <View style={styles.markerWrapper}>
            <Image
              source={all.GetIcon(incidentState?.incidentType!)}
              style={styles.markerIcon}
            />
          </View>
        </Marker>

        {/* incident loc marker */}
        {incidentCoords && (
          <Marker
            coordinate={incidentCoords}
            title="Incident Location"
            description="Emergency incident"
            anchor={{x: 0.5, y: 0.5}}>
            <View style={styles.markerWrapper}>
              <Image
                source={all.GetEmergencyIcon(incidentState?.incidentType!)}
                style={styles.markerIcon}
              />
            </View>
          </Marker>
        )}

        {/* hospital marker */}
        {/* {hospitalCoords && (
          <Marker
            coordinate={hospitalCoords}
            title={incidentState?.selectedHospital?.name || "Hospital"}
            description={incidentState?.selectedHospital?.vicinity || ""}
            anchor={{x: 0.5, y: 0.5}}>
            <View style={styles.markerWrapper}>
              <Image
                source={require("@/assets/images/hospital.png")}
                style={styles.markerIcon}
              />
            </View>
          </Marker>
        )} */}

        <MapViewDirections
          origin={responderCoords}
          destination={incidentCoords}
          apikey={GOOGLE_MAPS_API_KEY!}
          strokeWidth={4}
          strokeColor="#1a73e8"
          mode="DRIVING"
          optimizeWaypoints={true}
          onReady={(result) => {
            setDistance(`${result.distance.toFixed(2)} km`);
            setDuration(`${Math.ceil(result.duration)} min`);
          }}
          onError={(errorMessage) => {
            console.log("Directions API error:", errorMessage);
          }}
        />
      </MapView>

      {/* Recenter button and distance info */}
      <View style={styles.topControlsContainer}>
        {distance &&
          duration &&
          (incidentState?.responderStatus == "enroute" ||
            incidentState?.responderStatus == "facility") && (
            <View style={styles.miniInfoContainer}>
              <Text style={styles.miniInfoText}>
                DIS: {distance} • ETA: {duration}
              </Text>
            </View>
          )}
        <TouchableOpacity
          style={styles.recenterButton}
          onPress={() => {
            if (mapRef.current && responderCoords) {
              mapRef.current.animateToRegion(
                {
                  ...responderCoords,
                  latitudeDelta: LATITUDE_DELTA,
                  longitudeDelta: LONGITUDE_DELTA,
                },
                1000
              );
            }
          }}>
          <Ionicons name="locate" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  infoContainer: {
    position: "absolute",
    bottom: 30,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 10,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoText: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 2,
  },
  markerWrapper: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "transparent",
  },

  markerIcon: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  recenterButton: {
    backgroundColor: "white",
    borderRadius: 30,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  topControlsContainer: {
    position: "absolute",
    right: 16,
    top: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  miniInfoContainer: {
    backgroundColor: "#FF6B6B",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  miniInfoText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
});
