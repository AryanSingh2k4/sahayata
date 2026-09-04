import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { ROLE_PERMISSIONS } from '@/lib/auth/roles';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({
        authenticated: false,
        role: 'ROLE_CITIZEN',
        permissions: ROLE_PERMISSIONS.ROLE_CITIZEN,
        user: null
      });
    }

    const verifiedUser = await verifySessionToken(token);
    if (!verifiedUser) {
      return NextResponse.json({
        authenticated: false,
        role: 'ROLE_CITIZEN',
        permissions: ROLE_PERMISSIONS.ROLE_CITIZEN,
        user: null
      });
    }

    return NextResponse.json({
      authenticated: true,
      role: verifiedUser.role,
      permissions: verifiedUser.permissions,
      user: verifiedUser
    });
  } catch (error: any) {
    console.error('Session retrieval error:', error);
    return NextResponse.json(
      {
        authenticated: false,
        role: 'ROLE_CITIZEN',
        permissions: ROLE_PERMISSIONS.ROLE_CITIZEN,
        user: null
      },
      { status: 200 }
    );
  }
}
