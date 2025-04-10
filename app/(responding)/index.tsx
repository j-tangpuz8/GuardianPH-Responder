import {StyleSheet, Text, View, Dimensions} from "react-native";
import React, {useEffect, useState} from "react";
import useLocation from "@/hooks/useLocation";
import MapView, {Marker, PROVIDER_GOOGLE, Region} from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import {useIncident} from "@/context/IncidentContext";

// Define your Google Maps API key here - this should have Directions API enabled
// const GOOGLE_MAPS_API_KEY = "";

// const {width, height} = Dimensions.get("window");
// const ASPECT_RATIO = width / height;
// const LATITUDE_DELTA = 0.0922;
// const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const index = () => {
  // const {lat, lon, errorMsg, getUserLocation} = useLocation();
  // const {incidentState} = useIncident();
  // const [mapRegion, setMapRegion] = useState<Region | null>(null);
  // const [distance, setDistance] = useState<string | null>(null);
  // const [duration, setDuration] = useState<string | null>(null);

  // useEffect(() => {
  //   const getLocation = async () => {
  //     const locationData = await getUserLocation();
  //     if (locationData) {
  //       console.log("User latitude:", locationData.latitude);
  //       console.log("User longitude:", locationData.longitude);

  //       // Set initial map region to user's location
  //       if (incidentState?.location) {
  //         // Calculate the center point between user and incident
  //         const midLat =
  //           (locationData.latitude + incidentState?.location.lat!) / 2;
  //         const midLon =
  //           (locationData.longitude + incidentState?.location.lon!) / 2;

  //         // Calculate the span to include both points with padding
  //         const latDelta =
  //           Math.abs(locationData.latitude - incidentState?.location.lat!) *
  //           1.5;
  //         const lonDelta =
  //           Math.abs(locationData.longitude - incidentState?.location.lon!) *
  //           1.5;

  //         setMapRegion({
  //           latitude: midLat,
  //           longitude: midLon,
  //           latitudeDelta: Math.max(latDelta, LATITUDE_DELTA),
  //           longitudeDelta: Math.max(lonDelta, LONGITUDE_DELTA),
  //         });
  //       } else {
  //         setMapRegion({
  //           latitude: locationData.latitude,
  //           longitude: locationData.longitude,
  //           latitudeDelta: LATITUDE_DELTA,
  //           longitudeDelta: LONGITUDE_DELTA,
  //         });
  //       }
  //     } else {
  //       console.log("Could not get location:", errorMsg);
  //     }
  //   };

  //   getLocation();
  // }, [incidentState]);

  // // Modify the condition to check if both lat and lon exist
  // if (
  //   !lat ||
  //   !lon ||
  //   !incidentState?.location?.lat ||
  //   !incidentState?.location?.lon
  // ) {
  //   return (
  //     <View style={styles.container}>
  //       <Text>{errorMsg || "Loading map data..."}</Text>
  //     </View>
  //   );
  // }

  return (
    // <View style={styles.container}>
    //   <MapView
    //     provider={PROVIDER_GOOGLE}
    //     style={styles.map}
    //     region={mapRegion!}
    //     showsUserLocation={true}
    //     showsMyLocationButton={true}>
    //     {/* User's location marker */}
    //     <Marker
    //       coordinate={{
    //         latitude: lat,
    //         longitude: lon,
    //       }}
    //       title="Your Location"
    //       description="You are here"
    //       pinColor="blue"
    //     />

    //     {/* Incident location marker - Fix type error by ensuring lat/lon are numbers */}
    //     <Marker
    //       coordinate={{
    //         latitude: Number(incidentState.location.lat),
    //         longitude: Number(incidentState.location.lon),
    //       }}
    //       title="Incident Location"
    //       description="Emergency incident"
    //       pinColor="red"
    //     />

    //     {/* Directions between the two points using Google Maps Direction API */}
    //     <MapViewDirections
    //       origin={{
    //         latitude: lat,
    //         longitude: lon,
    //       }}
    //       destination={{
    //         latitude: Number(incidentState.location.lat),
    //         longitude: Number(incidentState.location.lon),
    //       }}
    //       apikey={GOOGLE_MAPS_API_KEY!}
    //       strokeWidth={4}
    //       strokeColor="#1a73e8"
    //       mode="DRIVING"
    //       optimizeWaypoints={true}
    //       onStart={(params) => {
    //         console.log(
    //           `Starting routing between "${params.origin}" and "${params.destination}"`
    //         );
    //       }}
    //       onReady={(result) => {
    //         console.log(`Distance: ${result.distance} km`);
    //         console.log(`Duration: ${result.duration} min.`);
    //         setDistance(`${result.distance.toFixed(2)} km`);
    //         setDuration(`${Math.ceil(result.duration)} min`);
    //       }}
    //       onError={(errorMessage) => {
    //         console.log("Directions API error:", errorMessage);
    //       }}
    //     />
    //   </MapView>

    //   {/* Display distance and duration information */}
    //   {distance && duration && (
    //     <View style={styles.infoContainer}>
    //       <Text style={styles.infoText}>Distance: {distance}</Text>
    //       <Text style={styles.infoText}>ETA: {duration}</Text>
    //     </View>
    //   )}
    // </View>
    <View>
      <Text>Map Here</Text>
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
});
