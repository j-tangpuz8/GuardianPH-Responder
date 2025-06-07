export type Assignment = "ambulance" | "firetruck" | "police";
export type Status = "active" | "inactive";

export interface Responder {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  barangay?: string;
  city?: string;
  assignment: Assignment;
  status: Status;
}
