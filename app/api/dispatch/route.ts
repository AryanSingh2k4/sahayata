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

    if (!user || !hasPermission(user.role, 'dispatch:command')) {
      logSecurityEvent({
        action: 'UNAUTHORIZED_ACCESS_BLOCKED',
        actorRole: user?.role || 'ROLE_CITIZEN',
        actorId: user?.id || 'anonymous',
        actorName: user?.name || 'Anonymous Visitor',
        details: { endpoint: '/api/dispatch', reason: 'Missing dispatch:command permission' }
      });

      return NextResponse.json(
        {
          success: false,
          error: 'FORBIDDEN',
          message: 'NDRF Incident Command authorization required to dispatch rescue teams.'
        },
        { status: 403 }
      );
    }

    const { reportId, unitId } = await request.json();
    if (!reportId || !unitId) {
      return NextResponse.json(
        { success: false, message: 'reportId and unitId are required.' },
        { status: 400 }
      );
    }

    logSecurityEvent({
      action: 'DISPATCH_TEAM_ORDER',
      actorRole: user.role,
      actorId: user.id,
      actorName: user.name,
      targetId: reportId,
      details: {
        unitId,
        authorizedBy: `${user.rank} ${user.name}`,
        battalion: user.battalion
      }
    });

    return NextResponse.json({
      success: true,
      reportId,
      unitId,
      authorizedBy: `${user.rank} ${user.name}`,
      dispatchedAt: new Date().toISOString(),
      message: `Operational dispatch order confirmed for Team ${unitId}.`
    });
  } catch (error: any) {
    console.error('Dispatch API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
