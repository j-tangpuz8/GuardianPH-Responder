import {useState, useCallback} from "react";

export const useFetchIncidentStatus = (incidentId?: string) => {
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!incidentId) {
      setError("No incident ID provided");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/incidents/${incidentId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch incident status: ${response.status}`);
      }

      const data = await response.json();
      setIsFinished(data.isFinished || false);
    } catch (err) {
      console.error("Error fetching incident status:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch incident status"
      );
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  return {isFinished, loading, error, fetchStatus};
};
