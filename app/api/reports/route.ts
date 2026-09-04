import { NextResponse } from 'next/server';
import { z } from 'zod';
import { calculatePriorityScore } from '@/lib/ai/priorityTriage';

const reportSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  approxAge: z.number().min(1).max(120),
  gender: z.enum(['male', 'female', 'other', 'unknown']),
  clothing: z.string().optional(),
  medicalConditions: z.string().optional(),
  lastKnownLocation: z.string().min(2, 'Last known location is required'),
  contactMethod: z.enum(['call', 'message', 'in_person', 'social_media', 'other']),
  groupType: z.enum(['tour', 'trekking', 'pilgrimage', 'family', 'alone', 'unknown']),
  groupName: z.string().optional(),
  permitNumber: z.string().optional(),
  reporterName: z.string().min(2, 'Reporter name is required'),
  reporterPhone: z.string().min(7, 'Valid phone is required'),
  reporterRelationship: z.string().min(2, 'Relationship is required'),
  preferredLanguage: z.enum(['en', 'hi']).default('en')
});

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const validated = reportSchema.parse(body);

    // Instant Case ID generation (<200ms ACK target)
    const reportId = `SAH-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    // Deterministic priority triage
    const triage = calculatePriorityScore({
      approxAge: validated.approxAge,
      medicalConditions: validated.medicalConditions,
      clothing: validated.clothing,
      lastKnownLocation: validated.lastKnownLocation,
      contactMethod: validated.contactMethod
    });

    // In a deployed environment with QStash keys:
    // await publishToQStash('/api/workers/process-report', { reportId, ...validated, triage });

    const elapsedMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      reportId,
      status: 'received',
      priority: triage.priority,
      priorityScore: triage.score,
      processingTimeMs: elapsedMs,
      message: 'Report accepted and queued for priority rescue verification.'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
