import React, { useState } from 'react';
import {
  FileText,
  X,
  Calendar,
  Building2,
  Phone,
  Key,
  ShieldCheck,
  Clock,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Search,
  ChevronRight,
  ExternalLink,
  Layers,
  Wrench,
  AlertTriangle,
  Printer
} from 'lucide-react';
import { ORIGINAL_SOURCE_DOCUMENT, WORK_SCHEDULE_ITEMS, ServiceFrequencyItem } from '../data/sourceDocument';
import { INITIAL_PERIODIC_SERVICES, MONTHLY_SERVICE_RULES } from '../utils/scheduleEngine';

interface SourceDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMonthlyTask?: (toggleKey: string) => void;
}

type TabType = 'account' | 'areas' | 'schedule' | 'calendar' | 'special';

export const SourceDocumentModal: React.FC<SourceDocumentModalProps> = ({
  isOpen,
  onClose,
  onSelectMonthlyTask,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('schedule');
  const [searchQuery, setSearchQuery] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState<string>('all');
  const [selectedCalendarMonth, setSelectedCalendarMonth] = useState<number>(9); // 9 = Oct 2026, 8 = Sep 2026

  if (!isOpen) return null;

  const doc = ORIGINAL_SOURCE_DOCUMENT;

  const filteredItems = WORK_SCHEDULE_ITEMS.filter((item) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.frequency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.dayOrTiming.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFreq =
      frequencyFilter === 'all' ||
      (frequencyFilter === 'daily' && item.frequency === '3x Week') ||
      (frequencyFilter === 'weekly' && (item.frequency === '1x Week' || item.frequency === '2x Week')) ||
      (frequencyFilter === 'monthly' && item.frequency === '1x Month') ||
      (frequencyFilter === 'special' && item.frequency === 'Periodic / Annual');

    return matchesSearch && matchesFreq;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#311b47] via-[#4B286D] to-[#1f1635] px-5 py-4 border-b border-purple-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
                  Original Source Document
                </span>
                <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800">
                  Account #3007
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                Coverall Health-Based Cleaning System • Work Agreement & Schedule
              </h2>
              <p className="text-xs text-purple-200/80">
                Anytime Fitness North Vancouver (Northwoods Village) • Executed Sept 13, 2026
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              title="Print Reference Document"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition hidden sm:flex items-center gap-1.5 text-xs font-medium"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden md:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-900/95 border-b border-slate-800 px-4 flex gap-1 overflow-x-auto text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'schedule'
                ? 'border-purple-400 text-purple-300 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Work Schedule & Frequencies ({WORK_SCHEDULE_ITEMS.length})
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'border-purple-400 text-purple-300 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Monthly Rotation Calendar (2026-2027)
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'account'
                ? 'border-purple-400 text-purple-300 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Account & Security Specs (Acct #3007)
          </button>

          <button
            onClick={() => setActiveTab('areas')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'areas'
                ? 'border-purple-400 text-purple-300 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            10 Serviced Areas & S.O.P.
          </button>

          <button
            onClick={() => setActiveTab('special')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'special'
                ? 'border-purple-400 text-purple-300 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Annual & Periodic Services (Page 21)
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: WORK SCHEDULE & FREQUENCIES */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              {/* Search and Filter bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks, equipment, chemicals, or frequency..."
                    className="w-full bg-slate-900 text-white pl-9 pr-4 py-2 rounded-lg text-xs border border-slate-700 focus:outline-none focus:border-purple-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                  {[
                    { id: 'all', label: 'All Items' },
                    { id: 'daily', label: '3x / Week (Daily)' },
                    { id: 'weekly', label: 'Weekly Shifts' },
                    { id: 'monthly', label: 'Monthly Rotation' },
                    { id: 'special', label: 'Special / Annual' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFrequencyFilter(f.id)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                        frequencyFilter === f.id
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items Table / Cards */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                <div className="divide-y divide-slate-800">
                  {filteredItems.map((item) => {
                    const isDaily = item.frequency === '3x Week';
                    const isWeekly = item.frequency === '1x Week' || item.frequency === '2x Week';
                    const isMonthly = item.frequency === '1x Month';
                    const isSpecial = item.frequency === 'Periodic / Annual';

                    return (
                      <div
                        key={item.id}
                        className="p-4 hover:bg-slate-800/30 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="space-y-1 max-w-3xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-950/70 px-2 py-0.5 rounded border border-purple-800/60">
                              {item.section}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                isDaily
                                  ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                  : isWeekly
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : isMonthly
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : 'bg-purple-950 text-purple-300 border border-purple-800'
                              }`}
                            >
                              {item.frequency}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              • {item.dayOrTiming}
                            </span>
                          </div>

                          <p className="text-sm text-slate-200 font-medium leading-relaxed">
                            {item.task}
                          </p>

                          <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
                            <span className="text-slate-500 font-medium">Protocol / Tools:</span>
                            <span className="text-slate-300">{item.toolsSupplies}</span>
                          </div>

                          {item.notes && (
                            <div className="text-[11px] text-purple-300/90 bg-purple-950/40 px-2.5 py-1 rounded border border-purple-900/40">
                              <span className="font-semibold">Schedule Note:</span> {item.notes}
                            </div>
                          )}
                        </div>

                        {/* Action if monthly toggle can be activated */}
                        {isMonthly && onSelectMonthlyTask && (
                          <div className="shrink-0 flex items-center">
                            <button
                              onClick={() => {
                                const rule = Object.values(MONTHLY_SERVICE_RULES).find(
                                  (r) => r.name.toLowerCase() === item.task.slice(0, 20).toLowerCase() || item.task.includes('blinds')
                                );
                                if (rule) {
                                  onSelectMonthlyTask(rule.toggleKey);
                                  onClose();
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-purple-600/30 text-purple-200 hover:bg-purple-600 hover:text-white border border-purple-500/40 text-xs font-semibold transition flex items-center gap-1.5"
                            >
                              <span>View in Shift</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MONTHLY ROTATION CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="space-y-5">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      12-Month Official Rotation Matrix (Coverall Contract Pages 7-19)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Exact calendar breakdown of when each monthly deep clean service is scheduled across all 12 contract months.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Select Month:</span>
                    <select
                      value={selectedCalendarMonth}
                      onChange={(e) => setSelectedCalendarMonth(Number(e.target.value))}
                      className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-purple-400"
                    >
                      <option value={8}>September 2026 (Contract Start)</option>
                      <option value={9}>October 2026</option>
                      <option value={10}>November 2026</option>
                      <option value={11}>December 2026</option>
                      <option value={0}>January 2027</option>
                      <option value={1}>February 2027</option>
                      <option value={2}>March 2027</option>
                      <option value={3}>April 2027</option>
                      <option value={4}>May 2027</option>
                      <option value={5}>June 2027</option>
                      <option value={6}>July 2027</option>
                      <option value={7}>August 2027</option>
                      <option value={8.5}>September 2027 (Annual Renewal)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Visual 4-Week Schedule Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Week 1 */}
                <div className="bg-slate-800/40 border border-slate-700/70 rounded-xl p-4 space-y-3">
                  <div className="border-b border-slate-700/70 pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/70 px-2 py-0.5 rounded border border-purple-800/50">
                      Week 1 of Month
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">1st Tuesday Shift</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40">
                      <div className="font-bold text-amber-300">1. Entrance Glass Doors</div>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        Clean glass doors interior & exterior with glass cleaner; polish trim.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40">
                      <div className="font-bold text-amber-300">2. Dust Blinds</div>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        Dust all window blinds throughout gym & offices.
                      </p>
                    </div>
                    <div className="text-[11px] text-slate-400 pt-1">
                      + Regular Daily Services (3x/wk) & High/Low dusting.
                    </div>
                  </div>
                </div>

                {/* Week 2 */}
                <div className="bg-slate-800/40 border border-slate-700/70 rounded-xl p-4 space-y-3">
                  <div className="border-b border-slate-700/70 pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/70 px-2 py-0.5 rounded border border-purple-800/50">
                      Week 2 of Month
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">2nd Tue & 2nd Thu</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40">
                      <div className="font-bold text-amber-300">2nd Tue: Dust Fixtures & Vents</div>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        Dust light fixtures, ceiling vents & 6ft-10ft areas & corners.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40">
                      <div className="font-bold text-amber-300">2nd Thu: Vacuum Furniture</div>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        Vacuum fabric furniture, wipe plastic & leather chairs with disinfectant.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Week 3 */}
                <div className="bg-slate-800/40 border border-slate-700/70 rounded-xl p-4 space-y-3">
                  <div className="border-b border-slate-700/70 pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/70 px-2 py-0.5 rounded border border-purple-800/50">
                      Week 3 of Month
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">3rd Thu & 3rd Sun</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40">
                      <div className="font-bold text-amber-300">3rd Thu: Edge Vacuum</div>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        Detail edge vacuuming around all furniture, baseboards, and walls.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40">
                      <div className="font-bold text-amber-300">3rd Sun: Clean Part. Glass</div>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        Deep squeegee and wipe all glass partition panels & doors.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Week 4 */}
                <div className="bg-slate-800/40 border border-slate-700/70 rounded-xl p-4 space-y-3">
                  <div className="border-b border-slate-700/70 pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/70 px-2 py-0.5 rounded border border-purple-800/50">
                      Week 4 / Last Week
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">4th Sunday Shift</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40">
                      <div className="font-bold text-amber-300">4th Sun: Refrigerators</div>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        Deep clean inside of refrigerators using hospital disinfectant.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700">
                      <div className="font-bold text-slate-300">Every Sunday Routine:</div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Microwave interior clean + Traffic vacuuming + Daily Services.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Rotation Rule Summary Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40 p-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Summary Table: When Monthly Services Must Be Performed
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-800/70 text-slate-300 uppercase text-[10px] font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Service Name</th>
                        <th className="py-2.5 px-3">Scheduled Timing</th>
                        <th className="py-2.5 px-3">Day of Week</th>
                        <th className="py-2.5 px-3">Protocol</th>
                        <th className="py-2.5 px-3">Contract Ref</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-purple-300">Clean Glass Entrance Doors & Trim</td>
                        <td className="py-2.5 px-3">1st Tuesday of Month</td>
                        <td className="py-2.5 px-3">Tuesday 11:00 PM</td>
                        <td className="py-2.5 px-3 text-slate-400">Microfiber & Glass Cleaner</td>
                        <td className="py-2.5 px-3 text-slate-500">Pg 3, 7</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-purple-300">Dust Blinds</td>
                        <td className="py-2.5 px-3">1st Tuesday of Month</td>
                        <td className="py-2.5 px-3">Tuesday 11:00 PM</td>
                        <td className="py-2.5 px-3 text-slate-400">Blind duster / vacuum</td>
                        <td className="py-2.5 px-3 text-slate-500">Pg 4, 7</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-purple-300">Dust Light Fixtures & Ceiling Vents</td>
                        <td className="py-2.5 px-3">2nd Tuesday of Month</td>
                        <td className="py-2.5 px-3">Tuesday 11:00 PM</td>
                        <td className="py-2.5 px-3 text-slate-400">High-reach pole (6-10 ft)</td>
                        <td className="py-2.5 px-3 text-slate-500">Pg 4, 8</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-purple-300">Vacuum Furniture (Fabric & Leather)</td>
                        <td className="py-2.5 px-3">2nd Thursday of Month</td>
                        <td className="py-2.5 px-3">Thursday 11:00 PM</td>
                        <td className="py-2.5 px-3 text-slate-400">Upholstery vacuum & disinfectant</td>
                        <td className="py-2.5 px-3 text-slate-500">Pg 3, 8</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-purple-300">Detail Edge Vacuuming (Perimeter)</td>
                        <td className="py-2.5 px-3">3rd Thursday of Month</td>
                        <td className="py-2.5 px-3">Thursday 11:00 PM</td>
                        <td className="py-2.5 px-3 text-slate-400">Crevice tool vacuuming</td>
                        <td className="py-2.5 px-3 text-slate-500">Pg 3, 7</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-purple-300">Clean Partition Glass & Plexi Sections</td>
                        <td className="py-2.5 px-3">3rd Sunday of Month</td>
                        <td className="py-2.5 px-3">Sunday 11:00 PM</td>
                        <td className="py-2.5 px-3 text-slate-400">Squeegee & streak-free wipe</td>
                        <td className="py-2.5 px-3 text-slate-500">Pg 5, 7</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-purple-300">Clean Inside of Refrigerators</td>
                        <td className="py-2.5 px-3">4th Sunday of Month</td>
                        <td className="py-2.5 px-3">Sunday 11:00 PM</td>
                        <td className="py-2.5 px-3 text-slate-400">Disinfectant & shelf sanitizing</td>
                        <td className="py-2.5 px-3 text-slate-500">Pg 4, 7</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACCOUNT & SECURITY SPECS */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Account Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Account & Facility Details */}
                <div className="bg-slate-800/40 border border-slate-700/70 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-slate-700/60 pb-3">
                    <Building2 className="w-5 h-5 text-purple-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Franchisee Account Specs</h3>
                      <p className="text-xs text-slate-400">Account #3007 • Franchisee Account Information Sheet</p>
                    </div>
                  </div>

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                    <div>
                      <dt className="text-slate-400 font-medium">Company Name</dt>
                      <dd className="font-semibold text-slate-200 mt-0.5">Anytime Fitness North</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400 font-medium">Account Number</dt>
                      <dd className="font-semibold text-emerald-400 mt-0.5">#3007</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-slate-400 font-medium">Facility Address</dt>
                      <dd className="font-semibold text-slate-200 mt-0.5">
                        2180 Dollarton Hwy Unit 103, North Vancouver, BC V7H 0B5
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-400 font-medium">Frequency</dt>
                      <dd className="font-semibold text-purple-300 mt-0.5">3x / Week (Sun, Tue, Thu)</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400 font-medium">Shift Time</dt>
                      <dd className="font-semibold text-purple-300 mt-0.5">11:00 PM (After Hours)</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400 font-medium">Monthly Billing</dt>
                      <dd className="font-semibold text-emerald-400 mt-0.5">$685.00 / month</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400 font-medium">Contract Start Date</dt>
                      <dd className="font-semibold text-slate-200 mt-0.5">September 13, 2026</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400 font-medium">Initial Clean</dt>
                      <dd className="font-semibold text-emerald-400 mt-0.5">Yes (Completed Sept 13)</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400 font-medium">Supplies Ordered By</dt>
                      <dd className="font-semibold text-slate-200 mt-0.5">Customer</dd>
                    </div>
                  </dl>
                </div>

                {/* Contacts & Security Access */}
                <div className="bg-slate-800/40 border border-slate-700/70 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-slate-700/60 pb-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Contacts & Security Access</h3>
                      <p className="text-xs text-slate-400">Key Pick Up Sheet & Emergency Info</p>
                    </div>
                  </div>

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                    <div>
                      <dt className="text-slate-400 font-medium">Primary Contact</dt>
                      <dd className="font-semibold text-slate-200 mt-0.5">Jennifer Johnson</dd>
                      <dd className="text-purple-300 text-[11px] font-mono">604-785-4857</dd>
                      <dd className="text-slate-400 text-[11px]">jen.johnson@anytimefitness.ca</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400 font-medium">Other Emergency Contact</dt>
                      <dd className="font-semibold text-slate-200 mt-0.5">Tara</dd>
                      <dd className="text-purple-300 text-[11px] font-mono">604-620-0048</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400 font-medium">Franchise Owner</dt>
                      <dd className="font-semibold text-slate-200 mt-0.5">Ronald Ephard</dd>
                      <dd className="text-slate-400 text-[11px]">Coverall Franchisee</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400 font-medium">Coverall Regional Fax</dt>
                      <dd className="font-semibold text-slate-300 mt-0.5 font-mono">(604) 434-7774</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-slate-400 font-medium">Keys Received</dt>
                      <dd className="font-semibold text-amber-300 mt-0.5 flex items-center gap-1">
                        <Key className="w-3.5 h-3.5" />
                        1 Fob + 1 Key
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-slate-400 font-medium">Closing Security Mandate</dt>
                      <dd className="text-slate-300 mt-0.5 text-[11px]">
                        Turn off office lights, verify gym perimeter, ensure all exterior doors and windows are securely locked (1 Fob + 1 Key).
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 10 SERVICED AREAS & S.O.P. */}
          {activeTab === 'areas' && (
            <div className="space-y-4">
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Coverall Health-Based Cleaning System: 10 Serviced Facility Areas (Page 2)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  All cleaning protocols adhere to Coverall hospital-grade sanitation, color-coded microfiber cross-contamination prevention, and flat-mopping standards.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {doc.facilityDetails.areasToService.map((area, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/70 hover:border-purple-500/50 transition flex items-start gap-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-950/80 text-purple-300 border border-purple-800/60 flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-200">{area}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Serviced according to Coverall daily, weekly, and monthly schedule matrix.
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Standard Operating Procedures highlight */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/40 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Coverall Health-Based Sanitation Protocols
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="font-bold text-purple-200 block">Color-Coded Microfibers</span>
                    Specific cloth colors dedicated strictly to Restrooms vs. Gym/Offices to prevent cross-contamination.
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="font-bold text-purple-200 block">Hospital-Grade Disinfectant</span>
                    EPA-registered broad-spectrum disinfectant with certified dwell times on workout equipment, restrooms, showers.
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="font-bold text-purple-200 block">Microfiber Flat Mopping</span>
                    No dirty mop buckets; microfiber flat pads trap dirt and eliminate mop streaks across gym tile and concrete.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ANNUAL & PERIODIC SERVICES (PAGE 21) */}
          {activeTab === 'special' && (
            <div className="space-y-4">
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-purple-400" />
                    Coverall Special Service Agreement (Page 21 of Agreement)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Periodic and annual special services available for Anytime Fitness North Vancouver.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-purple-300 bg-purple-950 px-2.5 py-1 rounded border border-purple-800">
                  Separate Work Orders / Periodic Cycles
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {INITIAL_PERIODIC_SERVICES.map((serv) => (
                  <div
                    key={serv.id}
                    className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/70 hover:border-slate-600 transition space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-200">{serv.title}</h4>
                      <span className="text-[10px] font-bold text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                        {serv.frequencyLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{serv.description}</p>
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-700/50 flex items-center justify-between">
                      <span>Source: {serv.contractReference}</span>
                      <span className="text-slate-400 font-medium">
                        Cycle: {serv.recommendedCycleMonths} mos
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-900 border-t border-slate-800 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Coverall Agreement #3007 • Active Reference Document</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
            >
              Close Reference
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
