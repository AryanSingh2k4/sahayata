export type ReportStatus =
  | 'received'
  | 'under_verification'
  | 'search_lead_issued'
  | 'located_safe'
  | 'located_injured'
  | 'identity_pending'
  | 'confirmed_deceased'
  | 'reunited';

export type PriorityLevel = 'P0' | 'P1' | 'P2' | 'P3';

export interface TriageFactor {
  label: string;
  weight: number;
  critical?: boolean;
}

export interface Incident {
  id: string;
  name: string;
  type: 'flash_flood' | 'landslide' | 'earthquake' | 'cloudburst' | 'avalanche';
  status: 'active' | 'contained' | 'closed';
  center: [number, number]; // [lat, lng]
  hazardPolygon: [number, number][]; // coordinates for flood zone
  activatedAt: string;
}

export interface PersonReport {
  id: string; // SAH-2026-XXXXXX
  incidentId: string;
  fullName: string;
  alternateSpelling?: string;
  approxAge: number;
  gender: 'male' | 'female' | 'other' | 'unknown';
  photoUrl?: string;
  phone?: string;
  clothing?: string;
  medicalConditions?: string;
  specialRequirements?: string;
  
  // Last Known Location
  lastKnownLocation: string;
  coordinates: [number, number]; // [lat, lng]
  lastContactTime: string;
  contactMethod: 'call' | 'message' | 'in_person' | 'social_media' | 'other';
  
  // Group Context
  groupType: 'tour' | 'trekking' | 'pilgrimage' | 'family' | 'alone' | 'unknown';
  groupName?: string;
  permitNumber?: string;
  inferredGroupId?: string;
  
  // Reporter Details
  reporterName: string;
  reporterPhone: string;
  reporterRelationship: string;
  preferredLanguage: 'en' | 'hi';
  
  // Operational Status
  status: ReportStatus;
  priority: PriorityLevel;
  priorityScore: number;
  priorityFactors: TriageFactor[];
  assignedTeamId?: string;
  
  // Verification
  verifiedBy?: string;
  verifiedAt?: string;
  safeDiscloseLocation?: string;
  attachedDocument?: {
    documentType: string;
    documentTypeLabel?: string;
    documentNumberMasked?: string;
    issuerOrAgency?: string;
    confidenceScore?: number;
    seatOrRoom?: string;
    route?: string;
    coPassengers?: any[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface CoTravelerGroup {
  id: string;
  name: string;
  groupType: 'tour' | 'trekking' | 'pilgrimage' | 'family';
  tourOperator: string;
  permitNumber: string;
  vehicleNumber?: string;
  totalMembers: number;
  safeCount: number;
  missingCount: number;
  unverifiedCount: number;
  explainability: string[];
  members: {
    reportId: string;
    fullName: string;
    status: ReportStatus;
    medicalAlert?: string;
  }[];
}

export interface PreDisasterEntry {
  id: string;
  groupName: string;
  groupType: string;
  leaderName: string;
  leaderPhone: string;
  totalMembers: number;
  permitNumber: string;
  vehicleNumber: string;
  entryCheckpoint: string;
  exitCheckpoint: string;
  entryTime: string;
  expectedExitTime: string;
  actualExitTime?: string;
  status: 'inside_zone' | 'exited' | 'overdue';
  members: string[];
  dangerZones: string[];
}

export interface FieldSighting {
  id: string;
  reportId?: string;
  personName: string;
  locationName: string;
  coordinates: [number, number];
  sightingTime: string;
  status: 'located_safe' | 'located_injured' | 'identity_pending';
  evidencePhoto?: string;
  notes?: string;
  responderName: string;
  synced: boolean;
}

export interface InfrastructureFacility {
  id: string;
  name: string;
  type: 'hospital' | 'relief_camp' | 'police_staging' | 'heli_base';
  coordinates: [number, number];
  capacity: number;
  currentOccupancy: number;
  contactNumber: string;
}

export interface NDRFUnit {
  id: string;
  callsign: string;
  battalion: string;
  status: 'available' | 'dispatched' | 'on_scene';
  distanceKm: number;
  equipment: string[];
  assignedCaseId?: string;
}
