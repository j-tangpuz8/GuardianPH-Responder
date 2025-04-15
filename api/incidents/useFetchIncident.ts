import {Incident} from "@/types/incident";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const getDeniedIncidents = async (): Promise<string[]> => {
  try {
    const deniedIncidentsString = await SecureStore.getItemAsync(
      "deniedIncidents"
    );
    return deniedIncidentsString ? JSON.parse(deniedIncidentsString) : [];
  } catch (error) {
    console.error("Error getting denied incidents:", error);
    return [];
  }
};

export const fetchMultipleIncidents = async (): Promise<Incident[]> => {
  try {
    const response = await fetch(`${API_URL}/incidents/responder/active`);

    if (!response.ok) {
      if (response.status === 404) {
        console.log("No active incidents found");
        return [];
      }
      throw new Error(`Server responded with: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching active incidents:", error);
    return [];
  }
};

export const fetchRecentIncident = async (): Promise<Incident | null> => {
  try {
    const incidents = await fetchMultipleIncidents();

    if (incidents.length === 0) {
      return null;
    }

    const deniedIncidents = await getDeniedIncidents();
    // console.log("Denied incidents:", deniedIncidents);

    const availableIncidents = incidents.filter(
      (incident) => !deniedIncidents.includes(incident._id)
    );

    if (availableIncidents.length === 0) {
      console.log("All available incidents have been denied");
      return null;
    }
    availableIncidents.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const nextIncident = availableIncidents[0];
    // console.log("Selected next available incident:", nextIncident._id);

    return nextIncident;
  } catch (error) {
    console.error("Error fetching recent incident:", error);
    return null;
  }
};

export const denyIncident = async (incidentId: string): Promise<void> => {
  try {
    const deniedIncidents = await getDeniedIncidents();
    if (!deniedIncidents.includes(incidentId)) {
      deniedIncidents.push(incidentId);
      await SecureStore.setItemAsync(
        "deniedIncidents",
        JSON.stringify(deniedIncidents)
      );
    }
  } catch (error) {
    console.error("Error saving denied incident:", error);
  }
};

export const clearDeniedIncidents = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync("deniedIncidents");
  } catch (error) {
    console.error("Error clearing denied incidents:", error);
  }
};
