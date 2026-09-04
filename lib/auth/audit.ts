export type SecurityAction =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILURE'
  | 'AUTH_LOGOUT'
  | 'DISPATCH_TEAM_ORDER'
  | 'VICTIM_STATUS_VERIFIED'
  | 'PII_UNMASK_ACCESSED'
  | 'UNAUTHORIZED_ACCESS_BLOCKED';

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: SecurityAction;
  actorRole: string;
  actorId: string;
  actorName: string;
  targetId?: string;
  details?: Record<string, any>;
}

// In-memory append-only audit ledger (in production persisted to Supabase security log)
const auditLedger: AuditEvent[] = [
  {
    id: 'AUD-001',
    timestamp: '2026-08-28T06:30:00Z',
    action: 'AUTH_LOGIN_SUCCESS',
    actorRole: 'ROLE_NDRF_OFFICIAL',
    actorId: 'usr_cmd_4091',
    actorName: 'Commandant S. Rawat',
    details: { event: 'Incident Command Post Activated', sector: 'Tatopani / Bhotekoshi' }
  }
];

export function logSecurityEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
  const newEvent: AuditEvent = {
    ...event,
    id: `AUD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: new Date().toISOString()
  };

  auditLedger.unshift(newEvent);
  console.log(`[NDRF-SECURITY-AUDIT] [${newEvent.action}] Actor: ${newEvent.actorName} (${newEvent.actorRole}) Target: ${newEvent.targetId || 'N/A'}`);
  return newEvent;
}

export function getAuditLogs(): AuditEvent[] {
  return [...auditLedger];
}
