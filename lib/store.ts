'use client';

import {
  Incident,
  PersonReport,
  CoTravelerGroup,
  PreDisasterEntry,
  FieldSighting,
  InfrastructureFacility,
  NDRFUnit,
  ReportStatus
} from './types';
import {
  INITIAL_INCIDENT,
  INITIAL_PRE_DISASTER_ENTRIES,
  INITIAL_REPORTS,
  INITIAL_GROUPS,
  INITIAL_INFRASTRUCTURE,
  INITIAL_NDRF_UNITS
} from './seedData';
import { calculatePriorityScore } from './ai/priorityTriage';
import { OCRScanResult } from './ai/ocrManifest';
import { supabase } from './supabaseClient';

const STORAGE_KEY = 'sahayata_live_state_v1';

export interface AppState {
  incident: Incident;
  preDisasterEntries: PreDisasterEntry[];
  reports: PersonReport[];
  groups: CoTravelerGroup[];
  infrastructure: InfrastructureFacility[];
  ndrfUnits: NDRFUnit[];
  fieldSightings: FieldSighting[];
}

function loadInitialState(): AppState {
  return {
    incident: INITIAL_INCIDENT,
    preDisasterEntries: INITIAL_PRE_DISASTER_ENTRIES,
    reports: INITIAL_REPORTS,
    groups: INITIAL_GROUPS,
    infrastructure: INITIAL_INFRASTRUCTURE,
    ndrfUnits: INITIAL_NDRF_UNITS,
    fieldSightings: []
  };
}

// Simple pub/sub listener system for reactivity across components
type Listener = (state: AppState) => void;
let currentState: AppState = loadInitialState();
const listeners = new Set<Listener>();

function notify() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    } catch (e) {
      console.warn('Could not save state to localStorage', e);
    }
  }
  listeners.forEach(fn => fn(currentState));
}

export const sahayataStore = {
  getState: () => currentState,

  initClient: async () => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          currentState = JSON.parse(saved);
          notify();
        }
      } catch (e) {
        console.warn('Could not read state from localStorage', e);
      }

      // Background Cloud Sync with Supabase
      try {
        const [entriesRes, reportsRes] = await Promise.all([
          supabase.from('pre_disaster_entries').select('*'),
          supabase.from('person_reports').select('*')
        ]);

        let hasUpdates = false;

        if (entriesRes.data && entriesRes.data.length > 0) {
          const mappedEntries: PreDisasterEntry[] = entriesRes.data.map(e => ({
            id: e.id,
            groupName: e.group_name,
            groupType: e.group_type,
            leaderName: e.leader_name,
            leaderPhone: e.leader_phone,
            totalMembers: e.total_members,
            permitNumber: e.permit_number,
            vehicleNumber: e.vehicle_number,
            entryCheckpoint: e.entry_checkpoint,
            exitCheckpoint: e.exit_checkpoint,
            entryTime: e.entry_time,
            expectedExitTime: e.expected_exit_time,
            actualExitTime: e.actual_exit_time,
            status: e.status,
            members: e.members || []
          }));

          const existingIds = new Set(mappedEntries.map(e => e.id));
          const localOnly = currentState.preDisasterEntries.filter(e => !existingIds.has(e.id));
          currentState.preDisasterEntries = [...mappedEntries, ...localOnly];
          hasUpdates = true;
        }

        if (reportsRes.data && reportsRes.data.length > 0) {
          const mappedReports: PersonReport[] = reportsRes.data.map(r => ({
            id: r.id,
            incidentId: r.incident_id,
            fullName: r.full_name,
            alternateSpelling: r.alternate_spelling,
            approxAge: r.approx_age,
            gender: r.gender,
            photoUrl: r.photo_url,
            phone: r.phone,
            clothing: r.clothing,
            medicalConditions: r.medical_conditions,
            specialRequirements: r.special_requirements,
            lastKnownLocation: r.last_known_location,
            coordinates: r.coordinates || currentState.incident.center,
            lastContactTime: r.last_contact_time,
            contactMethod: r.contact_method,
            groupType: r.group_type,
            groupName: r.group_name,
            permitNumber: r.permit_number,
            inferredGroupId: r.inferred_group_id,
            reporterName: r.reporter_name,
            reporterPhone: r.reporter_phone,
            reporterRelationship: r.reporter_relationship,
            preferredLanguage: r.preferred_language || 'en',
            status: r.status,
            priority: r.priority,
            priorityScore: r.priority_score,
            priorityFactors: r.priority_factors || [],
            assignedTeamId: r.assigned_team_id,
            verifiedBy: r.verified_by,
            verifiedAt: r.verified_at,
            safeDiscloseLocation: r.safe_disclose_location,
            attachedDocument: r.attached_document,
            createdAt: r.created_at,
            updatedAt: r.updated_at
          }));

          const existingIds = new Set(mappedReports.map(r => r.id));
          const localOnly = currentState.reports.filter(r => !existingIds.has(r.id));
          currentState.reports = [...mappedReports, ...localOnly];
          hasUpdates = true;
        }

        if (hasUpdates) {
          notify();
        }
      } catch (cloudErr) {
        // Fallback to local state if offline
      }
    }
  },

  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  // Reset to default Nepal-Tibet benchmark
  resetToBenchmark: () => {
    currentState = {
      incident: INITIAL_INCIDENT,
      preDisasterEntries: INITIAL_PRE_DISASTER_ENTRIES,
      reports: INITIAL_REPORTS,
      groups: INITIAL_GROUPS,
      infrastructure: INITIAL_INFRASTRUCTURE,
      ndrfUnits: INITIAL_NDRF_UNITS,
      fieldSightings: []
    };
    notify();
  },

  // Pre-Disaster Checkpoint Registration
  addPreDisasterEntry: (entry: Omit<PreDisasterEntry, 'id' | 'entryTime' | 'status'>) => {
    const newEntry: PreDisasterEntry = {
      ...entry,
      id: `MAN-2026-${Math.floor(100 + Math.random() * 900)}`,
      entryTime: new Date().toISOString(),
      status: 'inside_zone'
    };
    currentState = {
      ...currentState,
      preDisasterEntries: [newEntry, ...currentState.preDisasterEntries]
    };
    notify();

    // Async Cloud Sync to Supabase
    supabase.from('pre_disaster_entries').insert({
      id: newEntry.id,
      group_name: newEntry.groupName,
      group_type: newEntry.groupType,
      leader_name: newEntry.leaderName,
      leader_phone: newEntry.leaderPhone,
      total_members: newEntry.totalMembers,
      permit_number: newEntry.permitNumber,
      vehicle_number: newEntry.vehicleNumber,
      entry_checkpoint: newEntry.entryCheckpoint,
      exit_checkpoint: newEntry.exitCheckpoint,
      entry_time: newEntry.entryTime,
      expected_exit_time: newEntry.expectedExitTime,
      status: newEntry.status,
      members: newEntry.members,
      danger_zones: []
    }).then(({ error }) => {
      if (error) console.warn('Supabase pre-disaster insert note:', error.message);
    });

    return newEntry;
  },

  // Instant Citizen / Family Report Intake (<200ms ACK)
  submitReport: (payload: {
    fullName: string;
    approxAge: number;
    gender: 'male' | 'female' | 'other' | 'unknown';
    clothing?: string;
    medicalConditions?: string;
    lastKnownLocation: string;
    contactMethod: 'call' | 'message' | 'in_person' | 'social_media' | 'other';
    groupType: 'tour' | 'trekking' | 'pilgrimage' | 'family' | 'alone' | 'unknown';
    groupName?: string;
    permitNumber?: string;
    reporterName: string;
    reporterPhone: string;
    reporterRelationship: string;
    preferredLanguage?: 'en' | 'hi';
    attachedDocument?: any;
  }): PersonReport => {
    // 1. Calculate Priority Score Deterministically
    const triage = calculatePriorityScore({
      approxAge: payload.approxAge,
      medicalConditions: payload.medicalConditions,
      clothing: payload.clothing,
      lastKnownLocation: payload.lastKnownLocation,
      contactMethod: payload.contactMethod
    });

    // 2. Generate unique Case ID
    const caseId = `SAH-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const newReport: PersonReport = {
      id: caseId,
      incidentId: currentState.incident.id,
      fullName: payload.fullName,
      approxAge: payload.approxAge,
      gender: payload.gender,
      clothing: payload.clothing,
      medicalConditions: payload.medicalConditions,
      lastKnownLocation: payload.lastKnownLocation,
      coordinates: [
        currentState.incident.center[0] + (Math.random() - 0.5) * 0.02,
        currentState.incident.center[1] + (Math.random() - 0.5) * 0.02
      ],
      lastContactTime: new Date().toISOString(),
      contactMethod: payload.contactMethod,
      groupType: payload.groupType,
      groupName: payload.groupName,
      permitNumber: payload.permitNumber,
      reporterName: payload.reporterName,
      reporterPhone: payload.reporterPhone,
      reporterRelationship: payload.reporterRelationship,
      preferredLanguage: payload.preferredLanguage || 'en',
      attachedDocument: payload.attachedDocument,
      status: 'received',
      priority: triage.priority,
      priorityScore: triage.score,
      priorityFactors: triage.factors,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 3. Auto-link to reconstructed group if matching permit or group name
    const updatedGroups = [...currentState.groups];
    if (payload.groupName || payload.permitNumber) {
      const match = updatedGroups.find(
        g =>
          (payload.permitNumber && g.permitNumber === payload.permitNumber) ||
          (payload.groupName && g.name.toLowerCase().includes(payload.groupName.toLowerCase()))
      );

      if (match) {
        newReport.inferredGroupId = match.id;
        match.members.push({
          reportId: newReport.id,
          fullName: newReport.fullName,
          status: newReport.status,
          medicalAlert: newReport.medicalConditions
        });
        match.missingCount += 1;
      }
    }

    currentState = {
      ...currentState,
      reports: [newReport, ...currentState.reports],
      groups: updatedGroups
    };
    notify();

    // Async Cloud Sync to Supabase
    supabase.from('person_reports').insert({
      id: newReport.id,
      incident_id: newReport.incidentId,
      full_name: newReport.fullName,
      approx_age: newReport.approxAge,
      gender: newReport.gender,
      clothing: newReport.clothing,
      medical_conditions: newReport.medicalConditions,
      last_known_location: newReport.lastKnownLocation,
      coordinates: newReport.coordinates,
      contact_method: newReport.contactMethod,
      group_type: newReport.groupType,
      group_name: newReport.groupName,
      permit_number: newReport.permitNumber,
      reporter_name: newReport.reporterName,
      reporter_phone: newReport.reporterPhone,
      reporter_relationship: newReport.reporterRelationship,
      preferred_language: newReport.preferredLanguage,
      status: newReport.status,
      priority: newReport.priority,
      priority_score: newReport.priorityScore,
      priority_factors: newReport.priorityFactors,
      attached_document: newReport.attachedDocument
    }).then(({ error }) => {
      if (error) console.warn('Supabase report sync note:', error.message);
    });

    return newReport;
  },

  // Sighting & Verification Workflow
  updateReportStatus: (
    reportId: string,
    newStatus: ReportStatus,
    safeLocation?: string,
    verifiedBy?: string
  ) => {
    currentState = {
      ...currentState,
      reports: currentState.reports.map(r => {
        if (r.id === reportId) {
          return {
            ...r,
            status: newStatus,
            safeDiscloseLocation: safeLocation || r.safeDiscloseLocation,
            verifiedBy: verifiedBy || r.verifiedBy || 'NDRF Verification Desk',
            verifiedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
        return r;
      }),
      // Also update inside group members if linked
      groups: currentState.groups.map(g => ({
        ...g,
        members: g.members.map(m =>
          m.reportId === reportId ? { ...m, status: newStatus } : m
        ),
        safeCount: g.members.filter(m => m.status === 'located_safe' || (m.reportId === reportId && newStatus === 'located_safe')).length
      }))
    };
    notify();

    // Async Cloud Sync to Supabase
    supabase.from('person_reports').update({
      status: newStatus,
      safe_disclose_location: safeLocation,
      verified_by: verifiedBy || 'NDRF Verification Desk',
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq('id', reportId).then(({ error }) => {
      if (error) console.warn('Supabase report status update note:', error.message);
    });
  },

  // Assign NDRF Unit
  assignNDRFUnit: (reportId: string, unitId: string) => {
    currentState = {
      ...currentState,
      reports: currentState.reports.map(r =>
        r.id === reportId ? { ...r, assignedTeamId: unitId, status: 'search_lead_issued' } : r
      ),
      ndrfUnits: currentState.ndrfUnits.map(u =>
        u.id === unitId ? { ...u, status: 'dispatched', assignedCaseId: reportId } : u
      )
    };
    notify();

    // Async Cloud Sync to Supabase
    supabase.from('person_reports').update({
      assigned_team_id: unitId,
      status: 'search_lead_issued',
      updated_at: new Date().toISOString()
    }).eq('id', reportId).then(({ error }) => {
      if (error) console.warn('Supabase report team assignment note:', error.message);
    });

    supabase.from('ndrf_units').update({
      status: 'dispatched',
      assigned_case_id: reportId,
      updated_at: new Date().toISOString()
    }).eq('id', unitId).then(({ error }) => {
      if (error) console.warn('Supabase unit status update note:', error.message);
    });
  },

  // OCR Document Reconciler (Reconciles existing + Adds new passengers)
  reconcileOCRDocument: (ocr: OCRScanResult) => {
    const updatedReports = [...currentState.reports];
    const newReportsAdded: PersonReport[] = [];

    // Check each passenger
    for (const p of ocr.passengers) {
      const existing = updatedReports.find(
        r => r.fullName.toLowerCase() === p.name.toLowerCase()
      );

      if (existing) {
        existing.permitNumber = ocr.permitNumber;
        existing.groupName = ocr.agencyName;
        existing.clothing = existing.clothing || 'Group apparel';
      } else {
        // Create new person report discovered via OCR
        const triage = calculatePriorityScore({
          approxAge: p.approxAge,
          lastKnownLocation: ocr.route
        });

        const newRep: PersonReport = {
          id: `SAH-2026-${Math.floor(100000 + Math.random() * 900000)}`,
          incidentId: currentState.incident.id,
          fullName: p.name,
          approxAge: p.approxAge || 40,
          gender: p.gender || 'unknown',
          lastKnownLocation: ocr.route,
          coordinates: [
            currentState.incident.center[0] + (Math.random() - 0.5) * 0.015,
            currentState.incident.center[1] + (Math.random() - 0.5) * 0.015
          ],
          lastContactTime: new Date().toISOString(),
          contactMethod: 'other',
          groupType: 'tour',
          groupName: ocr.agencyName,
          permitNumber: ocr.permitNumber,
          reporterName: `${ocr.agencyName} (OCR Ingest)`,
          reporterPhone: '+91 98111 23456',
          reporterRelationship: 'Carrier Manifest',
          preferredLanguage: 'en',
          status: 'received',
          priority: triage.priority,
          priorityScore: triage.score,
          priorityFactors: [
            ...triage.factors,
            { label: `Extracted via OCR Manifest (${ocr.documentType})`, weight: 20 }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        newReportsAdded.push(newRep);
      }
    }

    currentState = {
      ...currentState,
      reports: [...newReportsAdded, ...updatedReports]
    };
    notify();
    return {
      totalProcessed: ocr.passengers.length,
      newAdded: newReportsAdded.length,
      existingUpdated: ocr.passengers.length - newReportsAdded.length
    };
  },

  // Record Field Sighting
  recordFieldSighting: (sighting: Omit<FieldSighting, 'id' | 'sightingTime' | 'synced'>) => {
    const newSighting: FieldSighting = {
      ...sighting,
      id: `SGT-${Date.now()}`,
      sightingTime: new Date().toISOString(),
      synced: true
    };

    // If matches a report, update its status
    if (sighting.reportId) {
      sahayataStore.updateReportStatus(
        sighting.reportId,
        sighting.status,
        sighting.locationName,
        sighting.responderName
      );
    }

    currentState = {
      ...currentState,
      fieldSightings: [newSighting, ...currentState.fieldSightings]
    };
    notify();
    return newSighting;
  }
};
