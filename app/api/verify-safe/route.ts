import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/roles';
import { logSecurityEvent } from '@/lib/auth/audit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const user = token ? await verifySessionToken(token) : null;

    if (!user || !hasPermission(user.role, 'cases:verify_safe')) {
      logSecurityEvent({
        action: 'UNAUTHORIZED_ACCESS_BLOCKED',
        actorRole: user?.role || 'ROLE_CITIZEN',
        actorId: user?.id || 'anonymous',
        actorName: user?.name || 'Anonymous Visitor',
        details: { endpoint: '/api/verify-safe', reason: 'Missing cases:verify_safe permission' }
      });

      return NextResponse.json(
        {
          success: false,
          error: 'FORBIDDEN',
          message: 'Official NDRF Verification Officer clearance required to confirm survivor safety.'
        },
        { status: 403 }
      );
    }

    const { reportId, location } = await request.json();
    if (!reportId) {
      return NextResponse.json(
        { success: false, message: 'reportId is required.' },
        { status: 400 }
      );
    }

    const verifiedBy = `${user.rank} ${user.name} (${user.battalion})`;

    logSecurityEvent({
      action: 'VICTIM_STATUS_VERIFIED',
      actorRole: user.role,
      actorId: user.id,
      actorName: user.name,
      targetId: reportId,
      details: {
        location: location || 'District Relief Facility',
        verifiedBy
      }
    });

    return NextResponse.json({
      success: true,
      reportId,
      status: 'located_safe',
      verifiedBy,
      safeLocation: location || 'District Relief Facility',
      verifiedAt: new Date().toISOString(),
      message: `Status updated to LOCATED_SAFE by ${verifiedBy}.`
    });
  } catch (error: any) {
    console.error('Verify-safe API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
