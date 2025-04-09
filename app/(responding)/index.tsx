import {StyleSheet, Text, View} from "react-native";
import React, {useEffect} from "react";
import useLocation from "@/hooks/useLocation";
import MapView, {PROVIDER_GOOGLE} from "react-native-maps";

const index = () => {
  const {lat, lon, errorMsg, getUserLocation} = useLocation();

  useEffect(() => {
    const getLocation = async () => {
      const locationData = await getUserLocation();
      if (locationData) {
        console.log("User latitude:", locationData.latitude);
        console.log("User longitude:", locationData.longitude);
      } else {
        console.log("Could not get location:", errorMsg);
      }
    };

    getLocation();
  }, []);

  return (
    <View>
      <Text>index</Text>
      {lat && lon ? (
        <Text>
          Location: {lat.toFixed(6)}, {lon.toFixed(6)}
        </Text>
      ) : (
        <Text>{errorMsg || "Getting location..."}</Text>
      )}
    </View>
  );
};

export default index;

const styles = StyleSheet.create({});
