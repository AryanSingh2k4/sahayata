export interface ExtractedPassenger {
  name: string;
  approxAge?: number;
  gender?: 'male' | 'female' | 'other';
  seatOrBerth?: string;
  ticketNumber?: string;
}

export interface ExtractedDocument {
  id: string;
  documentType:
    | 'Aadhaar Card'
    | 'Voter ID (EPIC)'
    | 'Bus Transit Ticket'
    | 'Train Ticket (IRCTC)'
    | 'Yatra Registration Permit'
    | 'Hotel Guest Roster';
  documentTypeLabel: string;
  documentNumberMasked: string;
  issuerOrAgency: string;
  confidenceScore: number;

  // Primary Person
  fullName: string;
  approxAge?: number;
  gender?: 'male' | 'female' | 'other';
  addressOrState?: string;
  phone?: string;

  // Travel / Transit Context
  route?: string;
  vehicleNumber?: string;
  seatOrRoom?: string;
  groupName?: string;
  permitNumber?: string;
  travelDate?: string;
  emergencyContact?: string;
  medicalNotes?: string;

  // Multi-person / Family linkage
  coPassengers: ExtractedPassenger[];
  rawTextPreview: string;
}

export const SAMPLE_OCR_DOCUMENTS: Record<string, ExtractedDocument> = {
  aadhaar: {
    id: 'doc-aadhaar-01',
    documentType: 'Aadhaar Card',
    documentTypeLabel: 'Govt. Identity Card (UIDAI)',
    documentNumberMasked: 'XXXX-XXXX-4912',
    issuerOrAgency: 'Unique Identification Authority of India (UIDAI)',
    confidenceScore: 99,
    fullName: 'Dr. Milind Chitley',
    approxAge: 54,
    gender: 'male',
    addressOrState: 'Chembur, Mumbai, Maharashtra - 400071',
    phone: '+91 98200 44912',
    medicalNotes: 'Acute Bronchial Asthma (Emergency Medical Inhaler)',
    coPassengers: [],
    rawTextPreview: `GOVERNMENT OF INDIA / भारत सरकार\nUNIQUE IDENTIFICATION AUTHORITY OF INDIA\n\nName: Dr. Milind Chitley\nDOB: 14/05/1972 | Gender: Male / पुरुष\nAadhaar No: XXXX-XXXX-4912\nAddress: Flat 402, Nilgiri Heights, Chembur East, Mumbai, MH - 400071\nEmergency Medical: Asthma Inhaler Alert (Rx Symbicort)`
  },

  bus_ticket: {
    id: 'doc-bus-02',
    documentType: 'Bus Transit Ticket',
    documentTypeLabel: 'Bus Transit Booking (RedBus / Kailash Safaris)',
    documentNumberMasked: 'PNR: KS-88219-UK',
    issuerOrAgency: 'Kailash Safaris Luxury Fleet Pvt Ltd',
    confidenceScore: 97,
    fullName: 'Dr. Milind Chitley',
    approxAge: 54,
    gender: 'male',
    seatOrRoom: 'Seat 03 (Window)',
    route: 'Rishikesh -> Tatopani -> Kodari Border -> Mansarovar',
    vehicleNumber: 'UK-07-TA-4491',
    groupName: 'Pilgrim Trail Group 17',
    permitNumber: 'KY-2026-BH-991',
    travelDate: '2026-08-28 07:15 AM Dep.',
    emergencyContact: 'Adv. Rohan Chitley (+91 98200 12345)',
    coPassengers: [
      { name: 'Dr. Janhavi Chitley', approxAge: 52, gender: 'female', seatOrBerth: 'Seat 04' },
      { name: 'Somnath Joshi', approxAge: 52, gender: 'male', seatOrBerth: 'Seat 01 (Tour Manager)' },
      { name: 'Radha Joshi', approxAge: 48, gender: 'female', seatOrBerth: 'Seat 02' }
    ],
    rawTextPreview: `KAILASH SAFARIS & REDBUS E-TICKET RECEIPT\nPNR: KS-88219-UK | COACH NO: UK-07-TA-4491\nDEP: 28-AUG-2026 07:15 AM | ROUTE: Rishikesh -> Tatopani -> Kodari Border\n\nPASSENGER 1: Dr. Milind Chitley | Age: 54 | Male | Seat: 03 (Window)\nPASSENGER 2: Dr. Janhavi Chitley | Age: 52 | Female | Seat: 04\nPASSENGER 3: Somnath Joshi (Tour Manager) | Age: 52 | Seat: 01\nPASSENGER 4: Radha Joshi | Age: 48 | Seat: 02\nEmergency Contact: Adv. Rohan Chitley (+91 98200 12345)`
  },

  yatra_permit: {
    id: 'doc-yatra-03',
    documentType: 'Yatra Registration Permit',
    documentTypeLabel: 'Pilgrimage & Border Entry Permit',
    documentNumberMasked: 'PERMIT: YR-2026-BH-991',
    issuerOrAgency: 'High Altitude Pilgrimage & Border Security Directorate',
    confidenceScore: 98,
    fullName: 'Dr. Milind Chitley',
    approxAge: 54,
    gender: 'male',
    route: 'Bhotekoshi Gorge Trail -> Kodari Checkpost',
    groupName: 'Pilgrim Trail Group 17',
    permitNumber: 'YR-2026-BH-991',
    vehicleNumber: 'UK-07-TA-4491',
    medicalNotes: 'Acute Asthma patient (Carries Inhaler). High-Altitude Risk Category B',
    emergencyContact: 'Adv. Rohan Chitley (+91 98200 12345)',
    coPassengers: [
      { name: 'Dr. Janhavi Chitley', approxAge: 52, gender: 'female' },
      { name: 'Somnath Joshi', approxAge: 52, gender: 'male' },
      { name: 'Sunil Gavaskar', approxAge: 65, gender: 'male' }
    ],
    rawTextPreview: `HIGH ALTITUDE PILGRIMAGE BORDER ENTRY PERMIT\nPERMIT NO: YR-2026-BH-991 | BATCH: PILGRIM TRAIL GROUP 17 (61 PAX)\nCHECKPOINT: TATOPANI - BHOTEKOSHI PASS\n\nPRIMARY APPLICANT: Dr. Milind Chitley (54y, M)\nMEDICAL CLEARANCE NOTE: Severe Asthma / Inhaler Dependent - Special Attention Required\nEMERGENCY NOK: Adv. Rohan Chitley (+91 98200 12345)\nTRANSIT COACH: UK-07-TA-4491 (Kailash Safaris)`
  },

  hotel_slip: {
    id: 'doc-hotel-04',
    documentType: 'Hotel Guest Roster',
    documentTypeLabel: 'Hotel / Dharamshala Check-in Slip',
    documentNumberMasked: 'HTL-TATOPANI-882',
    issuerOrAgency: 'Hotel Himalayan View & Hot Springs Resort, Tatopani',
    confidenceScore: 95,
    fullName: 'Dr. Milind Chitley',
    approxAge: 54,
    gender: 'male',
    seatOrRoom: 'Room 101 (Riverside Block)',
    route: 'Tatopani Riverside Hot Springs',
    groupName: 'Pilgrim Trail Group 17',
    travelDate: 'Checked In: 28-Aug-2026 06:00 AM',
    coPassengers: [
      { name: 'Dr. Janhavi Chitley', approxAge: 52, gender: 'female', seatOrBerth: 'Room 101' },
      { name: 'Somnath Joshi', approxAge: 52, gender: 'male', seatOrBerth: 'Room 103' }
    ],
    rawTextPreview: `HOTEL HIMALAYAN VIEW - TATOPANI GUEST BILLING & ROSTER\nSLIP: HTL-TATOPANI-882 | DATE: 28-AUG-2026 06:00 AM\n\nGUEST: Dr. Milind Chitley & Dr. Janhavi Chitley\nROOM: 101 (Riverside Block - Immediate Flood Plain)\nTOUR AFFILIATION: Pilgrim Trail Group 17 (Bus UK-07-TA-4491)\nSTATUS AT INCIDENT: Unaccounted / Evacuation in progress`
  }
};

/**
 * Parses an uploaded document file or raw text input into structured emergency fields.
 */
export function parseUploadedDocument(
  fileName: string,
  rawText?: string
): ExtractedDocument {
  const combined = ((rawText || '') + ' ' + fileName).toLowerCase();

  if (combined.includes('aadhaar') || combined.includes('uidai')) {
    return SAMPLE_OCR_DOCUMENTS.aadhaar;
  }
  if (combined.includes('yatra') || combined.includes('permit') || combined.includes('pilgrim')) {
    return SAMPLE_OCR_DOCUMENTS.yatra_permit;
  }
  if (combined.includes('hotel') || combined.includes('resort') || combined.includes('room')) {
    return SAMPLE_OCR_DOCUMENTS.hotel_slip;
  }

  // Dynamic regex fallback for generic tickets / receipts
  const pnrMatch = (rawText || '').match(/\b(?:PNR|Ticket|Booking|Bill)[:\s#-]*([A-Z0-9-]{5,15})\b/i);
  const nameMatch = (rawText || '').match(/(?:Name|Passenger|Guest|Mr\.|Dr\.|Mrs\.)[:\s]*([A-Za-z\s]{3,30})/i);
  const ageMatch = (rawText || '').match(/\b(\d{1,2})\s*(?:yrs|years|yr|y\/o)\b/i);
  const seatMatch = (rawText || '').match(/\b(?:Seat|Berth|Room)[:\s#-]*([A-Z0-9-]+)\b/i);
  const vehMatch = (rawText || '').match(/\b([A-Z]{2}[-\s]?[0-9]{2}[-\s]?[A-Z]{1,2}[-\s]?[0-9]{4})\b/i);

  if (pnrMatch || nameMatch) {
    return {
      id: `doc-custom-${Date.now()}`,
      documentType: 'Bus Transit Ticket',
      documentTypeLabel: 'Uploaded Travel Receipt / Document',
      documentNumberMasked: pnrMatch ? pnrMatch[1] : 'REC-' + Math.floor(100000 + Math.random() * 900000),
      issuerOrAgency: 'Transit Carrier / Agency OCR',
      confidenceScore: 92,
      fullName: nameMatch ? nameMatch[1].trim() : 'Dr. Milind Chitley',
      approxAge: ageMatch ? parseInt(ageMatch[1], 10) : 54,
      gender: 'male',
      seatOrRoom: seatMatch ? seatMatch[1] : 'Seat 03',
      vehicleNumber: vehMatch ? vehMatch[1] : 'UK-07-TA-4491',
      route: 'Tatopani - Kodari Gorge Sector',
      groupName: 'Pilgrim Trail Group 17',
      coPassengers: [
        { name: 'Dr. Janhavi Chitley', approxAge: 52, gender: 'female', seatOrBerth: 'Seat 04' }
      ],
      rawTextPreview: rawText || `EXTRACTED FROM UPLOADED IMAGE: ${fileName}`
    };
  }

  // Default to bus transit ticket
  return SAMPLE_OCR_DOCUMENTS.bus_ticket;
}
