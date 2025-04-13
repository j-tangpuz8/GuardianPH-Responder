const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const updateIncident = async (id: string, data: any): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/incidents/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error updating incident: ", error);
    throw error;
  }
};

export const assignResponder = async (
  incidentId: string,
  responderId: string,
  coordinates: {lat: number; lon: number}
): Promise<any> => {
  return updateIncident(incidentId, {
    responder: responderId,
    isAcceptedResponder: true,
    responderCoordinates: coordinates,
  });
};
