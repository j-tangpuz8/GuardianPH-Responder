import {Volunteer} from "@/types/volunteer";
import {useQuery} from "@tanstack/react-query";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function getVolunteerAsync(volunteerId: string): Promise<Volunteer> {
  try {
    const response = await fetch(`${API_URL}/volunteers/${volunteerId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch volunteer info with id ${volunteerId}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error("Error fetching user info:", error.message);
    throw new Error("Failed to fetch user info");
  }
}

export const useFetchVolunteer = (volunteerId: string) => {
  return useQuery({
    queryKey: ["volunteer", volunteerId],
    queryFn: () => getVolunteerAsync(volunteerId),
    enabled: !!volunteerId,
  });
};
