export interface Coordinates {
  lat: number | null;
  lon: number | null;
}

export interface IncidentLocation {
  address?: string;
  coordinates?: Coordinates;
}

export interface IncidentDetails {
  incident?: string | null;
  incidentDescription?: string | null;
  coordinates?: Coordinates;
  [key: string]: any;
}

export interface Hospital {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  vicinity: string;
}

export interface Incident {
  _id: string;
  incidentType: string;
  isVerified: boolean;
  isResolved: boolean;
  isAccepted: boolean;
  isFinished: boolean;
  acceptedAt: string | null;
  resolvedAt: string | null;
  user: string;
  dispatcher?: string | null;
  lgu?: string | null;
  lguStatus: "idle" | "connecting" | "connected";
  responder?: string | null;
  isAcceptedResponder: boolean;
  responderStatus?:
    | "enroute"
    | "onscene"
    | "medicalFacility"
    | "rtb"
    | "close"
    | null;
  incidentDetails?: IncidentDetails;
  location?: IncidentLocation;
  selectedHospitalId?: string | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}
