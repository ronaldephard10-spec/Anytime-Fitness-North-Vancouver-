import { ActiveTab } from '../types/inspection';

export type ReportingCadence = 'monthly-summary' | 'weekly-summary' | 'every-visit';

export interface CompletedInspection {
  id: string;
  date: string; // e.g. "Sep 13, 2026"
  isoDate?: string; // e.g. "2026-09-13"
  time: string; // e.g. "11:00 PM"
  shift: ActiveTab; // 'sunday' | 'tuesday' | 'thursday' | 'full-audit'
  score: number; // e.g. 98
  passedCount: number;
  failedCount: number;
  naCount: number;
  totalEvaluated: number;
  inspectorName: string;
  supervisorName: string;
  notes: string;
  monthlyTasksCompleted: string[];
  deficiencies: Array<{
    itemName: string;
    notes: string;
    resolved: boolean;
  }>;
  photoCount: number;
  photos?: Array<{
    id: string;
    stationName: string;
    dataUrl: string;
    notes?: string;
  }>;
  dispatchedTo?: string;
  cadenceMode?: ReportingCadence;
  createdAt: string;
}

const STORAGE_KEY = 'af_completed_inspections_v1';
const CADENCE_STORAGE_KEY = 'af_reporting_cadence_v1';

// Initial realistic audit history for September 2026 so Ronald can immediately preview and send the monthly report
const SEED_INSPECTIONS: CompletedInspection[] = [
  {
    id: 'insp-20260901-tue',
    date: 'Sep 01, 2026',
    isoDate: '2026-09-01',
    time: '11:00 PM',
    shift: 'tuesday',
    score: 97,
    passedCount: 11,
    failedCount: 0,
    naCount: 0,
    totalEvaluated: 11,
    inspectorName: 'Ronald Ephard',
    supervisorName: 'Jennifer Johnson',
    notes: 'Shift completed on schedule. First Tuesday monthly deep-clean rotation performed: Entrance Window Blinds dusted and wiped.',
    monthlyTasksCompleted: ['Entrance Window Blinds Dusted & Wiped'],
    deficiencies: [],
    photoCount: 1,
    photos: [
      {
        id: 'seed-p1',
        stationName: 'Entrance & Foyer Glass',
        dataUrl: '',
        notes: 'Entrance glass wiped and polished inside & out.',
      },
    ],
    dispatchedTo: 'ronaldephard10@gmail.com',
    cadenceMode: 'monthly-summary',
    createdAt: '2026-09-01T23:45:00Z',
  },
  {
    id: 'insp-20260903-thu',
    date: 'Sep 03, 2026',
    isoDate: '2026-09-03',
    time: '11:00 PM',
    shift: 'thursday',
    score: 100,
    passedCount: 14,
    failedCount: 0,
    naCount: 0,
    totalEvaluated: 14,
    inspectorName: 'Ronald Ephard',
    supervisorName: 'Jennifer Johnson',
    notes: 'Routine Thursday cleaning and full carpet vacuuming. All high-touch gym touchpoints disinfected.',
    monthlyTasksCompleted: [],
    deficiencies: [],
    photoCount: 1,
    photos: [
      {
        id: 'seed-p2',
        stationName: 'Cardio Floor & Mirrors',
        dataUrl: '',
        notes: 'Full mirror wall streak-free.',
      },
    ],
    dispatchedTo: 'ronaldephard10@gmail.com',
    cadenceMode: 'monthly-summary',
    createdAt: '2026-09-03T23:50:00Z',
  },
  {
    id: 'insp-20260906-sun',
    date: 'Sep 06, 2026',
    isoDate: '2026-09-06',
    time: '11:00 PM',
    shift: 'sunday',
    score: 95,
    passedCount: 11,
    failedCount: 1,
    naCount: 0,
    totalEvaluated: 12,
    inspectorName: 'Ronald Ephard',
    supervisorName: 'Jennifer Johnson',
    notes: 'Sunday shift completed. Low paper towels in Men\'s locker room was flagged and immediately restocked from customer closet.',
    monthlyTasksCompleted: [],
    deficiencies: [
      {
        itemName: 'Restrooms & Showers',
        notes: 'Men\'s dispenser low on roll towels; fully refilled and wiped dispenser before completion.',
        resolved: true,
      },
    ],
    photoCount: 1,
    photos: [
      {
        id: 'seed-p3',
        stationName: 'Restroom Dispensers',
        dataUrl: '',
        notes: 'Dispensers restocked and sanitized.',
      },
    ],
    dispatchedTo: 'ronaldephard10@gmail.com',
    cadenceMode: 'monthly-summary',
    createdAt: '2026-09-06T23:40:00Z',
  },
  {
    id: 'insp-20260908-tue',
    date: 'Sep 08, 2026',
    isoDate: '2026-09-08',
    time: '11:00 PM',
    shift: 'tuesday',
    score: 100,
    passedCount: 11,
    failedCount: 0,
    naCount: 0,
    totalEvaluated: 11,
    inspectorName: 'Ronald Ephard',
    supervisorName: 'Jennifer Johnson',
    notes: 'Tuesday cleaning complete. Second Tuesday monthly task: High-reach air return grilles & diffuser fixtures vacuumed.',
    monthlyTasksCompleted: ['High-Reach Air Return Grilles & Diffusers Vacuumed'],
    deficiencies: [],
    photoCount: 1,
    photos: [],
    dispatchedTo: 'ronaldephard10@gmail.com',
    cadenceMode: 'monthly-summary',
    createdAt: '2026-09-08T23:35:00Z',
  },
  {
    id: 'insp-20260910-thu',
    date: 'Sep 10, 2026',
    isoDate: '2026-09-10',
    time: '11:00 PM',
    shift: 'thursday',
    score: 100,
    passedCount: 15,
    failedCount: 0,
    naCount: 0,
    totalEvaluated: 15,
    inspectorName: 'Ronald Ephard',
    supervisorName: 'Jennifer Johnson',
    notes: 'Thursday comprehensive vacuum & furniture wipe. Second Thursday monthly task: Perimeter edge vacuuming & baseboard detailing completed.',
    monthlyTasksCompleted: ['Perimeter Edge Vacuuming & Baseboard Detail'],
    deficiencies: [],
    photoCount: 1,
    photos: [
      {
        id: 'seed-p4',
        stationName: 'Water Refill Station',
        dataUrl: '',
        notes: 'Disinfected and polished.',
      },
    ],
    dispatchedTo: 'ronaldephard10@gmail.com',
    cadenceMode: 'monthly-summary',
    createdAt: '2026-09-10T23:45:00Z',
  },
  {
    id: 'insp-20260913-sun',
    date: 'Sep 13, 2026',
    isoDate: '2026-09-13',
    time: '11:00 PM',
    shift: 'sunday',
    score: 100,
    passedCount: 13,
    failedCount: 0,
    naCount: 0,
    totalEvaluated: 13,
    inspectorName: 'Ronald Ephard',
    supervisorName: 'Jennifer Johnson',
    notes: 'Official Start Date shift & Initial Clean certification. Staff breakroom refrigerator deep disinfected and sanitized per 2nd Sunday rotation.',
    monthlyTasksCompleted: ['Staff Breakroom Refrigerator Deep Disinfection'],
    deficiencies: [],
    photoCount: 2,
    photos: [
      {
        id: 'seed-p5',
        stationName: 'Weight Room Mirrors & Floor',
        dataUrl: '',
        notes: 'Spotless mirrors and disinfected floor.',
      },
    ],
    dispatchedTo: 'ronaldephard10@gmail.com',
    cadenceMode: 'monthly-summary',
    createdAt: '2026-09-13T23:40:00Z',
  },
];

export function getReportingCadence(): ReportingCadence {
  try {
    const saved = localStorage.getItem(CADENCE_STORAGE_KEY);
    if (saved === 'monthly-summary' || saved === 'weekly-summary' || saved === 'every-visit') {
      return saved;
    }
  } catch {}
  return 'monthly-summary'; // Default to Option 2
}

export function setReportingCadence(cadence: ReportingCadence): void {
  try {
    localStorage.setItem(CADENCE_STORAGE_KEY, cadence);
  } catch {}
}

export function getCompletedInspections(): CompletedInspection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed reading inspection history', e);
  }
  // If nothing in localStorage, initialize with seed
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_INSPECTIONS));
  } catch {}
  return SEED_INSPECTIONS;
}

export function saveCompletedInspection(inspection: CompletedInspection): void {
  try {
    const existing = getCompletedInspections();
    // Prepend new inspection or update if same id
    const filtered = existing.filter((item) => item.id !== inspection.id);
    const updated = [inspection, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save inspection', e);
  }
}

export function deleteCompletedInspection(id: string): void {
  try {
    const existing = getCompletedInspections();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed deleting inspection', e);
  }
}

export function resetInspectionHistoryToDefault(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_INSPECTIONS));
  } catch {}
}

export interface MonthlyReportMetrics {
  monthName: string; // e.g. "September 2026"
  yearMonth: string; // e.g. "2026-09"
  inspectionsCount: number;
  expectedShiftsCount: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passedCountTotal: number;
  failedCountTotal: number;
  monthlyRotationsCompleted: string[];
  deficiencies: Array<{
    date: string;
    shift: string;
    itemName: string;
    notes: string;
    resolved: boolean;
  }>;
  inspectionsList: CompletedInspection[];
}

export function calculateMonthlyMetrics(yearMonth: string = '2026-09'): MonthlyReportMetrics {
  const all = getCompletedInspections();
  const filtered = all.filter((item) => item.isoDate.startsWith(yearMonth));

  const inspectionsCount = filtered.length;
  const scores = filtered.map((i) => i.score);
  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

  const passedCountTotal = filtered.reduce((acc, i) => acc + i.passedCount, 0);
  const failedCountTotal = filtered.reduce((acc, i) => acc + i.failedCount, 0);

  // Collect distinct monthly tasks completed
  const rotationsSet = new Set<string>();
  filtered.forEach((i) => {
    i.monthlyTasksCompleted.forEach((task) => rotationsSet.add(task));
  });

  // Collect deficiencies
  const deficiencies: Array<{
    date: string;
    shift: string;
    itemName: string;
    notes: string;
    resolved: boolean;
  }> = [];

  filtered.forEach((i) => {
    i.deficiencies.forEach((d) => {
      deficiencies.push({
        date: i.date,
        shift: i.shift.toUpperCase(),
        itemName: d.itemName,
        notes: d.notes,
        resolved: d.resolved,
      });
    });
  });

  // Month label
  const [year, month] = yearMonth.split('-');
  const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
  const monthName = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return {
    monthName,
    yearMonth,
    inspectionsCount,
    expectedShiftsCount: 13, // 13 shifts in standard 4-week cycle (Sun, Tue, Thu)
    averageScore,
    highestScore,
    lowestScore,
    passedCountTotal,
    failedCountTotal,
    monthlyRotationsCompleted: Array.from(rotationsSet),
    deficiencies,
    inspectionsList: filtered.sort((a, b) => new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime()),
  };
}
