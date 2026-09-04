import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  OFFICIAL_DIRECTORY,
  DEMO_OFFICER,
  AuthUser
} from '@/lib/auth/roles';
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE
} from '@/lib/auth/session';
import { logSecurityEvent } from '@/lib/auth/audit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let authenticatedUser: AuthUser | null = null;

    if (body.mode === 'quick_demo') {
      // 1-Click Fast-Track Demo Clearance for hackathon evaluators
      authenticatedUser = DEMO_OFFICER;
    } else {
      const { serviceId, pin } = body;
      if (!serviceId || !pin) {
        return NextResponse.json(
          { success: false, message: 'Service ID and security PIN are required.' },
          { status: 400 }
        );
      }

      const match = OFFICIAL_DIRECTORY.find(
        entry =>
          entry.serviceId.toLowerCase() === serviceId.trim().toLowerCase() &&
          entry.pin === pin.trim()
      );

      if (match) {
        authenticatedUser = match.user;
      } else {
        logSecurityEvent({
          action: 'AUTH_LOGIN_FAILURE',
          actorRole: 'ROLE_CITIZEN',
          actorId: 'unknown',
          actorName: 'Anonymous Candidate',
          details: { attemptedServiceId: serviceId }
        });

        return NextResponse.json(
          {
            success: false,
            message: 'Invalid official credentials. Valid demo PIN is 1234.'
          },
          { status: 401 }
        );
      }
    }

    // Cryptographically sign the session token
    const token = await createSessionToken(authenticatedUser);

    // Set HttpOnly signed cookie
    const cookieStore = cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE
    });

    logSecurityEvent({
      action: 'AUTH_LOGIN_SUCCESS',
      actorRole: authenticatedUser.role,
      actorId: authenticatedUser.id,
      actorName: authenticatedUser.name,
      details: {
        serviceId: authenticatedUser.serviceId,
        battalion: authenticatedUser.battalion,
        mode: body.mode || 'credentials'
      }
    });

    return NextResponse.json({
      success: true,
      user: authenticatedUser,
      message: `Access granted: ${authenticatedUser.rank} ${authenticatedUser.name}`
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication service encountered an internal error.' },
      { status: 500 }
    );
  }
}
