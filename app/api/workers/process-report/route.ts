import { NextResponse } from 'next/server';
import { calculatePriorityScore } from '@/lib/ai/priorityTriage';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { reportId, fullName, approxAge, medicalConditions, lastKnownLocation } = payload;

    // Asynchronous heavy calculation (entity resolution, priority calculation)
    const triage = calculatePriorityScore({
      approxAge,
      medicalConditions,
      lastKnownLocation
    });

    // In a production Supabase setup:
    // await supabase.from('reports').update({ priority: triage.priority, priority_score: triage.score }).eq('id', reportId);

    return NextResponse.json({
      success: true,
      reportId,
      computedPriority: triage.priority,
      score: triage.score,
      factors: triage.factors,
      reconciledAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Worker error processing report' },
      { status: 500 }
    );
  }
}
