import * as SecureStore from "expo-secure-store";
import {createContext, useContext, useEffect, useState} from "react";

interface IncidentData {
  emergencyType: string;
  channelId: string;
  incidentId: string;
  dispatcher?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    barangay?: string;
    city?: string;
    role: string;
  };
  lgu?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    barangay?: string;
    city?: string;
    role: string;
  };
  responderStatus?: "enroute" | "onscene" | "medicalFacility" | "rtb" | "close";
  timestamp: number;
  location?: {
    lat?: number;
    lon?: number;
    address?: string;
  };
}

interface IncidentContextProps {
  incidentState: IncidentData | null;
  setCurrentIncident: (data: IncidentData) => Promise<void>;
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
  const [incidentState, setIncidentState] = useState<IncidentData | null>(null);

  useEffect(() => {
    const loadIncident = async () => {
      const data = await SecureStore.getItemAsync(INCIDENT_KEY);
      if (data) {
        setIncidentState(JSON.parse(data));
      }
    };
    loadIncident();
  }, []);

  const setCurrentIncident = async (data: IncidentData) => {
    try {
      await SecureStore.setItemAsync(INCIDENT_KEY, JSON.stringify(data));
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

      await SecureStore.setItemAsync(
        INCIDENT_KEY,
        JSON.stringify(updatedIncident)
      );
      setIncidentState(updatedIncident);
    } catch (error) {
      console.error("Error updating incident location:", error);
    }
  };

  const clearIncident = async () => {
    try {
      await SecureStore.deleteItemAsync(INCIDENT_KEY);
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
