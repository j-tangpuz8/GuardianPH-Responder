import {Facility} from "./facility";
import {Volunteer} from "./volunteer";
import {Responder} from "./responder";
import {Dispatcher} from "./dispatcher";
import {OpCen} from "./opCen";

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface IncidentDetails {
  incident?: string;
  incidentDescription?: string;
  coordinates?: Coordinates;
  location?: string;
}

export interface Incident {
  _id: string;
  incidentType: string;
  isVerified: boolean;
  isResolved: boolean;
  isAccepted: boolean;
  isFinished: boolean;
  acceptedAt: Date;
  user: Volunteer;
  dispatcher?: Dispatcher;
  opCen?: OpCen;
  opCenStatus: "idle" | "connecting" | "connected";
  responder?: Responder;
  isAcceptedResponder: boolean;
  responderStatus?: "enroute" | "onscene" | "facility" | "rtb";
  responderCoordinates?: Coordinates;
  incidentDetails?: IncidentDetails;
  selectedFacility?: Facility;
  [key: string]: any;
}
