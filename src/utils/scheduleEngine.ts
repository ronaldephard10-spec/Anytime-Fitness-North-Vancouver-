import { ActiveTab, DayOfWeek, InspectionItem } from '../types/inspection';
import {
  CORE_SERVICES,
  SUNDAY_SPECIFIC,
  SUNDAY_MONTHLY,
  TUESDAY_SPECIFIC,
  TUESDAY_MONTHLY,
  THURSDAY_SPECIFIC,
  THURSDAY_MONTHLY,
  SATURDAY_SPECIFIC,
  SATURDAY_MONTHLY,
} from '../data/checklistItems';

export interface DueInspectionDetails {
  date: Date;
  dateFormatted: string;
  dayName: string;
  isScheduledDay: boolean;
  shiftDay: DayOfWeek;
  coreItems: InspectionItem[];
  shiftSpecificItems: InspectionItem[];
  monthlyDueItems: InspectionItem[];
  allDueItems: InspectionItem[];
  monthlyTaskDue: ScheduledMonthlyTask | null;
  scheduledTime: string;
  visitNumberInMonth?: number;
  totalVisitsInMonth?: number;
  nextScheduledShift: {
    dayName: string;
    shiftDay: DayOfWeek;
    time: string;
  };
}

export interface ScheduledMonthlyTask {
  toggleKey: string;
  name: string;
  description: string;
  dayOfWeek: DayOfWeek;
  occurrenceText: string;
  category: 'tuesday' | 'thursday' | 'saturday' | 'sunday';
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
  visitNumberInMonth?: number;
  totalVisitsInMonth?: number;
  totalAnnualVisits: number;
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
 * Calculates contract visits target for any month (Tuesday, Thursday, Saturday cycle)
 * Total 156 visits annually across 12 months.
 */
export function getMonthlyContractVisits(year: number, month: number): {
  targetVisits: number;
  scheduledDates: Date[];
  visitNumberMap: Record<number, number>; // date day -> visit number (1-indexed)
  totalAnnualVisits: number;
} {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const scheduledDates: Date[] = [];
  const visitNumberMap: Record<number, number> = {};

  let visitCounter = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const testDate = new Date(year, month, d);
    const dayOfWeek = testDate.getDay();
    // Scheduled days are Tuesday (2), Thursday (4), and Saturday (6)
    if (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6) {
      visitCounter++;
      scheduledDates.push(testDate);
      visitNumberMap[d] = visitCounter;
    }
  }

  return {
    targetVisits: visitCounter,
    scheduledDates,
    visitNumberMap,
    totalAnnualVisits: 156,
  };
}

/**
 * Coverall Health-Based Cleaning System Monthly Services Schedule Rules (Unit 103 - 2180 Dollarton Hwy • 156 Visits)
 * 1st Tuesday: "Clean partition glass" (interior glass partition walls, conference dividers, sidelites)
 * 2nd Saturday: "Detail edge vacuuming & Vacuum fabric furniture" (baseboard crevice edging, acoustic panels, client seating)
 */
export const MONTHLY_SERVICE_RULES: Record<string, {
  dayOfWeek: DayOfWeek;
  dayNum: number; // 2=Tue, 4=Thu, 6=Sat
  occurrence: number; // 1 = 1st, 2 = 2nd, 3 = 3rd, 4 = 4th
  name: string;
  toggleKey: string;
  occurrenceText: string;
  description: string;
  category: 'tuesday' | 'thursday' | 'saturday' | 'sunday';
}> = {
  'tue-partition-glass': {
    dayOfWeek: 'tuesday',
    dayNum: 2,
    occurrence: 1,
    name: 'Clean partition glass',
    toggleKey: 'tue-monthly-partition-glass',
    occurrenceText: '1st Tuesday of the Month',
    description: 'Clean interior glass partition walls, conference dividers, and sidelites.',
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
  'tue-blinds-entrance': {
    dayOfWeek: 'tuesday',
    dayNum: 2,
    occurrence: 3,
    name: 'Blinds & Entrance Glass Doors',
    toggleKey: 'tue-monthly-blinds-entrance',
    occurrenceText: '3rd Tuesday of the Month',
    description: 'Clean glass entrance doors (interior/exterior), polish trim & dust all window blinds.',
    category: 'tuesday',
  },
  'sat-edge-fabric': {
    dayOfWeek: 'saturday',
    dayNum: 6,
    occurrence: 2,
    name: 'Detail edge vacuuming & Vacuum fabric furniture',
    toggleKey: 'sat-monthly-edge-fabric',
    occurrenceText: '2nd Saturday of the Month',
    description: 'Baseboard crevice edging, acoustic panels, client seating.',
    category: 'saturday',
  },
  'sat-refrigerator': {
    dayOfWeek: 'saturday',
    dayNum: 6,
    occurrence: 4,
    name: 'Inside Refrigerator Deep Clean',
    toggleKey: 'sat-monthly-refrigerator',
    occurrenceText: '4th Saturday of the Month',
    description: 'Deep clean inside of refrigerators: interior shelves, crisper bins, and door gaskets with hospital disinfectant.',
    category: 'saturday',
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
  if (dayNum === 2) dayTab = 'tuesday';
  else if (dayNum === 4) dayTab = 'thursday';
  else if (dayNum === 6) dayTab = 'saturday';
  else if (dayNum === 0) dayTab = 'sunday';

  // Scheduled shifts are strictly Tuesday, Thursday, Saturday
  const isScheduledShift = dayNum === 2 || dayNum === 4 || dayNum === 6;
  const occurrence = getWeekdayOccurrenceInMonth(date);
  const monthlyTasks = getMonthlyTasksDueForDate(date);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthVisits = getMonthlyContractVisits(date.getFullYear(), date.getMonth());
  const visitNumberInMonth = monthVisits.visitNumberMap[date.getDate()];

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
      dayTab === 'tuesday'
        ? TUESDAY_SPECIFIC.length
        : dayTab === 'thursday'
        ? THURSDAY_SPECIFIC.length
        : dayTab === 'saturday'
        ? SATURDAY_SPECIFIC.length
        : dayTab === 'sunday'
        ? SUNDAY_SPECIFIC.length
        : 0,
    monthlyTasksDueTonight: monthlyTasks,
    visitNumberInMonth: isScheduledShift ? visitNumberInMonth : undefined,
    totalVisitsInMonth: monthVisits.targetVisits,
    totalAnnualVisits: 156,
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

/**
 * Returns strictly what is due for a specific date and shift, filtering out all other days and inactive monthly rotations.
 */
export function getDueInspectionForDate(
  date: Date = new Date(),
  shiftOverride?: DayOfWeek | null
): DueInspectionDetails {
  const dayNum = date.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[dayNum];

  // Determine natural scheduled shift for this calendar day (Contract cycle: Tue, Thu, Sat)
  let naturalShiftDay: DayOfWeek | null = null;
  if (dayNum === 2) naturalShiftDay = 'tuesday';
  else if (dayNum === 4) naturalShiftDay = 'thursday';
  else if (dayNum === 6) naturalShiftDay = 'saturday';

  const isScheduledDay = naturalShiftDay !== null;

  // Next scheduled shift if today is an off-day (or looking forward)
  let nextShiftDay: DayOfWeek = 'tuesday';
  let nextShiftName = 'Tuesday';
  if (dayNum === 0 || dayNum === 1) {
    nextShiftDay = 'tuesday';
    nextShiftName = 'Tuesday';
  } else if (dayNum === 2 || dayNum === 3) {
    nextShiftDay = 'thursday';
    nextShiftName = 'Thursday';
  } else if (dayNum === 4 || dayNum === 5) {
    nextShiftDay = 'saturday';
    nextShiftName = 'Saturday';
  } else {
    // Saturday -> next shift is Tuesday
    nextShiftDay = 'tuesday';
    nextShiftName = 'Tuesday';
  }

  // Active shift: override if specified, otherwise natural shift if scheduled, or nextShiftDay
  const activeShift: DayOfWeek = shiftOverride || naturalShiftDay || nextShiftDay;

  // 1. Core items: due every cleaning shift
  const coreItems = [...CORE_SERVICES];

  // 2. Shift-specific items (only for the active shift)
  let shiftSpecificItems: InspectionItem[] = [];
  if (activeShift === 'saturday') {
    shiftSpecificItems = [...SATURDAY_SPECIFIC];
  } else if (activeShift === 'tuesday') {
    shiftSpecificItems = [...TUESDAY_SPECIFIC];
  } else if (activeShift === 'thursday') {
    shiftSpecificItems = [...THURSDAY_SPECIFIC];
  } else if (activeShift === 'sunday') {
    shiftSpecificItems = [...SUNDAY_SPECIFIC];
  }

  // 3. Monthly items: strictly ONLY if scheduled for today according to the Coverall monthly rotation rules
  const scheduledMonthlyTasks = getMonthlyTasksDueForDate(date);
  const monthlyDueItems: InspectionItem[] = [];
  let monthlyTaskDue: ScheduledMonthlyTask | null = null;

  scheduledMonthlyTasks.forEach((mTask) => {
    if (mTask.dayOfWeek === activeShift) {
      monthlyTaskDue = mTask;
      if (activeShift === 'saturday') {
        const found = SATURDAY_MONTHLY.find((i) => i.id === mTask.toggleKey);
        if (found) monthlyDueItems.push(found);
      } else if (activeShift === 'tuesday') {
        const found = TUESDAY_MONTHLY.find((i) => i.id === mTask.toggleKey);
        if (found) monthlyDueItems.push(found);
      } else if (activeShift === 'thursday') {
        const found = THURSDAY_MONTHLY.find((i) => i.id === mTask.toggleKey);
        if (found) monthlyDueItems.push(found);
      } else if (activeShift === 'sunday') {
        const found = SUNDAY_MONTHLY.find((i) => i.id === mTask.toggleKey);
        if (found) monthlyDueItems.push(found);
      }
    }
  });

  const allDueItems = [...coreItems, ...shiftSpecificItems, ...monthlyDueItems];

  const dateFormatted = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const monthVisits = getMonthlyContractVisits(date.getFullYear(), date.getMonth());
  const visitNumberInMonth = monthVisits.visitNumberMap[date.getDate()];

  return {
    date,
    dateFormatted,
    dayName,
    isScheduledDay,
    shiftDay: activeShift,
    coreItems,
    shiftSpecificItems,
    monthlyDueItems,
    allDueItems,
    monthlyTaskDue,
    scheduledTime: '11:00 PM',
    visitNumberInMonth: isScheduledDay ? visitNumberInMonth : undefined,
    totalVisitsInMonth: monthVisits.targetVisits,
    nextScheduledShift: {
      dayName: nextShiftName,
      shiftDay: nextShiftDay,
      time: '11:00 PM',
    },
  };
}

