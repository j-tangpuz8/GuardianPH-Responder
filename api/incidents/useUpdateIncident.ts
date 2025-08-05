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
  const updateData: any = {
    responderStatus: status,
  };
  
  // Set responderNotification to "unread" when status is "onscene"
  if (status === "onscene") {
    updateData.responderNotification = "unread";
  }
  
  return updateIncident(incidentId, updateData);
};

// request close incident
export const requestCloseIncident = async (
  incidentId: string
): Promise<any> => {
  return updateIncident(incidentId, {
    responderStatus: "rtb",
  });
};

// update the selected facility
export const updateIncidentSelectedFacility = async (
  incidentId: string,
  facilityId: string
): Promise<any> => {
  return updateIncident(incidentId, {
    selectedFacility: facilityId,
  });
};
