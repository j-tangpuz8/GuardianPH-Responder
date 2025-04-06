import React, {useState} from "react";
import * as Location from "expo-location";

const useLocation = () => {
  const [errorMsg, setErrorMsg] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);

  const getUserLocation = async () => {
    let {status} = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return null;
    }

    let {coords} = await Location.getCurrentPositionAsync({});

    if (coords) {
      const {latitude, longitude} = coords;
      setLat(latitude);
      setLon(longitude);
      let response = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      return {latitude, longitude, response};
    }
    return null;
  };

  return {lat, lon, errorMsg, getUserLocation};
};

export default useLocation;
