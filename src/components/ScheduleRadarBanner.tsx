import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  FileText,
  Wrench,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { ActiveTab } from '../types/inspection';
import {
  getShiftScheduleForDate,
  getUpcomingMonthlyTasks,
  ScheduledMonthlyTask
} from '../utils/scheduleEngine';

interface ScheduleRadarBannerProps {
  activeTab: ActiveTab;
  monthlyToggles: Record<string, boolean>;
  onToggleMonthly: (toggleKey: string) => void;
  onOpenSourceDoc: () => void;
  onOpenPeriodicServices: () => void;
  onOpenMonthlySummary?: () => void;
  onSimulateNewDay?: () => void;
}

export const ScheduleRadarBanner: React.FC<ScheduleRadarBannerProps> = ({
  activeTab,
  monthlyToggles,
  onToggleMonthly,
  onOpenSourceDoc,
  onOpenPeriodicServices,
  onOpenMonthlySummary,
  onSimulateNewDay,
}) => {
  const [isLookaheadOpen, setIsLookaheadOpen] = useState(false);
  const now = new Date();
  const scheduleSummary = getShiftScheduleForDate(now);
  const upcomingMonthly = getUpcomingMonthlyTasks(now, 30);

  const tasksDueTonight = scheduleSummary.monthlyTasksDueTonight;
  const hasMonthlyDueTonight = tasksDueTonight.length > 0;

  // Check if tonight's task is already activated in the checklist
  const allTonightActivated =
    hasMonthlyDueTonight &&
    tasksDueTonight.every((t) => monthlyToggles[t.toggleKey] === true);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 border border-purple-900/40 rounded-xl p-4 shadow-md space-y-3">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-950/80 px-2.5 py-0.5 rounded border border-purple-800">
                Coverall Work Schedule Radar
              </span>
              <span className="text-xs font-semibold text-slate-200">
                {scheduleSummary.dateFormatted} • {scheduleSummary.dayOfWeekName}
              </span>
              {scheduleSummary.isScheduledShift ? (
                <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  11:00 PM Shift Active
                </span>
              ) : (
                <span className="text-xs text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded">
                  Non-cleaning Day (Next: Sun, Tue, or Thu @ 11:00 PM)
                </span>
              )}
            </div>

            <div className="text-sm sm:text-xs text-slate-200 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>
                <strong>Occurrence:</strong> Week {scheduleSummary.occurrenceInMonth} of the month ({scheduleSummary.dayOfWeekName})
              </span>
              <span>•</span>
              <span>
                <strong>Reference:</strong> Agreement #3007
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Source Doc, Periodic Services, & Monthly QA Report */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {onOpenMonthlySummary && (
            <button
              onClick={onOpenMonthlySummary}
              className="px-3.5 py-2 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-lg bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 text-white border border-purple-500/50 text-sm sm:text-xs font-bold transition flex items-center gap-1.5 shadow-sm min-h-[40px] sm:min-h-0"
              title="Open Client Monthly QA Summary & Executive Report"
            >
              <FileText className="w-4 h-4 text-purple-200" />
              <span>Monthly Client QA</span>
            </button>
          )}

          <button
            onClick={onOpenPeriodicServices}
            className="px-3.5 py-2 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm sm:text-xs font-semibold transition flex items-center gap-1.5 shadow-sm min-h-[40px] sm:min-h-0"
          >
            <Wrench className="w-4 h-4 text-purple-400" />
            <span>Annual & Periodic</span>
          </button>

          <button
            onClick={onOpenSourceDoc}
            className="px-3.5 py-2 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 text-sm sm:text-xs font-semibold transition flex items-center gap-1.5 shadow-sm min-h-[40px] sm:min-h-0"
          >
            <FileText className="w-4 h-4" />
            <span>Source Agreement</span>
          </button>

          {onSimulateNewDay && (
            <button
              onClick={onSimulateNewDay}
              className="px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-xl sm:rounded-lg bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-sm sm:text-xs font-semibold transition flex items-center gap-1.5 shadow-sm min-h-[40px] sm:min-h-0"
              title="Test the midnight rollover & report download workflow"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Simulate Day Rollover</span>
            </button>
          )}
        </div>
      </div>

      {/* Tonight's Scheduled Monthly Task Radar */}
      {hasMonthlyDueTonight ? (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-xs font-bold text-amber-200">
                  Scheduled Monthly Rotation for Tonight:
                </span>
                <span className="text-xs font-bold bg-amber-900/80 text-amber-200 px-2 py-0.5 rounded border border-amber-700">
                  {tasksDueTonight[0].occurrenceText}
                </span>
              </div>
              <p className="text-sm sm:text-xs text-amber-100 font-bold mt-1">
                {tasksDueTonight.map((t) => t.name).join(' & ')}
              </p>
              <p className="text-xs text-amber-200/90 mt-0.5">
                {tasksDueTonight.map((t) => t.description).join(' ')}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/80 px-3.5 py-2 rounded-xl border border-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Included in Tonight's Due Checklist</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-sm sm:text-xs text-slate-200">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              <strong>Tonight's Protocol:</strong> Core Daily Services (9 items) +{' '}
              {scheduleSummary.dayTab ? `${scheduleSummary.dayOfWeekName} Weekly Specifics` : 'Next scheduled 11:00 PM shift'}.
            </span>
          </div>
          {upcomingMonthly.length > 0 && (
            <span className="text-xs text-purple-300 hidden md:inline">
              Next monthly rotation: <strong>{upcomingMonthly[0].task.name}</strong> on {upcomingMonthly[0].dateStr}
            </span>
          )}
        </div>
      )}

      {/* Collapsible Lookahead Radar for Upcoming Month */}
      <div>
        <button
          onClick={() => setIsLookaheadOpen(!isLookaheadOpen)}
          className="text-xs font-semibold text-purple-300 hover:text-purple-200 flex items-center gap-1 transition p-1"
        >
          <span>{isLookaheadOpen ? 'Hide' : 'Show'} Upcoming 30-Day Rotation Schedule</span>
          {isLookaheadOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isLookaheadOpen && (
          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {upcomingMonthly.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-xs transition ${
                  item.isToday
                    ? 'bg-amber-950/40 border-amber-700/70 text-amber-200'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>{item.dateStr}</span>
                  <span className="text-purple-400">{item.task.occurrenceText}</span>
                </div>
                <div className="font-bold text-sm sm:text-xs text-slate-100 mt-1">{item.task.name}</div>
                <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                  {item.task.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
