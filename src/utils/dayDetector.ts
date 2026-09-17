import { ActiveTab, DayOfWeek } from '../types/inspection';

export const INSPECTION_SCHEDULE = {
  days: ['Tuesday', 'Thursday', 'Saturday'] as const,
  frequency: '3x / Week',
  time: '11:00 PM',
  fullScheduleText: '3x / Week (Tuesday, Thursday, Saturday at 11:00 PM — 156 Annual Visits)',
};

export function getTodayInspectionDay(): {
  dayOfWeekNum: number;
  dayName: string;
  matchedInspectionDay: DayOfWeek | null;
  recommendedTab: ActiveTab;
  isScheduledDay: boolean;
  scheduledTime: string;
  scheduleSummary: string;
} {
  const now = new Date();
  const dayNum = now.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[dayNum];

  let matchedInspectionDay: DayOfWeek | null = null;
  let recommendedTab: ActiveTab = 'tuesday';

  if (dayNum === 2) {
    matchedInspectionDay = 'tuesday';
    recommendedTab = 'tuesday';
  } else if (dayNum === 4) {
    matchedInspectionDay = 'thursday';
    recommendedTab = 'thursday';
  } else if (dayNum === 6) {
    matchedInspectionDay = 'saturday';
    recommendedTab = 'saturday';
  } else {
    // If it's an off-scheduled day, recommend the closest inspection shift
    if (dayNum === 0 || dayNum === 1) recommendedTab = 'tuesday';
    else if (dayNum === 3) recommendedTab = 'thursday';
    else if (dayNum === 5) recommendedTab = 'saturday';
  }

  const isScheduledDay = matchedInspectionDay !== null;

  return {
    dayOfWeekNum: dayNum,
    dayName,
    matchedInspectionDay,
    recommendedTab,
    isScheduledDay,
    scheduledTime: INSPECTION_SCHEDULE.time,
    scheduleSummary: INSPECTION_SCHEDULE.fullScheduleText,
  };
}

export function formatInspectionTimestamp(date: Date = new Date()): {
  formattedDate: string;
  formattedTime: string;
} {
  const formattedDate = date.toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return { formattedDate, formattedTime };
}

export function getLocalDateIso(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
