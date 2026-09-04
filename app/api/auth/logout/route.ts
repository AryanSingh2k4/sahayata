import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { logSecurityEvent } from '@/lib/auth/audit';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      const user = await verifySessionToken(token);
      if (user) {
        logSecurityEvent({
          action: 'AUTH_LOGOUT',
          actorRole: user.role,
          actorId: user.id,
          actorName: user.name,
          details: { reason: 'Voluntary session revocation' }
        });
      }
    }

    // Delete session cookie
    cookieStore.delete(SESSION_COOKIE_NAME);

    return NextResponse.json({
      success: true,
      message: 'Official session revoked. Returned to Citizen View.'
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
