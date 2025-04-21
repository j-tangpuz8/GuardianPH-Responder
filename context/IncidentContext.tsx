import {getHospitalById} from "@/api/hospitals/useHospitals";
import * as SecureStore from "expo-secure-store";
import {createContext, useContext, useEffect, useState} from "react";

interface IncidentData {
  emergencyType: string;
  channelId: string;
  incidentId: string;
  user: string | null;
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
  responderStatus?: string;
  location?: {
    lat?: number;
    lon?: number;
    address?: string;
  };
  selectedHospital?: {
    id: string;
    name: string;
    location: {
      lat: number;
      lng: number;
    };
    vicinity: string;
  } | null;
  selectedHospitalId?: string | null;
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
  updateSelectedHospital: (
    hospital: {
      id: string;
      name: string;
      location: {
        lat: number;
        lng: number;
      };
      vicinity: string;
    } | null,
    hospitalId?: string
  ) => Promise<void>;
  fetchSelectedHospital: () => Promise<void>;
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
        const parsedData = JSON.parse(data);
        setIncidentState(parsedData);

        if (parsedData.selectedHospitalId && !parsedData.selectedHospital) {
          fetchHospitalData(parsedData.selectedHospitalId);
        }
      }
    };
    loadIncident();
  }, []);

  const fetchHospitalData = async (hospitalId: string) => {
    if (!hospitalId) return;

    try {
      const hospital = await getHospitalById(hospitalId);
      if (hospital && incidentState) {
        const updatedIncident = {
          ...incidentState,
          selectedHospital: {
            id: hospital._id,
            name: hospital.name,
            location: {
              lat: hospital.coordinates.lat,
              lng: hospital.coordinates.lng,
            },
            vicinity: hospital.address,
          },
        };

        await SecureStore.setItemAsync(
          INCIDENT_KEY,
          JSON.stringify(updatedIncident)
        );
        setIncidentState(updatedIncident);
      }
    } catch (error) {
      console.error("Error fetching hospital data:", error);
    }
  };

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
      await Promise.all([
        SecureStore.deleteItemAsync(INCIDENT_KEY),
        SecureStore.deleteItemAsync("vitalSignsData"),
        SecureStore.deleteItemAsync("patientDetailsData"),
      ]);

      setIncidentState(null);
    } catch (error) {
      console.error("Error clearing incident:", error);
    }
  };

  const updateSelectedHospital = async (
    hospital: {
      id: string;
      name: string;
      location: {
        lat: number;
        lng: number;
      };
      vicinity: string;
    } | null,
    hospitalId?: string
  ) => {
    if (!incidentState) return;

    try {
      const updatedIncident = {
        ...incidentState,
        selectedHospital: hospital,
        selectedHospitalId: hospitalId || (hospital ? hospital.id : null),
      };

      await SecureStore.setItemAsync(
        INCIDENT_KEY,
        JSON.stringify(updatedIncident)
      );
      setIncidentState(updatedIncident);
    } catch (error) {
      console.error("Error updating selected hospital:", error);
    }
  };

  const fetchSelectedHospital = async () => {
    if (!incidentState || !incidentState.selectedHospitalId) return;
    return await fetchHospitalData(incidentState.selectedHospitalId);
  };

  const value = {
    incidentState,
    setCurrentIncident,
    updateIncidentLocation,
    clearIncident,
    updateSelectedHospital,
    fetchSelectedHospital,
  };

  return (
    <IncidentContext.Provider value={value}>
      {children}
    </IncidentContext.Provider>
  );
};
