import React from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  CalendarDays,
  Building2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { FACILITY_INFO } from '../types/inspection';
import {
  getShiftScheduleForDate,
  getMonthlyTasksDueForDate,
  getWeekdayOccurrenceInMonth,
} from '../utils/scheduleEngine';

interface InteractiveDateSwitcherProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  onOpen12MonthCalendar: () => void;
}

export const InteractiveDateSwitcher: React.FC<InteractiveDateSwitcherProps> = ({
  currentDate,
  onSelectDate,
  onOpen12MonthCalendar,
}) => {
  const scheduleInfo = getShiftScheduleForDate(currentDate);
  const tasksDue = getMonthlyTasksDueForDate(currentDate);
  const occurrence = getWeekdayOccurrenceInMonth(currentDate);
  const dayOfWeek = currentDate.getDay(); // 0=Sun, 2=Tue, 4=Thu, 6=Sat

  // ISO string YYYY-MM-DD for date input
  const dateInputValue = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(
    currentDate.getDate()
  ).padStart(2, '0')}`;

  // Helper to step to previous/next service day (Sun=0, Tue=2, Thu=4)
  const stepVisit = (direction: 'prev' | 'next') => {
    const step = direction === 'next' ? 1 : -1;
    let nextDate = new Date(currentDate);
    for (let i = 0; i < 7; i++) {
      nextDate.setDate(nextDate.getDate() + step);
      const d = nextDate.getDay();
      if (d === 0 || d === 2 || d === 4) {
        onSelectDate(nextDate);
        return;
      }
    }
  };

  // Special Contract Milestones
  const isFirstTuesday = dayOfWeek === 2 && occurrence === 1;
  const isSecondSunday = dayOfWeek === 0 && occurrence === 2;
  const isFourthSunday = dayOfWeek === 0 && occurrence === 4;

  // Jump to specific milestone helpers
  const jumpToFirstTuesday = () => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    while (d.getDay() !== 2) {
      d.setDate(d.getDate() + 1);
    }
    onSelectDate(d);
  };

  const jumpToSecondSunday = () => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    while (d.getDay() !== 0) {
      d.setDate(d.getDate() + 1);
    }
    d.setDate(d.getDate() + 7); // 2nd Sunday
    onSelectDate(d);
  };

  const jumpToFourthSunday = () => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    while (d.getDay() !== 0) {
      d.setDate(d.getDate() + 1);
    }
    d.setDate(d.getDate() + 21); // 4th Sunday (1st Sunday + 21 days)
    onSelectDate(d);
  };

  return (
    <div
      id="interactive-date-switcher"
      className="bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/60 border border-purple-800/60 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4"
    >
      {/* Top Row: Facility & Schedule Cadence Metadata */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-purple-900/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-200 bg-purple-900/80 px-2.5 py-0.5 rounded-full border border-purple-500/60">
                Commercial Contract Service Calendar
              </span>
              <span className="text-xs font-bold text-white">
                {FACILITY_INFO.facility}
              </span>
              <span className="text-xs text-purple-300">
                • {FACILITY_INFO.address}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Contract Cadence: <strong className="text-purple-200">Tuesday, Thursday, Sunday after 11:00 PM</strong> • 156 Annual Visits Total
            </p>
          </div>
        </div>

        {/* Quick 12-Month Calendar Launch Button */}
        <button
          onClick={onOpen12MonthCalendar}
          id="btn-open-12mo-calendar"
          className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-950/60 border border-purple-400/40 transition cursor-pointer shrink-0"
        >
          <CalendarDays className="w-4 h-4 text-purple-200" />
          <span>Source Document (12-Mo Calendar)</span>
          <span className="text-[10px] bg-purple-950 px-1.5 py-0.2 rounded font-black text-purple-300 border border-purple-500/40">
            156 Visits
          </span>
        </button>
      </div>

      {/* Middle Row: Date Navigator & Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Date Selector Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Step Previous Visit */}
          <button
            onClick={() => stepVisit('prev')}
            id="btn-prev-visit"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            title="Jump to Previous Contract Service Visit"
          >
            <ChevronLeft className="w-4 h-4 text-purple-300" />
            <span className="hidden sm:inline">Prev Visit</span>
          </button>

          {/* Date Picker Input */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-purple-700/60 shadow-inner">
            <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
            <label htmlFor="audit-date-picker" className="sr-only">
              Inspection Date
            </label>
            <input
              type="date"
              id="audit-date-picker"
              value={dateInputValue}
              onChange={(e) => {
                if (e.target.value) {
                  const [y, m, d] = e.target.value.split('-').map(Number);
                  onSelectDate(new Date(y, m - 1, d));
                }
              }}
              className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
            />
          </div>

          {/* Step Next Visit */}
          <button
            onClick={() => stepVisit('next')}
            id="btn-next-visit"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            title="Jump to Next Contract Service Visit"
          >
            <span className="hidden sm:inline">Next Visit</span>
            <ChevronRight className="w-4 h-4 text-purple-300" />
          </button>

          {/* Jump to Today */}
          <button
            onClick={() => onSelectDate(new Date())}
            id="btn-today-visit"
            className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
            title="Reset Date to Today"
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
            <span>Today</span>
          </button>
        </div>

        {/* Current Inspected Date Status Badge */}
        <div className="flex flex-wrap items-center gap-2">
          {scheduleInfo.isScheduledShift ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <span className="font-extrabold text-white">
                  {scheduleInfo.dayOfWeekName} Shift Active
                </span>
                <span className="text-[11px] text-emerald-300 ml-1.5 font-medium">
                  • 11:00 PM • Contract Visit
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-300 shadow-sm">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-white">
                  {scheduleInfo.dayOfWeekName} (Off-Schedule)
                </span>
                <span className="text-[11px] text-amber-200 ml-1.5">
                  • Standard visits: Tue, Thu, Sat
                </span>
              </div>
            </div>
          )}

          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-purple-800/50 text-xs text-slate-300 font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>
              Week {scheduleInfo.occurrenceInMonth} of month ({scheduleInfo.dayOfWeekName})
            </span>
          </div>
        </div>
      </div>

      {/* Contract Verification Banner: Mandated Tasks Triggered */}
      <div className="pt-2 border-t border-purple-900/40">
        {tasksDue.length > 0 ? (
          <div className="space-y-2">
            {tasksDue.map((task) => (
              <div
                key={task.toggleKey}
                className="p-3 rounded-xl bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border border-purple-500/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-purple-900 border border-purple-400 text-purple-200 text-[10px] font-black uppercase">
                      Mandated by Contract Due Date
                    </span>
                    <span className="font-bold text-white text-sm">
                      {task.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {task.description} • <em>{task.occurrenceText}</em>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-500/60 text-emerald-300 text-xs font-extrabold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Active in Tonight's Walkthrough</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>
                Standard Core & Shift Services due for this date. No monthly deep clean is mandated for {scheduleInfo.dayOfWeekName}, Week {scheduleInfo.occurrenceInMonth}.
              </span>
            </div>

            {/* Quick Milestone Jump Links */}
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-500">Test Rotations:</span>
              <button
                onClick={jumpToFirstTuesday}
                className="text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
                title="Jump to 1st Tuesday of this month to test 'Clean partition glass'"
              >
                1st Tue (Partition Glass)
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={jumpToSecondSunday}
                className="text-purple-300 hover:text-purple-200 font-semibold underline cursor-pointer"
                title="Jump to 2nd Sunday of this month to test 'Partition Glass Detail'"
              >
                2nd Sun (Partition Detail)
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={jumpToFourthSunday}
                className="text-indigo-300 hover:text-indigo-200 font-semibold underline cursor-pointer"
                title="Jump to 4th Sunday of this month to test 'Inside Refrigerator Deep Clean'"
              >
                4th Sun (Refrigerator Clean)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
