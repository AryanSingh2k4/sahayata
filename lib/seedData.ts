import {
  Incident,
  PersonReport,
  CoTravelerGroup,
  PreDisasterEntry,
  InfrastructureFacility,
  NDRFUnit
} from './types';

export const INITIAL_INCIDENT: Incident = {
  id: 'INC-2026-NEP-042',
  name: 'August 2026 Nepal-Tibet Flash Flood (Bhotekoshi Corridor)',
  type: 'flash_flood',
  status: 'active',
  center: [27.9482, 85.9458], // Tatopani / Bhotekoshi sector
  hazardPolygon: [
    [27.9620, 85.9320],
    [27.9710, 85.9550],
    [27.9450, 85.9680],
    [27.9250, 85.9500],
    [27.9350, 85.9280]
  ],
  activatedAt: '2026-08-28T06:30:00Z'
};

export const INITIAL_PRE_DISASTER_ENTRIES: PreDisasterEntry[] = [
  {
    id: 'MAN-2026-081',
    groupName: 'Pilgrim Trail Group 17 (Kailash Yatra)',
    groupType: 'pilgrimage',
    leaderName: 'Somnath Joshi',
    leaderPhone: '+91 98201 44521',
    totalMembers: 61,
    permitNumber: 'KY-2026-BH-991',
    vehicleNumber: 'UK-07-TA-4491',
    entryCheckpoint: 'Tatopani Gate B',
    exitCheckpoint: 'Kodari Border Post',
    entryTime: '2026-08-28T07:15:00Z',
    expectedExitTime: '2026-08-28T17:00:00Z',
    status: 'overdue',
    dangerZones: ['Bhotekoshi River Gorge', 'Tatopani Flood Plain'],
    members: [
      'Dr. Milind Chitley',
      'Dr. Janhavi Chitley',
      'Somnath Joshi',
      'Radha Joshi',
      'Sunil Gavaskar',
      'Meena Deshmukh',
      'Ganesh Hegde',
      'Ananya Bhatt'
    ]
  },
  {
    id: 'MAN-2026-092',
    groupName: 'Annapurna Valley Solo Trekkers',
    groupType: 'trekking',
    leaderName: 'Karan Mehra',
    leaderPhone: '+91 94191 88210',
    totalMembers: 7,
    permitNumber: 'TK-2026-904',
    vehicleNumber: 'N/A (Foot)',
    entryCheckpoint: 'Tatopani Gate B',
    exitCheckpoint: 'Barhabise Outpost',
    entryTime: '2026-08-28T08:00:00Z',
    expectedExitTime: '2026-08-28T18:00:00Z',
    status: 'inside_zone',
    dangerZones: [],
    members: ['Karan Mehra', 'Vikram Rathore', 'Priya Sethi']
  }
];

export const INITIAL_REPORTS: PersonReport[] = [
  {
    id: 'SAH-2026-001458',
    incidentId: 'INC-2026-NEP-042',
    fullName: 'Dr. Milind Chitley',
    approxAge: 60,
    gender: 'male',
    clothing: 'Yellow raincoat, trekking boots',
    medicalConditions: 'Severe Asthma, high-altitude vulnerability',
    lastKnownLocation: 'Bhotekoshi River Bridge X',
    coordinates: [27.9510, 85.9480],
    lastContactTime: '2026-08-28T13:45:00Z',
    contactMethod: 'call',
    groupType: 'pilgrimage',
    groupName: 'Pilgrim Trail Group 17',
    permitNumber: 'KY-2026-BH-991',
    reporterName: 'Adv. Rohan Chitley',
    reporterPhone: '+91 98200 12345',
    reporterRelationship: 'Son (Mumbai)',
    preferredLanguage: 'en',
    status: 'search_lead_issued',
    priority: 'P0',
    priorityScore: 94,
    priorityFactors: [
      { label: 'Severe Asthma / Medical Emergency', weight: 40, critical: true },
      { label: 'Inside Active Flood Boundary (<200m to Bridge X)', weight: 30, critical: true },
      { label: 'Elderly Demographic (Age 60)', weight: 15 },
      { label: 'Over 6 hours uncontacted', weight: 9 }
    ],
    assignedTeamId: 'NDRF-UNIT-02',
    createdAt: '2026-08-28T14:10:00Z',
    updatedAt: '2026-08-28T15:30:00Z'
  },
  {
    id: 'SAH-2026-001459',
    incidentId: 'INC-2026-NEP-042',
    fullName: 'Dr. Janhavi Chitley',
    approxAge: 57,
    gender: 'female',
    clothing: 'Red windcheater, blue backpack',
    medicalConditions: 'None reported',
    lastKnownLocation: 'Border Camp 3 transit area',
    coordinates: [27.9420, 85.9390],
    lastContactTime: '2026-08-28T16:00:00Z',
    contactMethod: 'in_person',
    groupType: 'pilgrimage',
    groupName: 'Pilgrim Trail Group 17',
    permitNumber: 'KY-2026-BH-991',
    reporterName: 'Adv. Rohan Chitley',
    reporterPhone: '+91 98200 12345',
    reporterRelationship: 'Son (Mumbai)',
    preferredLanguage: 'en',
    status: 'located_safe',
    priority: 'P2',
    priorityScore: 25,
    priorityFactors: [
      { label: 'Sighted and verified by Field Unit 02', weight: 10 }
    ],
    safeDiscloseLocation: 'Kodari Border Relief Camp 3',
    verifiedBy: 'Inspector Rajesh Verma (NDRF)',
    verifiedAt: '2026-08-28T16:15:00Z',
    createdAt: '2026-08-28T14:15:00Z',
    updatedAt: '2026-08-28T16:15:00Z'
  },
  {
    id: 'SAH-2026-001460',
    incidentId: 'INC-2026-NEP-042',
    fullName: 'Somnath Joshi',
    approxAge: 52,
    gender: 'male',
    clothing: 'Orange jacket, group tour guide badge',
    medicalConditions: 'Minor leg injury',
    lastKnownLocation: 'Tatopani Checkpoint sector',
    coordinates: [27.9540, 85.9520],
    lastContactTime: '2026-08-28T12:30:00Z',
    contactMethod: 'message',
    groupType: 'pilgrimage',
    groupName: 'Pilgrim Trail Group 17',
    permitNumber: 'KY-2026-BH-991',
    reporterName: 'Kailash Safaris Agency',
    reporterPhone: '+91 98111 23456',
    reporterRelationship: 'Tour Organizer',
    preferredLanguage: 'hi',
    status: 'located_injured',
    priority: 'P1',
    priorityScore: 78,
    priorityFactors: [
      { label: 'Tour leader responsible for 61 pilgrims', weight: 25 },
      { label: 'Physical trauma / leg fracture reported', weight: 35 },
      { label: 'Marginal flood buffer zone', weight: 18 }
    ],
    safeDiscloseLocation: 'Tatopani Field Hospital - Ward B',
    verifiedBy: 'Dr. A. Sharma (Field Hospital)',
    verifiedAt: '2026-08-28T15:00:00Z',
    createdAt: '2026-08-28T13:00:00Z',
    updatedAt: '2026-08-28T15:00:00Z'
  },
  {
    id: 'SAH-2026-001461',
    incidentId: 'INC-2026-NEP-042',
    fullName: 'Priya Sethi',
    approxAge: 26,
    gender: 'female',
    clothing: 'Green jacket, grey trekking trousers',
    medicalConditions: 'None',
    lastKnownLocation: 'Trail kilometer 14 near waterfall',
    coordinates: [27.9380, 85.9320],
    lastContactTime: '2026-08-28T11:00:00Z',
    contactMethod: 'message',
    groupType: 'trekking',
    groupName: 'Annapurna Valley Solo Trekkers',
    permitNumber: 'TK-2026-904',
    reporterName: 'Anil Sethi',
    reporterPhone: '+91 99887 65432',
    reporterRelationship: 'Father',
    preferredLanguage: 'en',
    status: 'under_verification',
    priority: 'P1',
    priorityScore: 72,
    priorityFactors: [
      { label: 'Waterfall mudslide reported nearby', weight: 35 },
      { label: 'Solo traveler with intermittent signal', weight: 20 },
      { label: 'Last contact over 8 hours ago', weight: 17 }
    ],
    createdAt: '2026-08-28T14:40:00Z',
    updatedAt: '2026-08-28T14:40:00Z'
  }
];

export const INITIAL_GROUPS: CoTravelerGroup[] = [
  {
    id: 'GRP-2026-KY17',
    name: 'Pilgrim Trail Group 17',
    groupType: 'pilgrimage',
    tourOperator: 'Kailash Safaris Pvt Ltd',
    permitNumber: 'KY-2026-BH-991',
    vehicleNumber: 'UK-07-TA-4491',
    totalMembers: 61,
    safeCount: 14,
    missingCount: 38,
    unverifiedCount: 9,
    explainability: [
      'Identical Kailash Yatra Permit #KY-2026-BH-991 registered at Tatopani Gate B',
      'Shared transit bus UK-07-TA-4491 confirmed at 07:15 AM checkpoint log',
      'Common tour manager Somnath Joshi registered on 18 individual family reports'
    ],
    members: [
      { reportId: 'SAH-2026-001458', fullName: 'Dr. Milind Chitley', status: 'search_lead_issued', medicalAlert: 'Severe Asthma' },
      { reportId: 'SAH-2026-001459', fullName: 'Dr. Janhavi Chitley', status: 'located_safe' },
      { reportId: 'SAH-2026-001460', fullName: 'Somnath Joshi', status: 'located_injured', medicalAlert: 'Leg Injury' }
    ]
  }
];

export const INITIAL_INFRASTRUCTURE: InfrastructureFacility[] = [
  {
    id: 'FAC-01',
    name: 'Tatopani Field Trauma Hospital',
    type: 'hospital',
    coordinates: [27.9560, 85.9400],
    capacity: 120,
    currentOccupancy: 84,
    contactNumber: '+977 11 680101'
  },
  {
    id: 'FAC-02',
    name: 'Kodari Border Relief Camp 3',
    type: 'relief_camp',
    coordinates: [27.9410, 85.9380],
    capacity: 450,
    currentOccupancy: 312,
    contactNumber: '+977 11 680145'
  },
  {
    id: 'FAC-03',
    name: 'Chaku Tactical Command & Heli Base',
    type: 'heli_base',
    coordinates: [27.9280, 85.9520],
    capacity: 50,
    currentOccupancy: 22,
    contactNumber: 'Radio Ch 16 (VHF)'
  }
];

export const INITIAL_NDRF_UNITS: NDRFUnit[] = [
  {
    id: 'NDRF-UNIT-02',
    callsign: 'NDRF Alfa 02',
    battalion: '8th Bn Ghaziabad (Mountain Rescue)',
    status: 'dispatched',
    distanceKm: 1.8,
    equipment: ['Flood Inflatable Boat', 'High-Altitude Oxygen', 'Search Canines'],
    assignedCaseId: 'SAH-2026-001458'
  },
  {
    id: 'NDRF-UNIT-04',
    callsign: 'NDRF Bravo 04',
    battalion: '8th Bn Ghaziabad (HADR)',
    status: 'available',
    distanceKm: 3.4,
    equipment: ['Thermal Imaging Drone', 'Satellite Comms Trunk', 'Trauma Paramedics']
  }
];
