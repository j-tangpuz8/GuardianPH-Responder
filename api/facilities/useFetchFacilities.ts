import {Facility} from "@/types/facility";
import {useQuery} from "@tanstack/react-query";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const convertToFacilityAssignment = (responderAssignment: string): string => {
  const converted = (() => {
    switch (responderAssignment) {
      case "ambulance":
        return "Medical";
      case "firetruck":
        return "Fire";
      case "police":
        return "Police";
      default:
        return "Other";
    }
  })();
  return converted;
};

async function getFacilitiesByAssignment(
  assignment: string
): Promise<Facility[]> {
  try {
    const facilityAssignment = convertToFacilityAssignment(assignment);
    const response = await fetch(
      `${API_URL}/facilities/assignment/${facilityAssignment}`
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error("err API Error Response:", errorText);
      throw new Error(
        `Failed to fetch facilities with assignment ${facilityAssignment}: ${errorText}`
      );
    }
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("err rror fetching facilities:", error.message);
    throw error;
  }
}

export const useFetchFacilitiesByAssignment = (assignment: string) => {
  return useQuery({
    queryKey: ["facilities", assignment],
    queryFn: () => getFacilitiesByAssignment(assignment),
    enabled: !!assignment,
  });
};
