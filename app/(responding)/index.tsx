import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
  Image,
} from "react-native";
import React, {useEffect, useState, useRef, useMemo} from "react";
import useLocation from "@/hooks/useLocation";
import MapView, {Marker, PROVIDER_GOOGLE, Region} from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import {useIncident} from "@/context/IncidentContext";
import all from "@/utils/getIcon";
import {TouchableOpacity} from "react-native";
import {Ionicons} from "@expo/vector-icons";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const {width, height} = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const index = () => {
  const {lat, lon, errorMsg, getUserLocation} = useLocation();
  const {incidentState} = useIncident();
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<MapView>(null);

  const userCoords = useMemo(() => {
    return lat && lon
      ? {
          latitude: lat,
          longitude: lon,
        }
      : null;
  }, [lat, lon]);

  // const incidentCoords = useMemo(() => {
  //   return incidentState?.location?.lat && incidentState?.location?.lon
  //     ? {
  //         latitude: Number(incidentState.location.lat),
  //         longitude: Number(incidentState.location.lon),
  //       }
  //     : null;
  // }, [incidentState?.location?.lat, incidentState?.location?.lon]);

  const incidentCoords = useMemo(
    () => ({
      latitude: 10.373,
      longitude: 123.9545,
    }),
    []
  );

  useEffect(() => {
    let isMounted = true;

    const getLocation = async () => {
      try {
        setIsLoading(true);
        const locationData = await getUserLocation();

        if (!isMounted) return;

        if (
          locationData &&
          incidentState?.location?.lat &&
          incidentState?.location?.lon
        ) {
          const midLat =
            (locationData.latitude + incidentState.location.lat) / 2;
          const midLon =
            (locationData.longitude + incidentState.location.lon) / 2;

          const latDelta =
            Math.abs(locationData.latitude - incidentState.location.lat) * 1.5;
          const lonDelta =
            Math.abs(locationData.longitude - incidentState.location.lon) * 1.5;

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
  }, [incidentState?.location?.lat, incidentState?.location?.lon]);

  // map loading state ui
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  // err handling
  if (!userCoords || !incidentCoords) {
    return (
      <View style={styles.container}>
        <Text>
          {errorMsg ||
            "Unable to load map data. Please check your location settings."}
        </Text>
      </View>
    );
  }

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
          coordinate={userCoords}
          title="Your Location"
          description="You are here">
          <View style={styles.markerWrapper}>
            <Image
              source={all.GetIcon(incidentState?.emergencyType!)}
              style={styles.markerIcon}
            />
          </View>
        </Marker>

        {/* incident loc marker */}
        <Marker
          coordinate={incidentCoords}
          title="Incident Location"
          description="Emergency incident">
          <View style={styles.markerWrapper}>
            <Image
              source={all.GetEmergencyIcon(incidentState?.emergencyType!)}
              style={styles.markerIcon}
            />
          </View>
        </Marker>

        <MapViewDirections
          origin={userCoords}
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

      {/* Recenter button */}
      <TouchableOpacity
        style={styles.recenterButton}
        onPress={() => {
          if (mapRef.current && userCoords) {
            mapRef.current.animateToRegion(
              {
                ...userCoords,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
              },
              1000
            );
          }
        }}>
        <Ionicons name="locate" size={24} color="#2196F3" />
      </TouchableOpacity>

      {/* distance info and eta */}
      {distance && duration && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Distance: {distance}</Text>
          <Text style={styles.infoText}>ETA: {duration}</Text>
        </View>
      )}
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
    width: 40,
    height: 35,
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
    position: "absolute",
    right: 16,
    top: 16,
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
});
