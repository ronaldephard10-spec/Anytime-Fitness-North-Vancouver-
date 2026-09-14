import React from 'react';
import { Calendar, CheckCircle, Sparkles, Layers } from 'lucide-react';
import { ActiveTab, DayOfWeek } from '../types/inspection';

interface TabBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  matchedDay: DayOfWeek | null;
  dayCounts: Record<ActiveTab, { total: number; passed: number; score: number }>;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onSelectTab,
  matchedDay,
  dayCounts,
}) => {
  const tabs: { id: ActiveTab; label: string; sub: string; dayIndex?: number }[] = [
    { id: 'sunday', label: 'Sunday', sub: '11:00 PM Shift', dayIndex: 0 },
    { id: 'tuesday', label: 'Tuesday', sub: '11:00 PM Shift', dayIndex: 2 },
    { id: 'thursday', label: 'Thursday', sub: '11:00 PM Shift', dayIndex: 4 },
    { id: 'full-audit', label: 'Full Audit', sub: 'All 3 Weekly Shifts' },
  ];

  return (
    <div id="day-navigation-container" className="w-full bg-slate-900/60 border-b border-slate-800 p-2 sm:p-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span>Select Inspection Shift</span>
            <span className="text-[11px] text-purple-300 font-normal normal-case hidden sm:inline">
              (Sun, Tue, Thu at 11:00 PM)
            </span>
          </div>
          {matchedDay ? (
            <span className="text-[11px] font-medium text-purple-300 flex items-center gap-1 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Today is {matchedDay.toUpperCase()} (11:00 PM Shift Active)
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">
              Schedule: 3x / Week (Sun, Tue, Thu @ 11:00 PM)
            </span>
          )}
        </div>

        {/* Tab Buttons Grid */}
        <div id="day-tabs-list" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isToday = tab.id === matchedDay;
            const countInfo = dayCounts[tab.id];
            const isComplete = countInfo && countInfo.passed > 0 && countInfo.passed === countInfo.total;

            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex flex-col items-start text-left p-3 rounded-xl transition-all border ${
                  isActive
                    ? 'bg-purple-900/40 border-purple-500 shadow-md shadow-purple-950/50 text-white'
                    : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 text-slate-300'
                }`}
              >
                {/* Top row in tab: label and badges */}
                <div className="flex items-center justify-between w-full gap-1">
                  <span className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                    {tab.id === 'full-audit' ? (
                      <Layers className={`w-4 h-4 ${isActive ? 'text-purple-300' : 'text-slate-400'}`} />
                    ) : null}
                    {tab.label}
                  </span>

                  <div className="flex items-center gap-1">
                    {isToday && (
                      <span className="bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-wide shadow-xs">
                        TODAY
                      </span>
                    )}
                    {isComplete && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                </div>

                {/* Subtext and progress */}
                <div className="mt-1 flex items-center justify-between w-full text-[11px] text-slate-400">
                  <span>{tab.sub}</span>
                  <span className={`font-semibold ${isActive ? 'text-purple-300' : 'text-slate-400'}`}>
                    {countInfo ? `${countInfo.passed}/${countInfo.total} items` : ''}
                  </span>
                </div>

                {/* Mini progress bar under tab */}
                {countInfo && countInfo.total > 0 && (
                  <div className="w-full bg-slate-950/60 rounded-full h-1 mt-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        countInfo.score >= 85
                          ? 'bg-emerald-400'
                          : countInfo.score > 0
                          ? 'bg-purple-400'
                          : 'bg-slate-700'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, countInfo.score))}%` }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
