import * as Location from "expo-location";

export const getAddressFromCoords = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    const {status} = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Location permission not granted");
    }

    const response = await Location.reverseGeocodeAsync({latitude, longitude});
    if (response && response[0]) {
      const {street, name, city} = response[0];
      return (
        `${street || name || ""}, ${city || ""}`.trim() ||
        "Location unavailable"
      );
    }
    return "Location unavailable";
  } catch (error) {
    console.error("Geocoding error:", error);
    return "Location unavailable";
  }
};
