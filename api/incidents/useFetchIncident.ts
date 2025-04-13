import {Incident} from "@/types/incident";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const fetchRecentIncident = async (): Promise<Incident | null> => {
  try {
    const response = await fetch(`${API_URL}/incidents/responder/recent`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Server responded with: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching recent incident:", error);
    return null;
  }
};
