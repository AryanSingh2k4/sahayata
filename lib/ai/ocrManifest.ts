export interface OCRPassenger {
  name: string;
  approxAge?: number;
  gender?: 'male' | 'female';
  seatOrRoom?: string;
  statusMatch?: 'existing_in_db' | 'new_unaccounted';
  matchedReportId?: string;
}

export interface OCRScanResult {
  documentType: 'Trek Permit' | 'Bus Transit Ticket' | 'Hotel Guest Roster' | 'WhatsApp Booking';
  agencyName: string;
  permitNumber: string;
  route: string;
  vehicleNumber?: string;
  timestamp: string;
  passengers: OCRPassenger[];
  rawTextPreview: string;
}

export function parseDocumentOCR(fileName: string, rawHintText?: string): OCRScanResult {
  // If user provided a specific text hint or image name, parse contextually
  const hint = (rawHintText || fileName).toLowerCase();

  if (hint.includes('hotel') || hint.includes('roster')) {
    return {
      documentType: 'Hotel Guest Roster',
      agencyName: 'Hotel Himalayan View (Tatopani)',
      permitNumber: 'HTL-2026-882',
      route: 'Tatopani Hot Springs Corridor',
      timestamp: '2026-08-28 06:00 AM Check-In',
      rawTextPreview: `HOTEL HIMALAYAN VIEW - TATOPANI GUEST REGISTER\nDATE: 28-AUG-2026\nROOM 101: Dr. Milind Chitley (Mumbai)\nROOM 102: Dr. Janhavi Chitley\nROOM 103: Somnath Joshi (Tour Manager)\nROOM 104: Suresh Prabhu\nROOM 105: Ananya Bhatt`,
      passengers: [
        { name: 'Dr. Milind Chitley', approxAge: 60, gender: 'male', seatOrRoom: 'Room 101' },
        { name: 'Dr. Janhavi Chitley', approxAge: 57, gender: 'female', seatOrRoom: 'Room 102' },
        { name: 'Somnath Joshi', approxAge: 52, gender: 'male', seatOrRoom: 'Room 103' },
        { name: 'Suresh Prabhu', approxAge: 45, gender: 'male', seatOrRoom: 'Room 104' },
        { name: 'Ananya Bhatt', approxAge: 32, gender: 'female', seatOrRoom: 'Room 105' }
      ]
    };
  }

  // Default: Bus Booking / Yatra Permit
  return {
    documentType: 'Bus Transit Ticket',
    agencyName: 'Kailash Safaris Pvt Ltd',
    permitNumber: 'KY-2026-BH-991',
    route: 'Kathmandu -> Tatopani -> Kodari Border -> Mansarovar',
    vehicleNumber: 'UK-07-TA-4491',
    timestamp: '2026-08-28 07:15 AM Dep.',
    rawTextPreview: `KAILASH SAFARIS LUXURY COACH MANIFEST\nPERMIT: KY-2026-BH-991 | VEHICLE: UK-07-TA-4491\nSEAT 01: Somnath Joshi (Tour Lead)\nSEAT 02: Radha Joshi\nSEAT 03: Dr. Milind Chitley (Severe Asthma)\nSEAT 04: Dr. Janhavi Chitley\nSEAT 05: Sunil Gavaskar\nSEAT 06: Meena Deshmukh\nSEAT 07: Ganesh Hegde\nTOTAL PASSENGERS: 61`,
    passengers: [
      { name: 'Dr. Milind Chitley', approxAge: 60, gender: 'male', seatOrRoom: 'Seat 03' },
      { name: 'Dr. Janhavi Chitley', approxAge: 57, gender: 'female', seatOrRoom: 'Seat 04' },
      { name: 'Somnath Joshi', approxAge: 52, gender: 'male', seatOrRoom: 'Seat 01' },
      { name: 'Radha Joshi', approxAge: 48, gender: 'female', seatOrRoom: 'Seat 02' },
      { name: 'Sunil Gavaskar', approxAge: 65, gender: 'male', seatOrRoom: 'Seat 05' },
      { name: 'Meena Deshmukh', approxAge: 50, gender: 'female', seatOrRoom: 'Seat 06' },
      { name: 'Ganesh Hegde', approxAge: 38, gender: 'male', seatOrRoom: 'Seat 07' }
    ]
  };
}
