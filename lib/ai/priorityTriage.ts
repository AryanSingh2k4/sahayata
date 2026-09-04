import { PriorityLevel, TriageFactor } from '../types';

export interface PriorityScoreResult {
  priority: PriorityLevel;
  score: number;
  factors: TriageFactor[];
}

export function calculatePriorityScore(data: {
  approxAge?: number;
  medicalConditions?: string;
  clothing?: string;
  lastKnownLocation?: string;
  contactMethod?: string;
  isTrappedOrSubmerged?: boolean;
}): PriorityScoreResult {
  let score = 20; // baseline score for any reported missing person
  const factors: TriageFactor[] = [];

  // Factor 1: Medical alerts
  if (data.medicalConditions && data.medicalConditions.trim().length > 0) {
    const medLower = data.medicalConditions.toLowerCase();
    if (medLower.includes('asthma') || medLower.includes('insulin') || medLower.includes('cardiac') || medLower.includes('bleeding')) {
      score += 40;
      factors.push({
        label: `Critical Medical Vulnerability: ${data.medicalConditions}`,
        weight: 40,
        critical: true
      });
    } else {
      score += 20;
      factors.push({
        label: `Medical Alert: ${data.medicalConditions}`,
        weight: 20
      });
    }
  }

  // Factor 2: Proximity to active flash flood / trapped in hazard zone
  if (data.isTrappedOrSubmerged || (data.lastKnownLocation && /bridge|river|gorge|waterfall|slide|flood/i.test(data.lastKnownLocation))) {
    score += 30;
    factors.push({
      label: 'Immediate Hazard Proximity (Bridge/River Flash Flood Zone)',
      weight: 30,
      critical: true
    });
  }

  // Factor 3: Vulnerable demographics (child or senior)
  if (data.approxAge) {
    if (data.approxAge <= 10) {
      score += 20;
      factors.push({
        label: `High Demographic Vulnerability: Child (Age ${data.approxAge})`,
        weight: 20,
        critical: true
      });
    } else if (data.approxAge >= 60) {
      score += 15;
      factors.push({
        label: `Demographic Vulnerability: Senior Citizen (Age ${data.approxAge})`,
        weight: 15
      });
    }
  }

  // Factor 4: Contact degradation
  if (data.contactMethod === 'call') {
    score += 10;
    factors.push({
      label: 'Abrupt Voice Call Cutoff during disaster onset',
      weight: 10
    });
  }

  // Cap score at 100
  const finalScore = Math.min(100, score);

  let priority: PriorityLevel = 'P2';
  if (finalScore >= 80) {
    priority = 'P0';
  } else if (finalScore >= 55) {
    priority = 'P1';
  } else if (finalScore >= 35) {
    priority = 'P2';
  } else {
    priority = 'P3';
  }

  return {
    priority,
    score: finalScore,
    factors
  };
}
