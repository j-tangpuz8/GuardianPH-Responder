import {useState, useEffect} from "react";
import {useAuth} from "@/context/AuthContext";
import {useIncident} from "@/context/IncidentContext";

interface UserInfo {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  barangay?: string;
  city?: string;
  role?: string;
}

export const useGetVolunteerInfo = () => {
  const [volunteerInfo, setVolunteerInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const {incidentState} = useIncident();

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!incidentState?.user) {
        setVolunteerInfo(null);
        return;
      }

      if (
        typeof incidentState.user === "object" &&
        incidentState.user !== null
      ) {
        setVolunteerInfo(incidentState.user as UserInfo);
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/users/${incidentState?.user}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch user info: ${response.status}`);
        }

        const data = await response.json();
        setVolunteerInfo(data);
      } catch (err) {
        console.error("Error fetching user info:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch user info"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [incidentState]);

  return {volunteerInfo, isLoading, error};
};
