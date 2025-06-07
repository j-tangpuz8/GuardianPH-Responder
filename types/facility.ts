export type ContactPersonTitle = "Mr" | "Mrs" | "Ms" | "Dr";
export type FacilityAssignment = "Fire" | "Police" | "Medical" | "Other";

export interface ContactPerson {
  title: ContactPersonTitle;
  firstName: string;
  lastName: string;
  position: string;
  landline?: string;
  mobileNumber: string;
  alternatePhone?: string;
}

export interface FacilityCoordinates {
  lat: number;
  lng: number;
}

export interface FacilityLocation {
  coordinates: FacilityCoordinates;
}

export interface Facility {
  _id: string;
  name: string;
  description: string;
  assignment: FacilityAssignment;
  telNo: string;
  alternatePhone?: string;
  email?: string;
  location: FacilityLocation;
  contactPersons?: ContactPerson[];
}
