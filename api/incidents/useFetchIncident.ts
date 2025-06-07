import * as SecureStore from "expo-secure-store";
import {useQuery} from "@tanstack/react-query";
import {Incident} from "@/types/incident";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// temporary before websocket signal
async function getIncidentForResponder(
  responderId: string
): Promise<Incident[]> {
  const response = await fetch(`${API_URL}/incidents/responder/${responderId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch incident");
  }
  return response.json();
}

export const useIncidentForResponder = (responderId: string) => {
  return useQuery({
    queryKey: ["incident", responderId],
    queryFn: () => getIncidentForResponder(responderId),
    enabled: !!responderId,
    refetchInterval: 10000,
  });
};

/////////// denial of incidents /////////////
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
//// end of denial of incidents //////
