import Dexie, { Table } from 'dexie';

export interface OfflinePersonEntry {
  id?: number;
  fullName: string;
  approxAge: number;
  gender: string;
  foundLocation: string;
  medicalCondition?: string;
  photoBase64?: string;
  timestamp: string;
  synced: boolean;
}

export interface OfflineSightingEntry {
  id?: number;
  reportId?: string;
  personName: string;
  locationName: string;
  status: 'located_safe' | 'located_injured' | 'identity_pending';
  notes?: string;
  timestamp: string;
  synced: boolean;
}

export class SahayataOfflineDatabase extends Dexie {
  offlinePersons!: Table<OfflinePersonEntry, number>;
  offlineSightings!: Table<OfflineSightingEntry, number>;

  constructor() {
    super('SahayataFieldOfflineDB');
    this.version(1).stores({
      offlinePersons: '++id, fullName, timestamp, synced',
      offlineSightings: '++id, reportId, personName, status, timestamp, synced'
    });
  }
}

export const offlineDb = new SahayataOfflineDatabase();
