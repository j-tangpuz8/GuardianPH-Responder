import {Hospital} from "@/hooks/useGetHospitals";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// add hospital to db and update incident with hospital
export const addHospitalAndUpdateIncident = async (
  hospital: Hospital,
  incidentId: string
): Promise<{hospitalId: string; success: boolean}> => {
  try {
    const checkResponse = await fetch(
      `${API_URL}/hospitals/?name=${encodeURIComponent(
        hospital.name
      )}&address=${encodeURIComponent(hospital.vicinity)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const existingHospitals = await checkResponse.json();
    let hospitalId;

    if (!existingHospitals || existingHospitals.length === 0) {
      const createResponse = await fetch(`${API_URL}/hospitals/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: hospital.name,
          address: hospital.vicinity,
          coordinates: {
            lat: hospital.location.lat,
            lng: hospital.location.lng,
          },
          phoneNumber: "",
        }),
      });
      if (!createResponse.ok) {
        throw new Error("Failed to create hospital");
      }

      const newHospital = await createResponse.json();
      hospitalId = newHospital._id;
    } else {
      hospitalId = existingHospitals[0]._id;
    }
    const updateResponse = await fetch(
      `${API_URL}/incidents/update/${incidentId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedHospital: hospitalId,
        }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error("Failed to update incident with hospital");
    }

    return {hospitalId, success: true};
  } catch (error) {
    console.error("Error in addHospitalAndUpdateIncident:", error);
    return {hospitalId: "", success: false};
  }
};

// Get hospital by ID
export const getHospitalById = async (hospitalId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/hospitals/${hospitalId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch hospital");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching hospital:", error);
    return null;
  }
};
