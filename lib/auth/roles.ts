export type AppRole = 'ROLE_CITIZEN' | 'ROLE_NDRF_OFFICIAL';

export type PermissionClaim =
  | 'dashboard:access'
  | 'field:access'
  | 'dispatch:command'
  | 'cases:verify_safe'
  | 'cases:view_pii'
  | 'cases:create'
  | 'cases:track_public'
  | 'audit:export_sitrep';

export interface AuthUser {
  id: string;
  name: string;
  serviceId: string;
  rank: string;
  battalion: string;
  role: AppRole;
  permissions: PermissionClaim[];
  station: string;
  issuedAt: string;
}

export const ROLE_PERMISSIONS: Record<AppRole, PermissionClaim[]> = {
  ROLE_CITIZEN: [
    'cases:create',
    'cases:track_public'
  ],
  ROLE_NDRF_OFFICIAL: [
    'cases:create',
    'cases:track_public',
    'dashboard:access',
    'field:access',
    'dispatch:command',
    'cases:verify_safe',
    'cases:view_pii',
    'audit:export_sitrep'
  ]
};

// Verified official service profiles for NDRF Command and Field Responders
export const OFFICIAL_DIRECTORY: Array<{
  serviceId: string;
  pin: string;
  user: AuthUser;
}> = [
  {
    serviceId: 'NDRF-8BN-CMD-4091',
    pin: '1234',
    user: {
      id: 'usr_cmd_4091',
      name: 'Commandant S. Rawat',
      serviceId: 'NDRF-8BN-CMD-4091',
      rank: 'Commandant / Incident Commander',
      battalion: '8th Battalion NDRF (Ghaziabad / Northern Sector)',
      station: 'Tatopani Forward Command Post',
      role: 'ROLE_NDRF_OFFICIAL',
      permissions: ROLE_PERMISSIONS.ROLE_NDRF_OFFICIAL,
      issuedAt: '2026-08-28T06:00:00Z'
    }
  },
  {
    serviceId: 'NDRF-8BN-FLD-1042',
    pin: '1234',
    user: {
      id: 'usr_fld_1042',
      name: 'Sub-Inspector Vikram Negi',
      serviceId: 'NDRF-8BN-FLD-1042',
      rank: 'Sub-Inspector (Quick Reaction Team Leader)',
      battalion: '8th Battalion NDRF (Bhotekoshi QRT)',
      station: 'Kodari Tactical Staging Base',
      role: 'ROLE_NDRF_OFFICIAL',
      permissions: ROLE_PERMISSIONS.ROLE_NDRF_OFFICIAL,
      issuedAt: '2026-08-28T07:30:00Z'
    }
  }
];

export const DEMO_OFFICER = OFFICIAL_DIRECTORY[0].user;

export function hasPermission(role: AppRole, permission: PermissionClaim): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * PII Data Protection Utilities (Compliance with India DPDP Act 2023 / Section 43A IT Act)
 */
export function maskPhoneNumber(phone?: string, role: AppRole = 'ROLE_CITIZEN'): string {
  if (!phone) return 'Not Provided';
  if (role === 'ROLE_NDRF_OFFICIAL') return phone;

  // Mask middle/trailing digits: e.g. "+91 98200 12345" -> "+91 98200 •••••"
  const cleaned = phone.trim();
  if (cleaned.length <= 6) return '••••••';
  const visiblePrefix = cleaned.slice(0, cleaned.length - 5);
  return `${visiblePrefix}•••••`;
}

export function maskGovernmentId(idNumber?: string, role: AppRole = 'ROLE_CITIZEN'): string {
  if (!idNumber) return '';
  if (role === 'ROLE_NDRF_OFFICIAL') return idNumber;

  // Mask Aadhaar/Passport: e.g. "4912-3849-2041" -> "XXXX-XXXX-2041"
  const parts = idNumber.split('-');
  if (parts.length >= 2) {
    return parts.map((p, idx) => (idx === parts.length - 1 ? p : 'XXXX')).join('-');
  }
  return idNumber.length > 4 ? `••••${idNumber.slice(-4)}` : '••••';
}

export function sanitizeShelterLocation(location?: string, role: AppRole = 'ROLE_CITIZEN'): string {
  if (!location) return '';
  if (role === 'ROLE_NDRF_OFFICIAL') return location;

  // Mask exact military tent / room bed numbers for public privacy:
  // "Tatopani Emergency Outpost - Tent B-4, Bed 12" -> "Tatopani Emergency Outpost (District Relief Sector)"
  return location.replace(/-\s*(Tent|Bed|Room|Wing)[\s\w\d,-]+/gi, '(District Relief Sector)');
}
