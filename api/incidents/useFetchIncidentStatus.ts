import {Incident} from "@/types/incident";
import {useQuery} from "@tanstack/react-query";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function getIncidentStatusAsync(incidentId: string): Promise<Incident> {
  try {
    const response = await fetch(`${API_URL}/incidents/${incidentId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch incident status with id ${incidentId}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error("Error fetching incident status:", error.message);
    throw new Error("Failed to fetch incident status");
  }
}

export const useFetchIncidentStatus = (incidentId: string) => {
  return useQuery({
    queryKey: ["incident", incidentId],
    queryFn: () => getIncidentStatusAsync(incidentId),
    enabled: !!incidentId,
    refetchInterval: 5000,
  });
};
