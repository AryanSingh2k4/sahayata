import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { maskPhoneNumber, sanitizeShelterLocation } from '@/lib/auth/roles';
import { INITIAL_REPORTS } from '@/lib/seedData';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { caseId: string } }
) {
  try {
    const { caseId } = params;
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const user = token ? await verifySessionToken(token) : null;
    const isOfficial = user?.role === 'ROLE_NDRF_OFFICIAL';

    const match = INITIAL_REPORTS.find(
      r => r.id.toLowerCase() === caseId.trim().toLowerCase()
    );

    if (!match) {
      return NextResponse.json(
        { success: false, message: `No report found for Case ID ${caseId}` },
        { status: 404 }
      );
    }

    // Server-Side Field-Level Security & PII Redaction
    const sanitizedReport = {
      ...match,
      reporterPhone: isOfficial
        ? match.reporterPhone
        : maskPhoneNumber(match.reporterPhone, 'ROLE_CITIZEN'),
      safeDiscloseLocation: isOfficial
        ? match.safeDiscloseLocation
        : sanitizeShelterLocation(match.safeDiscloseLocation, 'ROLE_CITIZEN'),
      securityClassification: isOfficial ? 'UNRESTRICTED_OFFICER_TELEMETRY' : 'PUBLIC_MASKED_DPDP_COMPLIANT'
    };

    return NextResponse.json({
      success: true,
      case: sanitizedReport,
      isUnredacted: isOfficial
    });
  } catch (error: any) {
    console.error('Case retrieval error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
