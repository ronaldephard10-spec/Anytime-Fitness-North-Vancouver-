import React from 'react';
import { Calendar, CheckCircle, Sparkles, Layers } from 'lucide-react';
import { ActiveTab, DayOfWeek } from '../types/inspection';

interface TabBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  matchedDay: DayOfWeek | null;
  dayCounts: Record<ActiveTab, { total: number; passed: number; score: number }>;
  currentDayName?: string;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onSelectTab,
  matchedDay,
  dayCounts,
  currentDayName,
}) => {
  const tabs: { id: ActiveTab; label: string; sub: string; dayIndex: number }[] = [
    { id: 'tuesday', label: 'Tuesday Shift', sub: '11:00 PM • Mid-Week Detail', dayIndex: 2 },
    { id: 'thursday', label: 'Thursday Shift', sub: '11:00 PM • Weekly Disinfection', dayIndex: 4 },
    { id: 'saturday', label: 'Saturday Shift', sub: '11:00 PM • Weekend Deep Clean', dayIndex: 6 },
  ];

  const isTodayActive = matchedDay === activeTab;

  return (
    <div id="day-navigation-container" className="w-full bg-slate-900/80 border-b border-slate-800 p-2 sm:p-3">
      <div className="max-w-7xl mx-auto space-y-2">
        {/* Top Status Banner: Confirms "Only showing what is due that day" */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-950/80 text-purple-200 border border-purple-800/80">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>Shift Due Focus</span>
            </span>

            {matchedDay ? (
              <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Today is {currentDayName || matchedDay.toUpperCase()}: Showing Due Shift Items Only</span>
              </span>
            ) : (
              <span className="text-xs text-amber-300 flex items-center gap-1.5 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/60">
                <span>Off-Schedule Today ({currentDayName}): Select Shift to Inspect</span>
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Contract #3007: Tuesday, Thursday & Saturday @ 11:00 PM (156 Visits/Year)</span>
          </div>
        </div>

        {/* Shift Selector Grid */}
        <div id="day-tabs-list" className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                    ? 'bg-gradient-to-br from-purple-950/80 to-slate-900 border-purple-500 shadow-md shadow-purple-950/60 text-white ring-1 ring-purple-500/30'
                    : 'bg-slate-800/50 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600 text-slate-300'
                }`}
              >
                {/* Top row in tab: label and badges */}
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm tracking-tight text-white">
                      {tab.label}
                    </span>
                    {isToday && (
                      <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded tracking-wide shadow-xs">
                        DUE TODAY
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isComplete && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        100%
                      </span>
                    )}
                    {countInfo && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        isActive ? 'bg-purple-900/70 text-purple-200' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {countInfo.total} due
                      </span>
                    )}
                  </div>
                </div>

                {/* Subtext and progress */}
                <div className="mt-1.5 flex items-center justify-between w-full text-xs text-slate-400">
                  <span className="text-[11px] truncate">{tab.sub}</span>
                  <span className={`font-semibold text-[11px] shrink-0 ${isActive ? 'text-purple-300' : 'text-slate-400'}`}>
                    {countInfo ? `${countInfo.passed} of ${countInfo.total} pass` : ''}
                  </span>
                </div>

                {/* Progress bar under tab */}
                {countInfo && countInfo.total > 0 && (
                  <div className="w-full bg-slate-950/80 rounded-full h-1.5 mt-2.5 overflow-hidden">
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
