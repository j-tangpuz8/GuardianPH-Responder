import React, {useState} from "react";
import * as Location from "expo-location";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const useLocation = () => {
  const [errorMsg, setErrorMsg] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);

  // get user's loc and geocode to address
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

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();

        if (data.status === "OK" && data.results.length > 0) {
          return {
            latitude,
            longitude,
            response: [
              {
                street: data.results[0].formatted_address,
                city: data.results[0].address_components.find((c: any) =>
                  c.types.includes("locality")
                )?.long_name,
                region: data.results[0].address_components.find((c: any) =>
                  c.types.includes("administrative_area_level_1")
                )?.long_name,
                country: data.results[0].address_components.find((c: any) =>
                  c.types.includes("country")
                )?.long_name,
              },
            ],
          };
        }
      } catch (error) {
        console.error("Error geocoding with Google Maps:", error);
        setErrorMsg("Failed to get address information");
      }
    }
    return null;
  };

  // general geocode function
  const getAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return "Location unavailable";
    } catch (error) {
      console.error("Error geocoding with Google Maps:", error);
      return "Location unavailable";
    }
  };

  return {lat, lon, errorMsg, getUserLocation, getAddressFromCoords};
};

export default useLocation;
