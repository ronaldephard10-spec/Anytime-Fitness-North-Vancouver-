import { InspectionItem, ItemEvaluation } from '../types/inspection';

// Check if browser supports Web Speech recognition
export const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
};

// Check if browser supports Web Speech synthesis
export const isSpeechSynthesisSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!window.speechSynthesis;
};

// Item aliases map for Anytime Fitness North Vancouver walkthrough items
const ITEM_ALIASES: Record<string, string[]> = {
  'core-entrance-foyer': [
    'entrance',
    'foyer',
    'front door',
    'front doors',
    'entryway',
    'reception',
    'entrance and foyer',
    'check in',
  ],
  'core-office-cleaning': [
    'office',
    'office cleaning',
    'manager office',
    'desk',
    'credenza',
    'office organization',
  ],
  'core-restrooms-showers': [
    'restroom',
    'restrooms',
    'shower',
    'showers',
    'bathroom',
    'bathrooms',
    'toilet',
    'toilets',
    'urinal',
    'urinals',
    'sink',
    'sinks',
    'fixtures',
    'restroom fixtures',
  ],
  'core-mirrors-glass': [
    'mirror',
    'mirrors',
    'gym mirror',
    'gym mirrors',
    'weight room mirrors',
    'glass',
  ],
  'core-trash': [
    'trash',
    'garbage',
    'waste',
    'trash and waste',
    'bins',
    'rubbish',
    'liners',
  ],
  'core-water-dispensers': [
    'water',
    'water dispenser',
    'water dispensers',
    'fountain',
    'drinking fountain',
    'bottle refill',
    'refill station',
    'refill stations',
    'water stations',
  ],
  'core-cubbies': [
    'cubby',
    'cubbies',
    'locker',
    'lockers',
    'storage',
    'member cubbies',
    'storage cubbies',
  ],
  'core-floor-mopping': [
    'floor',
    'floors',
    'mopping',
    'hard floor',
    'hard floors',
    'mop',
    'sweeping',
    'dust mop',
  ],
  'core-closet-supplies': [
    'closet',
    'janitor closet',
    'supply closet',
    'supplies',
    'security',
    'closing security',
    'locked doors',
  ],
  // Sunday
  'sun-microwave': [
    'microwave',
    'microwave interior',
    'staff microwave',
  ],
  'sun-partition-glass': [
    'partition glass',
    'partition glass dusting',
    'partition',
    'partitions',
    'dividers',
  ],
  'sun-traffic-vacuum': [
    'high traffic vacuum',
    'traffic vacuum',
    'cardio vacuum',
    'walkway vacuum',
  ],
  'sun-monthly-refrigerator': [
    'refrigerator',
    'fridge',
    'monthly refrigerator',
    'refrigerator clean',
  ],
  'sun-monthly-partition-detail': [
    'partition detail',
    'partition squeegee',
    'monthly partition',
    'partition glass detail',
  ],
  // Tuesday
  'tue-high-low-dusting': [
    'high low dusting',
    'high dusting',
    'low dusting',
    'dusting up to 6ft',
    'picture frames',
  ],
  'tue-surface-dusting': [
    'surface dusting',
    'fixtures',
    'office furniture',
    'furniture dusting',
    'computer monitors',
    'window ledges',
  ],
  'tue-monthly-blinds-entrance': [
    'blinds',
    'window blinds',
    'entrance glass monthly',
    'monthly blinds',
  ],
  'tue-monthly-vents-fixtures': [
    'vents',
    'ceiling vents',
    'hvac',
    'air vents',
    'fixtures monthly',
  ],
  // Thursday
  'thu-wipe-desks-furniture': [
    'damp wipe desks',
    'wipe desks',
    'office desks',
    'meeting table',
  ],
  'thu-sanitize-phones': [
    'sanitize phones',
    'phones',
    'electronics',
    'check in scanner',
    'touchscreen',
  ],
  'thu-carpet-spot-clean': [
    'carpet spot',
    'carpet spot vacuuming',
    'desk mats',
    'floor mats',
  ],
  'thu-carpet-vacuum-full': [
    'full floor carpet',
    'full carpet',
    'wall to wall carpet',
    'carpet vacuum',
  ],
  'thu-traffic-vacuum': [
    'traffic vacuum thursday',
    'perimeter vacuum',
  ],
  'thu-monthly-detail-edge-vacuum': [
    'detail edge vacuuming',
    'edge vacuum',
    'crevice vacuum',
    'perimeter edge',
  ],
  'thu-monthly-fabric-furniture': [
    'fabric furniture',
    'lounge chairs',
    'cushions',
    'fabric seating',
  ],
};

// Helper: Normalize phrase
const cleanString = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Match a spoken query to an InspectionItem
 */
export const findMatchingItem = (
  spokenQuery: string,
  items: InspectionItem[]
): { item: InspectionItem; matchedQueryPart: string; remainingText: string } | null => {
  const normalizedSpoken = cleanString(spokenQuery);
  if (!normalizedSpoken) return null;

  let bestMatch: InspectionItem | null = null;
  let bestScore = 0;
  let bestMatchedAlias = '';

  for (const item of items) {
    const aliases = ITEM_ALIASES[item.id] || [];
    const candidates = [cleanString(item.name), ...aliases.map(cleanString)];

    for (const candidate of candidates) {
      if (!candidate) continue;

      // Exact phrase contained in spoken text
      if (normalizedSpoken === candidate) {
        return { item, matchedQueryPart: candidate, remainingText: '' };
      }

      const candidateIndex = normalizedSpoken.indexOf(candidate);
      if (candidateIndex !== -1) {
        // Give higher score to longer candidate matches
        const score = candidate.length * 2;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = item;
          bestMatchedAlias = candidate;
        }
      } else {
        // Check word intersection
        const candidateWords = candidate.split(' ').filter((w) => w.length > 2);
        const spokenWords = normalizedSpoken.split(' ').filter((w) => w.length > 2);
        let matchCount = 0;
        for (const cw of candidateWords) {
          if (spokenWords.includes(cw)) {
            matchCount++;
          }
        }
        if (matchCount > 0 && candidateWords.length > 0) {
          const ratio = matchCount / candidateWords.length;
          if (ratio >= 0.5) {
            const score = matchCount * 1.5;
            if (score > bestScore) {
              bestScore = score;
              bestMatch = item;
              bestMatchedAlias = candidateWords.join(' ');
            }
          }
        }
      }
    }
  }

  if (bestMatch && bestScore >= 2) {
    // Extract remaining text after removing the matched alias
    const remainingText = normalizedSpoken.replace(bestMatchedAlias, '').trim();
    return {
      item: bestMatch,
      matchedQueryPart: bestMatchedAlias,
      remainingText,
    };
  }

  return null;
};

export type VoiceAction =
  | { type: 'PASS_ITEM'; item: InspectionItem }
  | { type: 'FAIL_ITEM'; item: InspectionItem; notes?: string }
  | { type: 'NOTE_ITEM'; item: InspectionItem; notes: string }
  | { type: 'WHATS_LEFT' }
  | { type: 'NEXT_SECTION' }
  | { type: 'SUBMIT_REPORT' }
  | { type: 'PASS_ALL' }
  | { type: 'UNKNOWN'; rawText: string };

/**
 * Parse an incoming speech transcript into a structured VoiceAction
 */
export const parseSpeechCommand = (
  transcript: string,
  items: InspectionItem[]
): VoiceAction => {
  const text = cleanString(transcript);
  if (!text) return { type: 'UNKNOWN', rawText: transcript };

  // 1. "What's left?" / "Remaining items"
  if (
    /(what\s*s\s*left|whats\s*left|what\s+is\s+left|remaining|how\s+many\s+left|status\s+check|unchecked)/i.test(
      text
    )
  ) {
    return { type: 'WHATS_LEFT' };
  }

  // 2. "Next section" / "Next tab"
  if (/(next\s+section|next\s+tab|next\s+shift|next\s+checklist)/i.test(text)) {
    return { type: 'NEXT_SECTION' };
  }

  // 3. "Submit report" / "Send report"
  if (/(submit\s+report|submit\s+inspection|submit\s+audit|send\s+report|finish\s+inspection|dispatch\s+report)/i.test(text)) {
    return { type: 'SUBMIT_REPORT' };
  }

  // 4. "Pass all" / "Pass all items"
  if (/(pass\s+all|pass\s+everything|all\s+passed|check\s+all)/i.test(text)) {
    return { type: 'PASS_ALL' };
  }

  // 5. "Note [item] [text]"
  const noteMatch = text.match(/^(?:note|add\s+note(?:\s+to)?|comment|write)\s+(?:the\s+)?(.+)$/i);
  if (noteMatch) {
    const payload = noteMatch[1];
    const match = findMatchingItem(payload, items);
    if (match) {
      const noteContent = match.remainingText || 'Flagged during voice inspection';
      return {
        type: 'NOTE_ITEM',
        item: match.item,
        notes: noteContent.charAt(0).toUpperCase() + noteContent.slice(1),
      };
    }
  }

  // 6. "Pass [item]"
  const passMatch = text.match(/^(?:pass|passed|check|mark\s+pass(?:ed)?|approve)\s+(?:the\s+)?(.+)$/i);
  if (passMatch) {
    const query = passMatch[1];
    const match = findMatchingItem(query, items);
    if (match) {
      return { type: 'PASS_ITEM', item: match.item };
    }
  }

  // Also support reverse: "[item] pass"
  const passReverse = text.match(/^(.+?)\s+(?:pass|passed|is\s+pass(?:ed)?|approved)$/i);
  if (passReverse) {
    const query = passReverse[1];
    const match = findMatchingItem(query, items);
    if (match) {
      return { type: 'PASS_ITEM', item: match.item };
    }
  }

  // 7. "Fail [item]" (with optional reason notes)
  const failMatch = text.match(/^(?:fail|failed|mark\s+fail(?:ed)?|flag|reject)\s+(?:the\s+)?(.+)$/i);
  if (failMatch) {
    const query = failMatch[1];
    const match = findMatchingItem(query, items);
    if (match) {
      const notes = match.remainingText ? (match.remainingText.charAt(0).toUpperCase() + match.remainingText.slice(1)) : undefined;
      return { type: 'FAIL_ITEM', item: match.item, notes };
    }
  }

  // Also support reverse: "[item] fail"
  const failReverse = text.match(/^(.+?)\s+(?:fail|failed|is\s+fail(?:ed)?|flagged)$/i);
  if (failReverse) {
    const query = failReverse[1];
    const match = findMatchingItem(query, items);
    if (match) {
      return { type: 'FAIL_ITEM', item: match.item };
    }
  }

  return { type: 'UNKNOWN', rawText: transcript };
};

/**
 * Text-to-Speech audio feedback using browser's native window.speechSynthesis
 */
export const speakConfirmation = (
  text: string,
  onStart?: () => void,
  onEnd?: () => void
) => {
  if (!isSpeechSynthesisSupported()) {
    if (onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel(); // cancel any stale utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05; // brisk and clear for active inspector
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    // Pick an optimal English voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const englishVoice =
        voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Natural') || v.name.includes('Karen'))) ||
        voices.find((v) => v.lang.startsWith('en'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
    }

    if (onStart) {
      utterance.onstart = onStart;
    }

    const finish = () => {
      if (onEnd) onEnd();
    };

    utterance.onend = finish;
    utterance.onerror = finish;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
    if (onEnd) onEnd();
  }
};
