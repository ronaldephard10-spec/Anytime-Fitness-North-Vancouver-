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
  ChevronLeft,
  RotateCcw,
  ExternalLink,
  Layers,
  Wrench,
  AlertTriangle,
  Printer,
  BookOpen,
  Lightbulb,
  ClipboardList,
  Check,
  Info,
  CalendarDays,
  ArrowRight,
} from 'lucide-react';
import { ORIGINAL_SOURCE_DOCUMENT, WORK_SCHEDULE_ITEMS, ServiceFrequencyItem } from '../data/sourceDocument';
import {
  INITIAL_PERIODIC_SERVICES,
  MONTHLY_SERVICE_RULES,
  getMonthlyContractVisits,
  getMonthlyTasksDueForDate,
  getWeekdayOccurrenceInMonth,
} from '../utils/scheduleEngine';
import {
  CORE_SERVICES,
  SUNDAY_SPECIFIC,
  SUNDAY_MONTHLY,
  TUESDAY_SPECIFIC,
  TUESDAY_MONTHLY,
  THURSDAY_SPECIFIC,
  THURSDAY_MONTHLY,
} from '../data/checklistItems';
import { InspectionItem } from '../types/inspection';

interface SourceDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMonthlyTask?: (toggleKey: string) => void;
  initialTab?: TabType;
  onSelectDateAndLoadWalkthrough?: (date: Date) => void;
  inspectedDate?: Date;
}

type TabType = 'qa-guide' | 'schedule' | 'calendar' | 'account' | 'areas' | 'special';

export const SourceDocumentModal: React.FC<SourceDocumentModalProps> = ({
  isOpen,
  onClose,
  onSelectMonthlyTask,
  initialTab,
  onSelectDateAndLoadWalkthrough,
  inspectedDate,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'qa-guide');

  // 12-month calendar selector: year & month index (0-11)
  const [calYear, setCalYear] = useState<number>(() =>
    inspectedDate ? inspectedDate.getFullYear() : new Date().getFullYear()
  );
  const [calMonth, setCalMonth] = useState<number>(() =>
    inspectedDate ? inspectedDate.getMonth() : new Date().getMonth()
  );

  React.useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      if (inspectedDate) {
        setCalYear(inspectedDate.getFullYear());
        setCalMonth(inspectedDate.getMonth());
      }
    }
  }, [isOpen, initialTab, inspectedDate]);

  const [searchQuery, setSearchQuery] = useState('');
  const [qaCategoryFilter, setQaCategoryFilter] = useState<string>('all');
  const [qaExpandedItem, setQaExpandedItem] = useState<string | null>(null);
  const [frequencyFilter, setFrequencyFilter] = useState<string>('all');

  if (!isOpen) return null;

  const doc = ORIGINAL_SOURCE_DOCUMENT;

  const allInspectionItems: InspectionItem[] = [
    ...CORE_SERVICES,
    ...SUNDAY_SPECIFIC,
    ...SUNDAY_MONTHLY,
    ...TUESDAY_SPECIFIC,
    ...TUESDAY_MONTHLY,
    ...THURSDAY_SPECIFIC,
    ...THURSDAY_MONTHLY,
  ];

  const filteredQaItems = allInspectionItems.filter((item) => {
    const matchesCat =
      qaCategoryFilter === 'all' ||
      (qaCategoryFilter === 'core' && item.category === 'core') ||
      (qaCategoryFilter === 'sunday' && (item.category === 'sunday' || (item.category === 'monthly' && item.applicableDays.includes('sunday')))) ||
      (qaCategoryFilter === 'tuesday' && (item.category === 'tuesday' || (item.category === 'monthly' && item.applicableDays.includes('tuesday')))) ||
      (qaCategoryFilter === 'thursday' && (item.category === 'thursday' || (item.category === 'monthly' && item.applicableDays.includes('thursday')))) ||
      (qaCategoryFilter === 'monthly' && item.isMonthly);

    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.inspectionGuide?.coverallSection.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.inspectionGuide?.inspectionProcedure.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

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
                {doc.customerName} • {doc.customerAddress} • Printed: {doc.printingDate} • {doc.totalAnnualVisits} Visits
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
            onClick={() => setActiveTab('qa-guide')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'qa-guide'
                ? 'border-purple-400 text-purple-300 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            QA Inspection Guide ({allInspectionItems.length} Items)
          </button>

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
          {/* TAB 0: QA INSPECTION GUIDE & STANDARDS */}
          {activeTab === 'qa-guide' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="bg-gradient-to-br from-purple-950/80 via-slate-900 to-slate-900 p-4 sm:p-5 rounded-2xl border border-purple-800/60 shadow-md space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 bg-purple-900/60 px-2.5 py-0.5 rounded-full border border-purple-700">
                        Coverall Health-Based Cleaning System
                      </span>
                      <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        Quality Assurance Rating Manual
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                      FBO Inspection Guide: Walkthrough Procedures & Grading Standards
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-3xl mt-0.5">
                      Standardized inspection procedure for every item in the Anytime Fitness #3007 checklist. Built directly from the Coverall Quality Assurance Rating Guidelines, incorporating the 9 / 7 / 5 scoring criteria and 24-hour correction mandates.
                    </p>
                  </div>
                </div>

                {/* Core FBO Principles Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold text-emerald-300">Grade 9: Meets Standards</h4>
                    </div>
                    <p className="text-[11px] text-emerald-200/90 leading-snug">
                      Facility cleanliness meets Coverall specifications. Surfaces sanitized, streak-free, dust-free under accessories, and odors eliminated.
                    </p>
                  </div>

                  <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-bold text-amber-300">Grade 7: Needs Improvement</h4>
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-snug">
                      Minor flaw detected (light dust, faint streak). If customer mentions an issue, mark 7 even if you disagree. Note quietly without showing customer defects.
                    </p>
                  </div>

                  <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-rose-400" />
                      <h4 className="text-xs font-bold text-rose-300">Grade 5: Below Standards</h4>
                    </div>
                    <p className="text-[11px] text-rose-200/90 leading-snug">
                      Unacceptable service or sanitation failure. <strong className="text-rose-200">Mandatory Rule:</strong> Must be re-cleaned and fully corrected within 24 hours.
                    </p>
                  </div>
                </div>

                {/* Important FBO Rules Pill Banner */}
                <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span><strong>Uniform & ID:</strong> Neat attire with Coverall photo badge.</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span><strong>Vary Timing:</strong> Inspect on different days of the week & times of month.</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5 text-cyan-400" />
                    <span><strong>Logbook & MSDS:</strong> Verify calendar is signed and MSDS sheets are current.</span>
                  </div>
                </div>
              </div>

              {/* Three Core Checkpoint Reference Guides (Restrooms, Floors, Detail Cleaning) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-purple-400" />
                  <span>Coverall Foundation Steps For Reviewing & Grading Quality</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Restrooms */}
                  <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 uppercase">Restrooms (9 Steps)</span>
                      <span className="text-[10px] text-slate-400">Restroom Standard</span>
                    </div>
                    <ul className="text-[11px] text-slate-300 space-y-1.5 list-decimal list-inside leading-snug">
                      <li>Check that NO foul odors are present.</li>
                      <li>Check corners of floors & behind toilets for dirt/hair.</li>
                      <li>Check inside/outside of toilets & urinal bowl faces.</li>
                      <li>Inspect top edges of all stall partitions.</li>
                      <li>Check mirrors & dispensers for sparkling finish.</li>
                      <li>Check sink areas for soil & soap build-up.</li>
                      <li>Spot clean walls around urinals, dispensers & trash.</li>
                      <li>Check toilet paper, towels & soap dispensers are full.</li>
                      <li>Check chrome & stainless for hard water scale.</li>
                    </ul>
                  </div>

                  {/* Floors */}
                  <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-300 uppercase">Floors (9 Steps)</span>
                      <span className="text-[10px] text-slate-400">Hard & Carpet Floors</span>
                    </div>
                    <ul className="text-[11px] text-slate-300 space-y-1.5 list-decimal list-inside leading-snug">
                      <li>Check general appearance for loose debris & soil.</li>
                      <li>Check tiling for dullness, streaks or dirty grout.</li>
                      <li>Check transitions, edges & trim strips.</li>
                      <li>Check baseboards & furniture for mop splash marks.</li>
                      <li>Verify hard floors are NOT sticky.</li>
                      <li>Check corners & close doors to check behind.</li>
                      <li>Check under desks for cables & dust bunnies.</li>
                      <li>Identify worn carpet spots for Special Services.</li>
                      <li>Check vacuuming did not kick dust onto chair legs.</li>
                    </ul>
                  </div>

                  {/* Detail Cleaning */}
                  <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300 uppercase">Detail Cleaning (12 Steps)</span>
                      <span className="text-[10px] text-slate-400">Furniture & Glass</span>
                    </div>
                    <ul className="text-[11px] text-slate-300 space-y-1.5 list-decimal list-inside leading-snug">
                      <li>Check reception & front entrance foyer.</li>
                      <li>Check for smudges or streaks on glass doors.</li>
                      <li>Check desk tops & dust underneath small items.</li>
                      <li>Check telephones - headsets, mouthpieces & cradles.</li>
                      <li>Check garbage cans, fresh liners & floor area.</li>
                      <li>Check walls & doorframes for trash splash spots.</li>
                      <li>Check window sills & blinds for dead bugs/dust.</li>
                      <li>Check under lobby chairs & rungs for dust.</li>
                      <li>Check tops of picture frames & motivational signs.</li>
                      <li>Look in all room corners for cobwebs.</li>
                      <li>Check high dusting up to 6ft & behind screens.</li>
                      <li>Check light switches, door handles & kickplates.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Item-by-Item Guide Directory with Filters & Search */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      <span>Item-by-Item Inspection Method Guide ({filteredQaItems.length} of {allInspectionItems.length} Items)</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Step-by-step walkthrough directions, checkpoints, and grading criteria for each task.
                    </p>
                  </div>

                  {/* Category Filter Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { id: 'all', label: 'All Items' },
                      { id: 'core', label: 'Core Daily' },
                      { id: 'sunday', label: 'Sunday' },
                      { id: 'tuesday', label: 'Tuesday' },
                      { id: 'thursday', label: 'Thursday' },
                      { id: 'monthly', label: 'Monthly' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setQaCategoryFilter(tab.id)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-lg transition ${
                          qaCategoryFilter === tab.id
                            ? 'bg-purple-600 text-white shadow-xs font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Item Cards List */}
                <div className="space-y-3">
                  {filteredQaItems.map((item) => {
                    const isExpanded = qaExpandedItem === item.id;
                    const guide = item.inspectionGuide;

                    return (
                      <div
                        key={item.id}
                        className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-3.5 space-y-3 hover:border-slate-600 transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {item.isMonthly && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700">
                                  Monthly Detail
                                </span>
                              )}
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-slate-700">
                                {item.category.toUpperCase()}
                              </span>
                              {guide && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-800">
                                  {guide.coverallSection}
                                </span>
                              )}
                              <h4 className="text-sm font-bold text-white">{item.name}</h4>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setQaExpandedItem(isExpanded ? null : item.id)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-700/60 transition self-start sm:self-center shrink-0 cursor-pointer"
                          >
                            {isExpanded ? 'Hide Method' : 'View Way to Inspect'}
                          </button>
                        </div>

                        {/* Expandable Guide Body */}
                        {isExpanded && guide && (
                          <div className="pt-3 border-t border-slate-700/60 space-y-3 animate-in fade-in duration-150">
                            {/* Physical Walkthrough Procedure */}
                            <div className="space-y-1">
                              <h5 className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                                <ClipboardList className="w-3.5 h-3.5 text-purple-400" />
                                <span>The Way to Do the Inspection (Physical Walkthrough Procedure)</span>
                              </h5>
                              <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                                {guide.inspectionProcedure}
                              </p>
                            </div>

                            {/* Inspection Checkpoints */}
                            <div className="space-y-1.5">
                              <h5 className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Inspection Checkpoints (From Coverall Guidelines)</span>
                              </h5>
                              <ul className="grid grid-cols-1 gap-1.5 text-xs text-slate-300">
                                {guide.inspectionSteps.map((step, sIdx) => (
                                  <li
                                    key={sIdx}
                                    className="flex items-start gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800"
                                  >
                                    <span className="shrink-0 w-4 h-4 rounded-full bg-purple-900/80 text-purple-200 font-mono text-[10px] font-bold flex items-center justify-center mt-0.5">
                                      {sIdx + 1}
                                    </span>
                                    <span className="leading-snug">{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Rating Matrix */}
                            <div className="space-y-1.5 pt-1">
                              <h5 className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Coverall 9 / 7 / 5 Grading System Standards</span>
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                                <div className="bg-emerald-950/30 border border-emerald-600/40 rounded-lg p-2.5 space-y-1">
                                  <span className="font-bold text-emerald-300 text-[11px] flex items-center gap-1">
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    Grade 9: Meets Standards
                                  </span>
                                  <p className="text-[11px] text-emerald-200/90 leading-snug">
                                    {guide.passStandard}
                                  </p>
                                </div>

                                <div className="bg-amber-950/30 border border-amber-600/40 rounded-lg p-2.5 space-y-1">
                                  <span className="font-bold text-amber-300 text-[11px] flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                                    Grade 7: Needs Improvement
                                  </span>
                                  <p className="text-[11px] text-amber-200/90 leading-snug">
                                    {guide.needsImprovementStandard}
                                  </p>
                                </div>

                                <div className="bg-rose-950/30 border border-rose-600/40 rounded-lg p-2.5 space-y-1">
                                  <span className="font-bold text-rose-300 text-[11px] flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3 text-rose-400" />
                                    Grade 5: Below Standards
                                  </span>
                                  <p className="text-[11px] text-rose-200/90 leading-snug">
                                    {guide.belowStandard}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Pro Tip */}
                            {guide.fboProTip && (
                              <div className="flex items-start gap-2 bg-amber-950/30 border border-amber-600/40 p-2.5 rounded-lg text-xs text-amber-200">
                                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold text-amber-300 mr-1.5">FBO Inspection Rule:</span>
                                  <span>{guide.fboProTip}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

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
          {activeTab === 'calendar' && (() => {
            const CONTRACT_MONTHS = [
              { year: 2026, month: 4, label: 'May 2026 (Contract Print: May 20, 2026)' },
              { year: 2026, month: 5, label: 'June 2026' },
              { year: 2026, month: 6, label: 'July 2026' },
              { year: 2026, month: 7, label: 'August 2026' },
              { year: 2026, month: 8, label: 'September 2026 (Contract Start)' },
              { year: 2026, month: 9, label: 'October 2026' },
              { year: 2026, month: 10, label: 'November 2026' },
              { year: 2026, month: 11, label: 'December 2026' },
              { year: 2027, month: 0, label: 'January 2027' },
              { year: 2027, month: 1, label: 'February 2027' },
              { year: 2027, month: 2, label: 'March 2027' },
              { year: 2027, month: 3, label: 'April 2027' },
              { year: 2027, month: 4, label: 'May 2027 (Annual Renewal)' },
            ];

            const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
            const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay(); // 0 = Sun
            const contractVisitsData = getMonthlyContractVisits(calYear, calMonth);
            const monthlyVisitsTotal = contractVisitsData.targetVisits;
            const monthName = new Date(calYear, calMonth, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

            const handlePrevMonth = () => {
              if (calMonth === 0) {
                setCalYear((prev) => prev - 1);
                setCalMonth(11);
              } else {
                setCalMonth((prev) => prev - 1);
              }
            };

            const handleNextMonth = () => {
              if (calMonth === 11) {
                setCalYear((prev) => prev + 1);
                setCalMonth(0);
              } else {
                setCalMonth((prev) => prev + 1);
              }
            };

            const handleCurrentMonth = () => {
              const now = new Date();
              setCalYear(now.getFullYear());
              setCalMonth(now.getMonth());
            };

            // Compute calendar days
            let scheduledCounter = 0;
            const calendarDays = [];
            for (let i = 0; i < firstDayOfWeek; i++) {
              calendarDays.push(null);
            }
            for (let d = 1; d <= daysInMonth; d++) {
              const dateObj = new Date(calYear, calMonth, d);
              const dayOfWeek = dateObj.getDay();
              const isScheduled = dayOfWeek === 0 || dayOfWeek === 2 || dayOfWeek === 4; // Sun, Tue, Thu
              let visitNumber = 0;
              if (isScheduled) {
                scheduledCounter++;
                visitNumber = scheduledCounter;
              }

              const occurrence = getWeekdayOccurrenceInMonth(dateObj);
              const isFirstTuesday = dayOfWeek === 2 && occurrence === 1;
              const isSecondSunday = dayOfWeek === 0 && occurrence === 2;
              const isSecondTuesday = dayOfWeek === 2 && occurrence === 2;
              const isThirdTuesday = dayOfWeek === 2 && occurrence === 3;
              const isFourthSunday = dayOfWeek === 0 && occurrence === 4;
              const isSecondThursday = dayOfWeek === 4 && occurrence === 2;
              const isThirdThursday = dayOfWeek === 4 && occurrence === 3;

              const isSelectedDate = Boolean(
                inspectedDate &&
                dateObj.getFullYear() === inspectedDate.getFullYear() &&
                dateObj.getMonth() === inspectedDate.getMonth() &&
                dateObj.getDate() === inspectedDate.getDate()
              );

              const isToday =
                dateObj.getFullYear() === new Date().getFullYear() &&
                dateObj.getMonth() === new Date().getMonth() &&
                dateObj.getDate() === new Date().getDate();

              calendarDays.push({
                day: d,
                date: dateObj,
                dayOfWeek,
                isScheduled,
                visitNumber,
                occurrence,
                isFirstTuesday,
                isSecondSunday,
                isSecondTuesday,
                isThirdTuesday,
                isFourthSunday,
                isSecondThursday,
                isThirdThursday,
                isSelectedDate,
                isToday,
              });
            }

            return (
              <div className="space-y-5">
                {/* Facility & Contract Terms Header */}
                <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 p-4 sm:p-5 rounded-2xl border border-purple-800/50 shadow-lg space-y-3">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-900 border border-purple-500/60 text-purple-200 text-xs font-bold uppercase tracking-wider">
                          Official Source Agreement Calendar
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-semibold">
                          156 Annual Contract Visits
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs">
                          Printed: {doc.printingDate}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white mt-1.5 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-purple-400" />
                        {doc.customerName} • {doc.customerAddress}
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Cadence: <strong className="text-purple-200">3x / Week (Tuesday, Thursday, Sunday after 11:00 PM)</strong> • Account #{doc.accountNumber}
                      </p>
                    </div>

                    {/* Month Picker Controls with Prev/Next Navigation */}
                    <div className="flex flex-wrap items-center gap-2 bg-slate-950/90 p-2 rounded-xl border border-purple-800/60 shadow-inner">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-purple-900/60 text-slate-300 hover:text-white border border-slate-700/70 hover:border-purple-500/50 transition"
                          title="Previous Month"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <select
                          id="calendar-month-select"
                          value={`${calYear}-${calMonth}`}
                          onChange={(e) => {
                            const [y, m] = e.target.value.split('-').map(Number);
                            setCalYear(y);
                            setCalMonth(m);
                          }}
                          className="bg-slate-900 text-purple-200 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-purple-700/60 focus:outline-none focus:ring-1 focus:ring-purple-400 cursor-pointer"
                        >
                          {CONTRACT_MONTHS.map((item) => (
                            <option key={`${item.year}-${item.month}`} value={`${item.year}-${item.month}`}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-purple-900/60 text-slate-300 hover:text-white border border-slate-700/70 hover:border-purple-500/50 transition"
                          title="Next Month"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleCurrentMonth}
                        className="flex items-center gap-1 text-[11px] font-semibold text-purple-300 hover:text-white px-2 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 border border-purple-700/50 transition"
                        title="Jump to Today's Month"
                      >
                        <RotateCcw className="w-3 h-3 text-purple-400" />
                        <span>Today</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-purple-900/40 text-xs">
                    <div className="flex items-center gap-2 text-slate-200">
                      <span className="font-semibold text-white">{monthName}:</span>
                      <span className="bg-purple-900/50 px-2.5 py-0.5 rounded border border-purple-700/60 font-bold text-purple-200">
                        {monthlyVisitsTotal} Scheduled Contract Visits
                      </span>
                      <span className="text-slate-400 hidden sm:inline">• Click any calendar day below to instantly load its walkthrough</span>
                    </div>
                    <div className="text-[11px] text-purple-300">
                      Weekly Schedule: Tuesday, Thursday, Sunday after 11:00 PM
                    </div>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                  {/* Day headers */}
                  <div className="grid grid-cols-7 bg-slate-950 border-b border-slate-800 text-center py-2 text-[11px] font-bold text-slate-400">
                    <div className="text-purple-300">SUN (Service)</div>
                    <div>MON</div>
                    <div className="text-purple-300">TUE (Service)</div>
                    <div>WED</div>
                    <div className="text-purple-300">THU (Service)</div>
                    <div>FRI</div>
                    <div>SAT</div>
                  </div>

                  {/* Calendar cells */}
                  <div className="grid grid-cols-7 gap-1.5 p-2 sm:p-3 bg-slate-950/40">
                    {calendarDays.map((cell, idx) => {
                      if (!cell) {
                        return <div key={`empty-${idx}`} className="min-h-[100px] rounded-xl bg-slate-900/20 border border-slate-800/30" />;
                      }

                      const isServiceDay = cell.isScheduled;

                      return (
                        <div
                          key={`day-${cell.day}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            if (onSelectDateAndLoadWalkthrough) {
                              onSelectDateAndLoadWalkthrough(cell.date);
                              onClose();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              if (onSelectDateAndLoadWalkthrough) {
                                onSelectDateAndLoadWalkthrough(cell.date);
                                onClose();
                              }
                            }
                          }}
                          className={`min-h-[110px] sm:min-h-[120px] rounded-xl p-2 border transition-all flex flex-col justify-between cursor-pointer group focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                            cell.isSelectedDate
                              ? 'bg-purple-900/60 border-purple-400 ring-2 ring-purple-400/80 shadow-lg shadow-purple-950/80'
                              : isServiceDay
                              ? 'bg-gradient-to-b from-purple-950/40 to-slate-900 border-purple-700/60 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-950/50 hover:from-purple-900/50'
                              : 'bg-slate-900/30 border-slate-800/60 hover:border-slate-700 text-slate-500 hover:bg-slate-850/40'
                          }`}
                          title={`Click to load walkthrough for ${cell.date.toLocaleDateString()}`}
                        >
                          {/* Cell Header */}
                          <div>
                            <div className="flex items-center justify-between gap-1 flex-wrap">
                              <div className="flex items-center gap-1">
                                <span
                                  className={`text-xs font-black rounded-md px-1.5 py-0.5 ${
                                    cell.isSelectedDate
                                      ? 'bg-purple-600 text-white font-extrabold shadow-sm'
                                      : isServiceDay
                                      ? 'bg-purple-900/90 text-purple-100 border border-purple-600/60'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {cell.day}
                                </span>
                                {cell.isSelectedDate && (
                                  <span className="text-[8.5px] font-bold uppercase tracking-wider text-purple-200 bg-purple-950 px-1 py-0.2 rounded border border-purple-500/80">
                                    Active
                                  </span>
                                )}
                                {cell.isToday && !cell.isSelectedDate && (
                                  <span className="text-[8.5px] font-bold text-amber-300 bg-amber-950/90 px-1 py-0.2 rounded border border-amber-600/70">
                                    Today
                                  </span>
                                )}
                              </div>

                              {isServiceDay ? (
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800/60">
                                  #{cell.visitNumber}/{monthlyVisitsTotal}
                                </span>
                              ) : (
                                <span className="text-[9px] text-slate-600 font-medium">Off-Day</span>
                              )}
                            </div>

                            {/* Service Badges & Monthly Rotations */}
                            <div className="mt-1.5 space-y-1">
                              {isServiceDay && (
                                <div className="text-[10px] font-semibold text-purple-300 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5 text-purple-400" />
                                  <span>11:00 PM</span>
                                </div>
                              )}

                              {cell.isFirstTuesday && (
                                <div className="p-1 rounded bg-amber-950/90 border border-amber-500/70 text-amber-200 text-[10px] font-extrabold leading-tight shadow-sm">
                                  <div className="flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                                    <span>1st Tue Mandated:</span>
                                  </div>
                                  <span className="text-[9.5px] font-semibold text-white block mt-0.5">
                                    Clean partition glass
                                  </span>
                                </div>
                              )}

                              {cell.isSecondSunday && (
                                <div className="p-1 rounded bg-purple-950/80 border border-purple-600/60 text-purple-200 text-[9px] font-bold">
                                  2nd Sun: Partition Glass Detail
                                </div>
                              )}

                              {cell.isSecondTuesday && (
                                <div className="p-1 rounded bg-purple-950/80 border border-purple-600/60 text-purple-200 text-[9px] font-bold">
                                  2nd Tue: Fixtures & Vents (6-10 ft)
                                </div>
                              )}

                              {cell.isThirdTuesday && (
                                <div className="p-1 rounded bg-purple-950/80 border border-purple-600/60 text-purple-200 text-[9px] font-bold">
                                  3rd Tue: Blinds & Glass Doors
                                </div>
                              )}

                              {cell.isSecondThursday && (
                                <div className="p-1 rounded bg-purple-950/80 border border-purple-600/60 text-purple-200 text-[9px] font-bold">
                                  2nd Thu: Fabric & Leather Furniture
                                </div>
                              )}

                              {cell.isThirdThursday && (
                                <div className="p-1 rounded bg-purple-950/80 border border-purple-600/60 text-purple-200 text-[9px] font-bold">
                                  3rd Thu: Detail Edge Vacuuming
                                </div>
                              )}

                              {cell.isFourthSunday && (
                                <div className="p-1 rounded bg-indigo-950/90 border border-indigo-400/80 text-indigo-200 text-[10px] font-extrabold leading-tight shadow-sm">
                                  <div className="flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-indigo-300 shrink-0" />
                                    <span>4th Sun Mandated:</span>
                                  </div>
                                  <span className="text-[9.5px] font-semibold text-white block mt-0.5">
                                    Inside refrigerator deep clean
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Hover / Click Prompt */}
                          <div className="mt-1 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[9px] text-slate-400 group-hover:text-purple-300">
                            <span>{cell.isSelectedDate ? 'Active Day' : isServiceDay ? 'Load Walkthrough' : 'Load Shift'}</span>
                            <ArrowRight className="w-2.5 h-2.5 transition transform group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mandated Monthly Rotation Protocols (Exact Contract Alignment) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 1st Tuesday Mandate */}
                  <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/50 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-900 border border-amber-400 text-amber-200 text-[11px] font-black uppercase">
                        1st Tuesday Mandate
                      </span>
                      <h4 className="text-sm font-bold text-white">Clean Partition Glass</h4>
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong>Contract Requirement:</strong> Mandates "Clean partition glass" on the 1st Tuesday of every month. Thoroughly clean all interior glass partition walls, conference dividers, and glass sidelites to streak-free clarity using hospital-grade glass cleaner.
                    </p>
                    <div className="text-[11px] text-amber-300 bg-amber-950/80 p-2 rounded-lg border border-amber-800/60">
                      ✓ Automatically activated when walkthrough date is set to the 1st Tuesday of any month.
                    </div>
                  </div>

                  {/* 4th Sunday Mandate */}
                  <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-400/50 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-900 border border-indigo-400 text-indigo-200 text-[11px] font-black uppercase">
                        4th Sunday Mandate
                      </span>
                      <h4 className="text-sm font-bold text-white">Inside Refrigerator Deep Clean</h4>
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong>Contract Requirement:</strong> Mandates "Inside Refrigerator Deep Clean" on the 4th Sunday of every month. Empty interior shelves, crisper bins, door gaskets, and sanitize with hospital-grade disinfectant.
                    </p>
                    <div className="text-[11px] text-indigo-300 bg-indigo-950/80 p-2 rounded-lg border border-indigo-800/60">
                      ✓ Automatically activated when walkthrough date is set to the 4th Sunday of any month.
                    </div>
                  </div>
                </div>

                {/* 12-Month Rotation Matrix Table */}
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 p-4">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>Summary Table: All Monthly Services & Exact Cadence</span>
                    <span className="text-[11px] font-semibold text-purple-300 normal-case">156 Annual Visits Total</span>
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-900 text-slate-300 uppercase text-[10px] font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Service Name</th>
                          <th className="py-2.5 px-3">Scheduled Timing</th>
                          <th className="py-2.5 px-3">Cadence Day</th>
                          <th className="py-2.5 px-3">Cleaning Protocol</th>
                          <th className="py-2.5 px-3">Contract Ref</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        <tr className="bg-amber-950/20">
                          <td className="py-2.5 px-3 font-bold text-amber-300">Clean Partition Glass</td>
                          <td className="py-2.5 px-3 font-semibold text-white">1st Tuesday of Month</td>
                          <td className="py-2.5 px-3 text-purple-300">Tuesday after 11:00 PM</td>
                          <td className="py-2.5 px-3 text-slate-300">Clean partition glass, conference dividers & sidelites (streak-free squeegee)</td>
                          <td className="py-2.5 px-3 text-slate-400">Pg 5, 7</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-purple-300">Partition Glass Detail</td>
                          <td className="py-2.5 px-3 font-semibold text-white">2nd Sunday of Month</td>
                          <td className="py-2.5 px-3 text-purple-300">Sunday after 11:00 PM</td>
                          <td className="py-2.5 px-3 text-slate-300">Monthly edge-to-edge streak-free squeegee detail on all gym partition glass panes</td>
                          <td className="py-2.5 px-3 text-slate-400">Pg 5, 7</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-purple-300">Dust Light Fixtures & Ceiling Vents</td>
                          <td className="py-2.5 px-3">2nd Tuesday of Month</td>
                          <td className="py-2.5 px-3 text-purple-300">Tuesday after 11:00 PM</td>
                          <td className="py-2.5 px-3 text-slate-300">Extension pole microfiber duster on high fixtures & return vents (6-10 ft)</td>
                          <td className="py-2.5 px-3 text-slate-400">Pg 4, 8</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-purple-300">Dust Blinds & Entrance Glass Doors</td>
                          <td className="py-2.5 px-3">3rd Tuesday of Month</td>
                          <td className="py-2.5 px-3 text-purple-300">Tuesday after 11:00 PM</td>
                          <td className="py-2.5 px-3 text-slate-300">Dust window horizontal blinds + clean entrance exterior/interior glass & polish frame</td>
                          <td className="py-2.5 px-3 text-slate-400">Pg 3, 7</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-purple-300">Detail Edge Vacuuming</td>
                          <td className="py-2.5 px-3">3rd Thursday of Month</td>
                          <td className="py-2.5 px-3 text-purple-300">Thursday after 11:00 PM</td>
                          <td className="py-2.5 px-3 text-slate-300">Crevice tool edge vacuuming around all baseboard perimeters, weight racks & corners</td>
                          <td className="py-2.5 px-3 text-slate-400">Pg 3, 7</td>
                        </tr>
                        <tr className="bg-indigo-950/20">
                          <td className="py-2.5 px-3 font-bold text-indigo-300">Inside Refrigerator Deep Clean</td>
                          <td className="py-2.5 px-3 font-semibold text-white">4th Sunday of Month</td>
                          <td className="py-2.5 px-3 text-purple-300">Sunday after 11:00 PM</td>
                          <td className="py-2.5 px-3 text-slate-300">Empty shelves, sanitize interior walls, bins & racks with hospital disinfectant</td>
                          <td className="py-2.5 px-3 text-slate-400">Pg 4, 7</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

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
                      <dd className="font-semibold text-slate-200 mt-0.5">{doc.customerName}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400 font-medium">Account Number</dt>
                      <dd className="font-semibold text-emerald-400 mt-0.5">#{doc.accountNumber}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-slate-400 font-medium">Facility Address</dt>
                      <dd className="font-semibold text-slate-200 mt-0.5">
                        {doc.customerAddress}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-400 font-medium">Weekly Frequency</dt>
                      <dd className="font-semibold text-purple-300 mt-0.5">{doc.facilityDetails.frequency}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400 font-medium">Annual Visits</dt>
                      <dd className="font-semibold text-emerald-400 mt-0.5">{doc.totalAnnualVisits} Visits / Year</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400 font-medium">Shift Time</dt>
                      <dd className="font-semibold text-purple-300 mt-0.5">{doc.facilityDetails.cleaningHours}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400 font-medium">Monthly Billing</dt>
                      <dd className="font-semibold text-emerald-400 mt-0.5">{doc.facilityDetails.billingMonthly}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400 font-medium">Printing Date</dt>
                      <dd className="font-semibold text-purple-300 mt-0.5">{doc.printingDate}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400 font-medium">Contract Start Date</dt>
                      <dd className="font-semibold text-slate-200 mt-0.5">{doc.facilityDetails.startDate}</dd>
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
