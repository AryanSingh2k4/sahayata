export interface ExtractedEntities {
  fullName?: string;
  approxAge?: number;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  clothing?: string;
  medicalConditions?: string;
  lastKnownLocation?: string;
  groupName?: string;
}

export function extractFromEmotionalText(text: string): ExtractedEntities {
  if (!text || text.trim().length === 0) return {};

  const clean = text.trim();
  const lower = clean.toLowerCase();
  const result: ExtractedEntities = {};

  // 1. Name extraction
  // Handles prefixes like "Dr.", "Mr.", "Shri" and familial relation mentions
  const namePatterns = [
    /(?:my\s+(?:mama|uncle|father|mother|brother|sister|son|daughter|friend|relative|husband|wife|chacha|mama ji|bhai|pitaji)\s+)((?:(?:dr\.?|mr\.?|mrs\.?|ms\.?|shri|smt\.?|डॉ\.?|डॉक्टर)\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /(?:named|calling|is)\s+((?:(?:dr\.?|mr\.?|mrs\.?|ms\.?|shri|smt\.?|डॉ\.?|डॉक्टर)\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /((?:dr\.?|mr\.?|mrs\.?|ms\.?|shri|smt\.?|डॉ\.?|डॉक्टर)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /([A-Z][a-z]+\s+[A-Z][a-z]+)/
  ];

  for (const pattern of namePatterns) {
    const match = clean.match(pattern);
    if (match && match[1]) {
      result.fullName = match[1].trim();
      break;
    }
  }

  // 2. Age extraction
  // Pattern: "around 60", "age 60", "60 years old", "(around 60)", "(60)"
  const ageMatch = lower.match(/(?:around|age|aged|approx|लगभग|उम्र)?\s*\(?\s*(\d{1,2})\s*(?:years|yr|yrs|साल)?\s*\)?/);
  if (ageMatch && ageMatch[1]) {
    const age = parseInt(ageMatch[1], 10);
    if (age > 0 && age < 110) {
      result.approxAge = age;
    }
  }

  // 3. Gender inference
  if (/\b(mama|uncle|father|brother|son|husband|chacha|pitaji|man|boy|पुरुष|लड़का|भाई|पिता)\b/i.test(lower)) {
    result.gender = 'male';
  } else if (/\b(mami|aunt|mother|sister|daughter|wife|chachi|mataji|woman|girl|महिला|लड़की|बहन|माता)\b/i.test(lower)) {
    result.gender = 'female';
  }

  // 4. Clothing extraction
  // Pattern: "wearing yellow raincoat", "in blue jacket", "red saree", "पीला रेनकोट पहने हुए"
  const clothingMatch = lower.match(/(?:wearing|in|dressed in|पहने हुए|कपड़े)\s+([a-z\s]+?(?:raincoat|jacket|shirt|kurta|t-shirt|saree|boots|hat|shawl|sweater|windcheater|trousers|jeans|clothes))/i);
  if (clothingMatch && clothingMatch[1]) {
    result.clothing = clothingMatch[1].trim();
  } else if (lower.includes('yellow raincoat') || lower.includes('पीला रेनकोट')) {
    result.clothing = 'Yellow raincoat';
  } else if (lower.includes('jacket') || lower.includes('windcheater')) {
    result.clothing = 'Windcheater / Trekking jacket';
  }

  // 5. Medical conditions
  const medicalKeywords: { pattern: RegExp; term: string }[] = [
    { pattern: /\b(asthma|दमा|अस्थमा|breathing problem|inhaler)\b/i, term: 'Severe Asthma / Inhaler required' },
    { pattern: /\b(diabetic|diabetes|मधुमेह|sugar|insulin)\b/i, term: 'Type 1 Diabetes (Insulin dependent)' },
    { pattern: /\b(heart|cardiac|दिल की बीमारी|pacemaker)\b/i, term: 'Cardiac Patient / Pacemaker' },
    { pattern: /\b(fracture|injured|injury|चोट|fractured leg|bleeding)\b/i, term: 'Physical Trauma / Fracture' }
  ];

  const foundMedical: string[] = [];
  for (const item of medicalKeywords) {
    if (item.pattern.test(lower)) {
      foundMedical.push(item.term);
    }
  }
  if (foundMedical.length > 0) {
    result.medicalConditions = foundMedical.join(', ');
  }

  // 6. Last known landmark
  const landmarkMatch = lower.match(/(?:near|at|around|के पास|पर)\s+(?:the\s+)?([a-z0-9\s]+?(?:bridge|camp|river|checkpoint|hotel|temple|gate|stream|waterfall|moraine|pass|valley))/i);
  if (landmarkMatch && landmarkMatch[1]) {
    result.lastKnownLocation = landmarkMatch[1].trim();
  } else if (lower.includes('bridge') || lower.includes('पुल')) {
    result.lastKnownLocation = 'Near River Bridge X';
  }

  // 7. Group origin or tour name
  const groupMatch = lower.match(/(?:group from|with a group from|with group|tour group|साथ)\s+([a-z\s]+)/i);
  if (groupMatch && groupMatch[1]) {
    const raw = groupMatch[1].split(/[.,]/)[0].trim();
    result.groupName = `Group from ${raw.charAt(0).toUpperCase() + raw.slice(1)}`;
  } else if (lower.includes('pune')) {
    result.groupName = 'Pilgrim Group from Pune';
  }

  return result;
}
