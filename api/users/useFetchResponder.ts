import {Responder} from "@/types/responder";
import {useQuery} from "@tanstack/react-query";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function getResponderAsync(responderId: string): Promise<Responder> {
  try {
    const response = await fetch(`${API_URL}/responders/${responderId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch responder info with id ${responderId}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error("Error fetching user info:", error.message);
    throw new Error("Failed to fetch user info");
  }
}

export const useFetchResponder = (responderId: string) => {
  return useQuery({
    queryKey: ["responder", responderId],
    queryFn: () => getResponderAsync(responderId),
    enabled: !!responderId,
  });
};
