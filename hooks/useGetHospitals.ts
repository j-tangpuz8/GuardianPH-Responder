import {useState, useEffect} from "react";
import * as Location from "expo-location";

export interface Hospital {
  id: string;
  name: string;
  vicinity: string;
  distance: number;
  rating?: number;
  openNow?: boolean;
  placeId: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface UseNearbyHospitalsProps {
  radius?: number;
  limit?: number;
}

export function useNearbyHospitals({
  radius = 5000,
  limit = 3,
}: UseNearbyHospitalsProps = {}) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);

  // get my loc
  const getUserLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation(location);
      return location;
    } catch (err) {
      setError("Failed to get user location");
      console.error(err);
      return null;
    }
  };

  const fetchNearbyHospitals = async (location: Location.LocationObject) => {
    if (!location) return;

    setLoading(true);
    setError(null);

    try {
      const {latitude, longitude} = location.coords;
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        throw new Error("Google Maps API key is not configured");
      }

      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=hospital&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK") {
        throw new Error(`API Error: ${data.status}`);
      }

      // Calculate distances for all results first
      const hospitalsWithDistance = data.results.map((place: any) => ({
        id: place.place_id,
        name: place.name,
        vicinity: place.vicinity,
        placeId: place.place_id,
        rating: place.rating,
        openNow: place.opening_hours?.open_now,
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
        distance: calculateDistance(
          latitude,
          longitude,
          place.geometry.location.lat,
          place.geometry.location.lng
        ),
      }));

      // Sort by distance and then take only the top 'limit' results
      const processedHospitals: Hospital[] = hospitalsWithDistance
        .sort((a: Hospital, b: Hospital) => a.distance - b.distance)
        .slice(0, limit);

      setHospitals(processedHospitals);
    } catch (err: any) {
      setError(err.message || "Failed to fetch nearby hospitals");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance);
  };

  const refreshHospitals = async () => {
    const location = await getUserLocation();
    if (location) {
      await fetchNearbyHospitals(location);
    }
  };

  useEffect(() => {
    refreshHospitals();
  }, []);

  return {
    hospitals,
    loading,
    error,
    refreshHospitals,
    userLocation,
  };
}
