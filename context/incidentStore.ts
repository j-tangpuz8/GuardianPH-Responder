import {create} from "zustand";
import * as SecureStore from "expo-secure-store";
import {Incident} from "@/types/incident";
import {useAuthStore} from "./authStore";

interface IncidentState {
  incidentState: Incident | null;
  initialized: boolean;
}

interface IncidentActions {
  setCurrentIncident: (data: Incident) => Promise<void>;
  updateIncidentLocation: (locationData: {
    latitude: number;
    longitude: number;
    address: string;
  }) => Promise<void>;
  clearIncident: () => Promise<void>;
  setInitialized: (initialized: boolean) => void;
  isIncidentAssignedToCurrentUser: (userId: string) => boolean;
  loadStoredIncident: (userId: string) => Promise<void>;
}

export const useIncidentStore = create<IncidentState & IncidentActions>(
  (set, get) => ({
    incidentState: null,
    initialized: false,

    setInitialized: (initialized: boolean) => set({initialized}),

    loadStoredIncident: async (userId: string) => {
      try {
        if (!userId) {
          set({incidentState: null, initialized: true});
          return;
        }
        const data = await SecureStore.getItemAsync(
          `current-incident-${userId}`
        );
        if (data) {
          const parsedData = JSON.parse(data);
          set({incidentState: parsedData, initialized: true});
        } else {
          set({initialized: true});
        }
      } catch (error) {
        console.error("Error loading stored incident:", error);
        set({initialized: true});
      }
    },

    setCurrentIncident: async (data: Incident) => {
      try {
        const {user_id} = useAuthStore.getState();
        if (user_id) {
          await SecureStore.setItemAsync(
            `current-incident-${user_id}`,
            JSON.stringify(data)
          );
        }
        set({incidentState: data});
      } catch (error) {
        console.error("Error saving incident:", error);
      }
    },

    updateIncidentLocation: async (locationData: {
      latitude: number;
      longitude: number;
      address: string;
    }) => {
      const {incidentState} = get();
      if (!incidentState) return;

      try {
        const updatedIncident = {
          ...incidentState,
          location: locationData,
        };

        const {user_id} = useAuthStore.getState();
        if (user_id) {
          await SecureStore.setItemAsync(
            `current-incident-${user_id}`,
            JSON.stringify(updatedIncident)
          );
        }
        set({incidentState: updatedIncident});
      } catch (error) {
        console.error("Error updating incident location:", error);
      }
    },

    clearIncident: async () => {
      try {
        const {user_id} = useAuthStore.getState();
        if (user_id) {
          await Promise.all([
            SecureStore.deleteItemAsync(`current-incident-${user_id}`),
            SecureStore.deleteItemAsync(`vitalSignsData-${user_id}`),
            SecureStore.deleteItemAsync(`patientDetailsData-${user_id}`),
          ]);
        }
        set({incidentState: null});
      } catch (error) {
        console.error("Error clearing incident:", error);
      }
    },

    isIncidentAssignedToCurrentUser: (userId: string) => {
      const {incidentState} = get();
      if (!incidentState || !userId) return false;
      return incidentState.responder?._id === userId;
    },
  })
);
