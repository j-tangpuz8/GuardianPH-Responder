import {Hospital} from "@/hooks/useGetHospitals";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// add hospital to db and update incident with hospital
export const addHospitalAndUpdateIncident = async (
  hospital: Hospital,
  incidentId: string
): Promise<{hospitalId: string; success: boolean}> => {
  try {
    // console.log("Hospital being processed:", JSON.stringify(hospital));

    // Get all hospitals and filter manually
    const allHospitalsResponse = await fetch(`${API_URL}/hospitals/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const allHospitals = await allHospitalsResponse.json();
    // console.log("All hospitals:", JSON.stringify(allHospitals));

    // Find exact match by name
    const exactMatch = allHospitals.find((h: any) => h.name === hospital.name);
    // console.log(
    //   "Exact match result:",
    //   exactMatch ? JSON.stringify(exactMatch) : "No exact match"
    // );

    let hospitalId;

    if (!exactMatch) {
      // console.log("Creating new hospital:", hospital.name);
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

      const responseText = await createResponse.text();
      // console.log("Create hospital response:", responseText);

      if (!createResponse.ok) {
        throw new Error(`Failed to create hospital: ${responseText}`);
      }

      try {
        const newHospital = JSON.parse(responseText);
        hospitalId = newHospital._id;
        // console.log("New hospital created with ID:", hospitalId);
      } catch (parseError) {
        console.error("Error parsing hospital creation response:", parseError);
        throw new Error("Invalid response format from hospital creation");
      }
    } else {
      hospitalId = exactMatch._id;
      console.log("Using existing hospital with ID:", hospitalId);
    }

    // console.log("Updating incident with hospital ID:", hospitalId);
    // console.log("Incident ID being updated:", incidentId);

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

    const updateResponseText = await updateResponse.text();
    // console.log("Update incident response:", updateResponseText);

    if (!updateResponse.ok) {
      throw new Error(
        `Failed to update incident with hospital: ${updateResponseText}`
      );
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
