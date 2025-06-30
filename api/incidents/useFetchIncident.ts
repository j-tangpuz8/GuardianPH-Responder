import * as SecureStore from "expo-secure-store";

/////////// denial of incidents - replace with websocket signal later /////////////
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
