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
  coordinates: {lat: number; lon: number}
): Promise<any> => {
  return updateIncident(incidentId, {
    responderCoordinates: coordinates,
  });
};

// update status of the responder
export const updateResponderStatus = async (
  incidentId: string,
  status: "enroute" | "onscene" | "facility" | "rtb"
): Promise<any> => {
  return updateIncident(incidentId, {
    responderStatus: status,
  });
};

// request close incident
export const requestCloseIncident = async (
  incidentId: string
): Promise<any> => {
  return updateIncident(incidentId, {
    responderStatus: "rtb",
  });
};

// update the medical facility
export const updateIncidentHospital = async (
  incidentId: string,
  hospitalId: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/incidents/update/${incidentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hospitalId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update incident with hospital");
    }

    return true;
  } catch (error) {
    console.error("Error updating incident hospital:", error);
    return false;
  }
};
