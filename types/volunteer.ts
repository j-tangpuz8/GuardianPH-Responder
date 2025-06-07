export interface Coordinates {
  lat: number | null;
  lon: number | null;
}

export interface Volunteer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  coordinates?: Coordinates;
  profileImage?: string;
  barangay?: string;
  city?: string;
  rating?: number;
  rank?: string;
  gender: "male" | "female";
  dateOfBirth: Date;
  followedLGUs: string[];
}
