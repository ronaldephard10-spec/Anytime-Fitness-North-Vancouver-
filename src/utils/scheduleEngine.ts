import { ActiveTab, DayOfWeek } from '../types/inspection';
import {
  CORE_SERVICES,
  SUNDAY_SPECIFIC,
  TUESDAY_SPECIFIC,
  THURSDAY_SPECIFIC,
} from '../data/checklistItems';

export interface ScheduledMonthlyTask {
  toggleKey: string;
  name: string;
  description: string;
  dayOfWeek: DayOfWeek;
  occurrenceText: string;
  category: 'tuesday' | 'thursday' | 'sunday';
}

export interface DayScheduleSummary {
  date: Date;
  dateFormatted: string;
  dayOfWeekName: string;
  dayTab: ActiveTab | null;
  occurrenceInMonth: number; // e.g. 1 for 1st Tuesday, 2 for 2nd Tuesday
  isScheduledShift: boolean;
  scheduledTime: string;
  coreServicesCount: number;
  weeklyServicesCount: number;
  monthlyTasksDueTonight: ScheduledMonthlyTask[];
  annualPeriodicRecommended?: string[];
}

/**
 * Calculates which occurrence of this weekday it is in the current month (1st, 2nd, 3rd, 4th, 5th)
 * e.g. If date is Oct 6, 2026 (the first Tuesday of October), returns 1.
 */
export function getWeekdayOccurrenceInMonth(date: Date): number {
  const targetDay = date.getDate();
  const dayOfWeek = date.getDay();
  let count = 0;
  for (let d = 1; d <= targetDay; d++) {
    const testDate = new Date(date.getFullYear(), date.getMonth(), d);
    if (testDate.getDay() === dayOfWeek) {
      count++;
    }
  }
  return count;
}

/**
 * Returns total occurrences of a specific day of week in a given month/year
 */
export function getTotalWeekdayOccurrencesInMonth(year: number, month: number, dayOfWeek: number): number {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let count = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const testDate = new Date(year, month, d);
    if (testDate.getDay() === dayOfWeek) {
      count++;
    }
  }
  return count;
}

/**
 * Coverall Health-Based Cleaning System Monthly Services Schedule Rules (Pages 7-19 of Source Agreement)
 */
export const MONTHLY_SERVICE_RULES: Record<string, {
  dayOfWeek: DayOfWeek;
  dayNum: number; // 0=Sun, 2=Tue, 4=Thu
  occurrence: number; // 1 = 1st, 2 = 2nd, 3 = 3rd, 4 = 4th
  name: string;
  toggleKey: string;
  occurrenceText: string;
  description: string;
  category: 'tuesday' | 'thursday' | 'sunday';
}> = {
  'tue-blinds-entrance': {
    dayOfWeek: 'tuesday',
    dayNum: 2,
    occurrence: 1,
    name: 'Blinds & Entrance Glass Doors',
    toggleKey: 'tue-monthly-blinds-entrance',
    occurrenceText: '1st Tuesday of the Month',
    description: 'Clean glass entrance doors (interior/exterior), polish trim & dust all window blinds.',
    category: 'tuesday',
  },
  'tue-vents-fixtures': {
    dayOfWeek: 'tuesday',
    dayNum: 2,
    occurrence: 2,
    name: 'Light Fixtures & Ceiling Vents (6-10 ft)',
    toggleKey: 'tue-monthly-vents-fixtures',
    occurrenceText: '2nd Tuesday of the Month',
    description: 'Dust all light fixtures, ceiling HVAC vents and surfaces 6-10 ft high including corners.',
    category: 'tuesday',
  },
  'thu-fabric-furniture': {
    dayOfWeek: 'thursday',
    dayNum: 4,
    occurrence: 2,
    name: 'Fabric & Leather Furniture Cleaning',
    toggleKey: 'thu-monthly-fabric-furniture',
    occurrenceText: '2nd Thursday of the Month',
    description: 'Vacuum all fabric furniture, wipe down plastic and leather chairs with hospital disinfectant.',
    category: 'thursday',
  },
  'thu-edge-vacuum': {
    dayOfWeek: 'thursday',
    dayNum: 4,
    occurrence: 3,
    name: 'Detail Edge Vacuuming',
    toggleKey: 'thu-monthly-detail-edge-vacuum',
    occurrenceText: '3rd Thursday of the Month',
    description: 'Detail crevice tool vacuuming around all baseboard perimeters, weight racks, and walls.',
    category: 'thursday',
  },
  'sun-partition-glass': {
    dayOfWeek: 'sunday',
    dayNum: 0,
    occurrence: 3,
    name: 'Partition Glass Detail Wash',
    toggleKey: 'sun-monthly-partition-detail',
    occurrenceText: '3rd Sunday of the Month',
    description: 'Deep clean all partition glass/plexi-glass sections using streak-free glass cleaner.',
    category: 'sunday',
  },
  'sun-refrigerator': {
    dayOfWeek: 'sunday',
    dayNum: 0,
    occurrence: 4,
    name: 'Inside Refrigerator Deep Clean',
    toggleKey: 'sun-monthly-refrigerator',
    occurrenceText: '4th Sunday of the Month',
    description: 'Clean and disinfect interior shelves, crisper trays, and door seals of refrigerator.',
    category: 'sunday',
  },
};

/**
 * Returns which monthly services are due on a specific date according to the Coverall Calendar
 */
export function getMonthlyTasksDueForDate(date: Date): ScheduledMonthlyTask[] {
  const dayNum = date.getDay();
  const occurrence = getWeekdayOccurrenceInMonth(date);
  const matched: ScheduledMonthlyTask[] = [];

  Object.values(MONTHLY_SERVICE_RULES).forEach((rule) => {
    if (rule.dayNum === dayNum && rule.occurrence === occurrence) {
      matched.push({
        toggleKey: rule.toggleKey,
        name: rule.name,
        description: rule.description,
        dayOfWeek: rule.dayOfWeek,
        occurrenceText: rule.occurrenceText,
        category: rule.category,
      });
    }
  });

  return matched;
}

/**
 * Gets the complete schedule summary for a given date
 */
export function getShiftScheduleForDate(date: Date = new Date()): DayScheduleSummary {
  const dayNum = date.getDay();
  let dayTab: ActiveTab | null = null;
  if (dayNum === 0) dayTab = 'sunday';
  else if (dayNum === 2) dayTab = 'tuesday';
  else if (dayNum === 4) dayTab = 'thursday';

  const isScheduledShift = dayTab !== null;
  const occurrence = getWeekdayOccurrenceInMonth(date);
  const monthlyTasks = getMonthlyTasksDueForDate(date);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return {
    date,
    dateFormatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    dayOfWeekName: dayNames[dayNum],
    dayTab,
    occurrenceInMonth: occurrence,
    isScheduledShift,
    scheduledTime: '11:00 PM',
    coreServicesCount: CORE_SERVICES.length,
    weeklyServicesCount:
      dayTab === 'sunday'
        ? SUNDAY_SPECIFIC.length
        : dayTab === 'tuesday'
        ? TUESDAY_SPECIFIC.length
        : dayTab === 'thursday'
        ? THURSDAY_SPECIFIC.length
        : 0,
    monthlyTasksDueTonight: monthlyTasks,
  };
}

/**
 * Returns a 4-week lookahead of upcoming monthly tasks from the Coverall Work Schedule
 */
export function getUpcomingMonthlyTasks(startDate: Date = new Date(), daysAhead: number = 31): Array<{
  date: Date;
  dateStr: string;
  dayName: string;
  task: ScheduledMonthlyTask;
  isToday: boolean;
}> {
  const upcoming: Array<{
    date: Date;
    dateStr: string;
    dayName: string;
    task: ScheduledMonthlyTask;
    isToday: boolean;
  }> = [];

  const todayStr = startDate.toDateString();

  for (let i = 0; i <= daysAhead; i++) {
    const curDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
    const tasks = getMonthlyTasksDueForDate(curDate);
    tasks.forEach((t) => {
      upcoming.push({
        date: curDate,
        dateStr: curDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        dayName: curDate.toLocaleDateString('en-US', { weekday: 'long' }),
        task: t,
        isToday: curDate.toDateString() === todayStr,
      });
    });
  }

  return upcoming;
}

export interface PeriodicServiceRecord {
  id: string;
  title: string;
  frequencyLabel: string;
  frequencyType: 'annual' | 'semi-annual' | 'quarterly' | 'as-needed';
  recommendedCycleMonths: number;
  lastDoneDate: string | null;
  status: 'up-to-date' | 'due' | 'in-progress' | 'completed-today' | 'not-requested';
  description: string;
  contractReference: string;
  notes: string;
}

export const INITIAL_PERIODIC_SERVICES: PeriodicServiceRecord[] = [
  {
    id: 'ps-initial-clean',
    title: 'Initial Clean (includes monthly services)',
    frequencyLabel: 'Contract Baseline',
    frequencyType: 'as-needed',
    recommendedCycleMonths: 12,
    lastDoneDate: '2026-09-13',
    status: 'up-to-date',
    description: 'Full comprehensive deep scrub and sanitation of all 10 areas at start of franchise contract.',
    contractReference: 'Coverall Key Pick Up Sheet & Special Service Agreement (Page 1 & 21)',
    notes: 'Completed on contract inception: Sept 13, 2026.',
  },
  {
    id: 'ps-strip-refinish',
    title: 'Strip & Refinish (Hard Tile & Resilient Floors)',
    frequencyLabel: 'Annual (1x / Year)',
    frequencyType: 'annual',
    recommendedCycleMonths: 12,
    lastDoneDate: null,
    status: 'due',
    description: 'Complete machine chemical stripping of old wax coats down to base substrate, neutral rinse, and application of 4+ coats of high-solids polymer floor finish.',
    contractReference: 'Special Service Agreement (Page 21)',
    notes: 'Recommended annually before winter wet season for high-traffic gym floors.',
  },
  {
    id: 'ps-scrub-wax',
    title: 'Machine Scrub & Wax Topcoat',
    frequencyLabel: 'Semi-Annual (2x / Year)',
    frequencyType: 'semi-annual',
    recommendedCycleMonths: 6,
    lastDoneDate: null,
    status: 'due',
    description: 'High-speed orbital machine scrubbing to remove ground-in heel marks and surface grime, followed by 2 fresh coats of high-gloss protective finish.',
    contractReference: 'Special Service Agreement (Page 21)',
    notes: 'Routine interim floor rejuvenation between annual strip cycles.',
  },
  {
    id: 'ps-carpet-extract',
    title: 'Deep Carpet & Walk-on Mat Hot Water Extraction',
    frequencyLabel: 'Annual / Semi-Annual',
    frequencyType: 'semi-annual',
    recommendedCycleMonths: 6,
    lastDoneDate: null,
    status: 'due',
    description: 'Pre-spray spot treatment and commercial truck-mount or high-temp portable extraction for cardio walkways, turf borders, and entrance walk-on mats.',
    contractReference: 'Special Service Agreement (Page 21)',
    notes: 'Removes deep perspiration salt, sand, and outdoor grit.',
  },
  {
    id: 'ps-interior-windows',
    title: 'Full Interior Architectural Glass Washing',
    frequencyLabel: 'Quarterly (4x / Year)',
    frequencyType: 'quarterly',
    recommendedCycleMonths: 3,
    lastDoneDate: null,
    status: 'up-to-date',
    description: 'Full squeegee and edge-to-edge detailing of all interior high glass panels, mirror seams, and office transoms.',
    contractReference: 'Special Service Agreement (Page 21)',
    notes: 'Supplement to regular monthly partition wipe.',
  },
  {
    id: 'ps-exterior-windows',
    title: 'Exterior Windows & Commercial Glazing',
    frequencyLabel: 'Semi-Annual (2x / Year)',
    frequencyType: 'semi-annual',
    recommendedCycleMonths: 6,
    lastDoneDate: null,
    status: 'due',
    description: 'Commercial exterior window washing of street-facing glazing along Dollarton Hwy entrance.',
    contractReference: 'Special Service Agreement (Page 21)',
    notes: 'Water-fed pole / commercial squeegee exterior wash.',
  },
  {
    id: 'ps-upholstery',
    title: 'Upholstery Deep Cleaning & Extraction',
    frequencyLabel: 'Annual (1x / Year)',
    frequencyType: 'annual',
    recommendedCycleMonths: 12,
    lastDoneDate: null,
    status: 'up-to-date',
    description: 'Hot water or dry foam extraction on reception lounge armchairs, staff desk chairs, and fabric seating.',
    contractReference: 'Special Service Agreement (Page 21)',
    notes: 'Sanitizes cloth fibers and eliminates odors.',
  },
];
