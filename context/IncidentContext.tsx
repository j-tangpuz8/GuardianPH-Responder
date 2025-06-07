import * as SecureStore from "expo-secure-store";
import {createContext, useContext, useEffect, useState} from "react";
import {Facility} from "@/types/facility";
import {Incident} from "@/types/incident";
import {useAuth} from "./AuthContext";

interface IncidentContextProps {
  incidentState: Incident | null;
  setCurrentIncident: (data: Incident) => Promise<void>;
  updateIncidentLocation: (locationData: {
    latitude: number;
    longitude: number;
    address: string;
  }) => Promise<void>;
  clearIncident: () => Promise<void>;
}

const INCIDENT_KEY = "current-incident";
const IncidentContext = createContext<Partial<IncidentContextProps>>({});

// incident hook
export const useIncident = () => {
  return useContext(IncidentContext);
};

export const IncidentProvider = ({children}: any) => {
  const {authState} = useAuth();
  const userId = authState?.user_id;
  const [incidentState, setIncidentState] = useState<Incident | null>(null);

  useEffect(() => {
    const loadIncident = async () => {
      if (!userId) {
        setIncidentState(null);
        return;
      }
      const data = await SecureStore.getItemAsync(`${INCIDENT_KEY}-${userId}`);
      if (data) {
        const parsedData = JSON.parse(data);
        setIncidentState(parsedData);
      }
    };
    loadIncident();
  }, [userId]);

  const setCurrentIncident = async (data: Incident) => {
    try {
      if (userId) {
        await SecureStore.setItemAsync(
          `${INCIDENT_KEY}-${userId}`,
          JSON.stringify(data)
        );
      }
      setIncidentState(data);
    } catch (error) {
      console.error("Error saving incident:", error);
    }
  };

  const updateIncidentLocation = async (locationData: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    if (!incidentState) return;

    try {
      const updatedIncident = {
        ...incidentState,
        location: locationData,
      };

      if (userId) {
        await SecureStore.setItemAsync(
          `${INCIDENT_KEY}-${userId}`,
          JSON.stringify(updatedIncident)
        );
      }
      setIncidentState(updatedIncident);
    } catch (error) {
      console.error("Error updating incident location:", error);
    }
  };

  const clearIncident = async () => {
    try {
      if (userId) {
        await Promise.all([
          SecureStore.deleteItemAsync(`${INCIDENT_KEY}-${userId}`),
          SecureStore.deleteItemAsync(`vitalSignsData-${userId}`),
          SecureStore.deleteItemAsync(`patientDetailsData-${userId}`),
        ]);
      }
      setIncidentState(null);
    } catch (error) {
      console.error("Error clearing incident:", error);
    }
  };

  const value = {
    incidentState,
    setCurrentIncident,
    updateIncidentLocation,
    clearIncident,
  };

  return (
    <IncidentContext.Provider value={value}>
      {children}
    </IncidentContext.Provider>
  );
};
