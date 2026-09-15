import React, { useState, useEffect, useMemo } from 'react';
import {
  ActiveTab,
  DayOfWeek,
  InspectionRecord,
  ItemEvaluation,
  FACILITY_INFO,
  InspectionItem,
  InspectionPhoto,
} from './types/inspection';
import {
  CORE_SERVICES,
  SUNDAY_SPECIFIC,
  SUNDAY_MONTHLY,
  TUESDAY_SPECIFIC,
  TUESDAY_MONTHLY,
  THURSDAY_SPECIFIC,
  THURSDAY_MONTHLY,
} from './data/checklistItems';
import { getTodayInspectionDay, formatInspectionTimestamp } from './utils/dayDetector';
import { getMonthlyTasksDueForDate, getDueInspectionForDate } from './utils/scheduleEngine';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { ComplianceScoreCard } from './components/ComplianceScoreCard';
import { ChecklistSection } from './components/ChecklistSection';
import { SupervisorSignaturePad } from './components/SupervisorSignaturePad';
import { SubmissionSection } from './components/SubmissionSection';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ScheduleRadarBanner } from './components/ScheduleRadarBanner';
import { SourceDocumentModal } from './components/SourceDocumentModal';
import { PeriodicServicesModal } from './components/PeriodicServicesModal';
import { MonthlySummaryModal } from './components/MonthlySummaryModal';
import { VoiceAssistantBar } from './components/VoiceAssistantBar';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useVoiceWalkthrough } from './hooks/useVoiceWalkthrough';

const STORAGE_KEY = 'af_inspection_audit_state_v1';

export default function App() {
  const isOnline = useOnlineStatus();

  // Modals for Source Document Reference, Annual / Periodic Services, & Monthly QA Summary
  const [isSourceDocOpen, setIsSourceDocOpen] = useState<boolean>(false);
  const [isPeriodicModalOpen, setIsPeriodicModalOpen] = useState<boolean>(false);
  const [isMonthlySummaryOpen, setIsMonthlySummaryOpen] = useState<boolean>(false);

  // 1. Detect Day of week
  const todayInfo = useMemo(() => getTodayInspectionDay(), []);
  const [activeTab, setActiveTab] = useState<ActiveTab>(todayInfo.recommendedTab);

  // Timestamps
  const [timestamp, setTimestamp] = useState(() => formatInspectionTimestamp());

  useEffect(() => {
    // Refresh time on interval
    const interval = setInterval(() => {
      setTimestamp(formatInspectionTimestamp());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // 2. State for Checklist evaluations & monthly toggles
  const [evaluations, setEvaluations] = useState<Record<string, ItemEvaluation>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.evaluations) return parsed.evaluations;
      }
    } catch (e) {
      console.error('Failed to load stored state', e);
    }
    // Default: initialize all core and specific items to 'pass' for rapid, seamless audits
    const initial: Record<string, ItemEvaluation> = {};
    const allKnown = [
      ...CORE_SERVICES,
      ...SUNDAY_SPECIFIC,
      ...TUESDAY_SPECIFIC,
      ...THURSDAY_SPECIFIC,
    ];
    allKnown.forEach((item) => {
      initial[item.id] = { id: item.id, status: 'pass' };
    });
    return initial;
  });

  const [monthlyToggles, setMonthlyToggles] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.monthlyToggles) return parsed.monthlyToggles;
      }
    } catch (e) {}
    return {
      'sun-monthly-refrigerator': false,
      'sun-monthly-partition-detail': false,
      'tue-monthly-blinds-entrance': false,
      'tue-monthly-vents-fixtures': false,
      'thu-monthly-detail-edge-vacuum': false,
      'thu-monthly-fabric-furniture': false,
    };
  });

  // Sign-off state
  const [inspectorName, setInspectorName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).inspectorName || 'Ronald Ephard';
    } catch (e) {}
    return 'Ronald Ephard';
  });

  const [supervisorName, setSupervisorName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).supervisorName || 'Jennifer Johnson';
    } catch (e) {}
    return 'Jennifer Johnson';
  });

  const [overallNotes, setOverallNotes] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).overallNotes || '';
    } catch (e) {}
    return 'Routine after-hours disinfection completed. Gym floor mopped, restrooms sanitized, and water dispensers polished.';
  });

  const [signatureDataUrl, setSignatureDataUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).signatureDataUrl || '';
    } catch (e) {}
    return '';
  });

  // State to toggle optional ad-hoc / unscheduled monthly deep clean tasks
  const [showAdHocMonthly, setShowAdHocMonthly] = useState<boolean>(false);

  // Save to localStorage whenever critical state updates
  useEffect(() => {
    try {
      const stateToSave = {
        evaluations,
        monthlyToggles,
        inspectorName,
        supervisorName,
        overallNotes,
        signatureDataUrl,
        activeTab,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Could not save state to localStorage', e);
    }
  }, [
    evaluations,
    monthlyToggles,
    inspectorName,
    supervisorName,
    overallNotes,
    signatureDataUrl,
    activeTab,
  ]);

  // Update item status
  const handleUpdateStatus = (itemId: string, status: 'pass' | 'fail' | 'na') => {
    setEvaluations((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || { id: itemId }),
        status,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const handleUpdateNotes = (itemId: string, notes: string) => {
    setEvaluations((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || { id: itemId, status: 'pass' }),
        notes,
      },
    }));
  };

  const handleAttachPhoto = (itemId: string, photoUrl: string | undefined) => {
    setEvaluations((prev) => {
      const existing = prev[itemId] || { id: itemId, status: 'pass' };
      return {
        ...prev,
        [itemId]: {
          ...existing,
          photoUrl,
          photos: photoUrl
            ? [{ id: `photo-${Date.now()}`, dataUrl: photoUrl, timestamp: 'Audit Snapshot' }]
            : [],
        },
      };
    });
  };

  const handleAddPhoto = (itemId: string, photo: InspectionPhoto) => {
    setEvaluations((prev) => {
      const existing = prev[itemId] || { id: itemId, status: 'pass' };
      const currentPhotos =
        existing.photos && existing.photos.length > 0
          ? existing.photos
          : existing.photoUrl
          ? [{ id: `photo-legacy-${itemId}`, dataUrl: existing.photoUrl, timestamp: 'Audit Snapshot' }]
          : [];

      const updatedPhotos = [...currentPhotos, photo];
      return {
        ...prev,
        [itemId]: {
          ...existing,
          photos: updatedPhotos,
          photoUrl: updatedPhotos[0]?.dataUrl || undefined,
        },
      };
    });
  };

  const handleRemovePhoto = (itemId: string, photoId: string) => {
    setEvaluations((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      const currentPhotos =
        existing.photos && existing.photos.length > 0
          ? existing.photos
          : existing.photoUrl
          ? [{ id: `photo-legacy-${itemId}`, dataUrl: existing.photoUrl, timestamp: 'Audit Snapshot' }]
          : [];

      const updatedPhotos = currentPhotos.filter((p) => p.id !== photoId);
      return {
        ...prev,
        [itemId]: {
          ...existing,
          photos: updatedPhotos,
          photoUrl: updatedPhotos[0]?.dataUrl || undefined,
        },
      };
    });
  };

  const handleToggleMonthly = (toggleKey: string) => {
    setMonthlyToggles((prev) => {
      const nextVal = !prev[toggleKey];
      // When enabled, automatically default its evaluation to pass
      if (nextVal && !evaluations[toggleKey]) {
        setEvaluations((ePrev) => ({
          ...ePrev,
          [toggleKey]: { id: toggleKey, status: 'pass' },
        }));
      }
      return {
        ...prev,
        [toggleKey]: nextVal,
      };
    });
  };

  // Calculate strictly what is due for the active shift and date!
  const dueInspection = useMemo(() => {
    const shiftOverride =
      activeTab === 'sunday' || activeTab === 'tuesday' || activeTab === 'thursday'
        ? activeTab
        : null;
    return getDueInspectionForDate(new Date(), shiftOverride);
  }, [activeTab]);

  // Helper to determine which items belong to a given tab strictly for that day/shift
  const getItemsForTab = (tab: ActiveTab): InspectionItem[] => {
    const shift: DayOfWeek =
      tab === 'sunday' || tab === 'tuesday' || tab === 'thursday'
        ? tab
        : 'tuesday';

    const dueInfo = getDueInspectionForDate(new Date(), shift);
    const items = [...dueInfo.allDueItems];

    // If an inspector manually opted into an unscheduled ad-hoc monthly task, include it
    if (shift === 'sunday') {
      if (monthlyToggles['sun-monthly-refrigerator'] && !items.some((i) => i.id === 'sun-monthly-refrigerator')) {
        items.push(SUNDAY_MONTHLY[0]);
      }
      if (monthlyToggles['sun-monthly-partition-detail'] && !items.some((i) => i.id === 'sun-monthly-partition-detail')) {
        items.push(SUNDAY_MONTHLY[1]);
      }
    } else if (shift === 'tuesday') {
      if (monthlyToggles['tue-monthly-blinds-entrance'] && !items.some((i) => i.id === 'tue-monthly-blinds-entrance')) {
        items.push(TUESDAY_MONTHLY[0]);
      }
      if (monthlyToggles['tue-monthly-vents-fixtures'] && !items.some((i) => i.id === 'tue-monthly-vents-fixtures')) {
        items.push(TUESDAY_MONTHLY[1]);
      }
    } else if (shift === 'thursday') {
      if (monthlyToggles['thu-monthly-detail-edge-vacuum'] && !items.some((i) => i.id === 'thu-monthly-detail-edge-vacuum')) {
        items.push(THURSDAY_MONTHLY[0]);
      }
      if (monthlyToggles['thu-monthly-fabric-furniture'] && !items.some((i) => i.id === 'thu-monthly-fabric-furniture')) {
        items.push(THURSDAY_MONTHLY[1]);
      }
    }

    return items;
  };

  // Active items strictly for what is due that day!
  const activeItems = useMemo(() => getItemsForTab(activeTab), [activeTab, monthlyToggles]);

  // Scoring calculation strictly for the active tab's items
  const activeScore = useMemo(() => {
    let passedCount = 0;
    let failedCount = 0;
    let naCount = 0;

    activeItems.forEach((item) => {
      const evalData = evaluations[item.id];
      const status = evalData?.status || 'pending';
      if (status === 'pass') passedCount++;
      else if (status === 'fail') failedCount++;
      else if (status === 'na') naCount++;
    });

    const totalEvaluated = passedCount + failedCount + naCount;
    const totalScorable = passedCount + failedCount; // N/A is omitted from denominator
    const percentage =
      totalScorable > 0 ? Math.round((passedCount / totalScorable) * 100) : 0;

    return {
      percentage,
      passedCount,
      failedCount,
      naCount,
      totalEvaluated,
      totalScorable,
    };
  }, [activeItems, evaluations]);

  // Stats for the TabBar badges
  const dayStats = useMemo(() => {
    const tabs: ActiveTab[] = ['sunday', 'tuesday', 'thursday'];
    const res: Record<ActiveTab, { total: number; passed: number; score: number }> = {
      sunday: { total: 0, passed: 0, score: 0 },
      tuesday: { total: 0, passed: 0, score: 0 },
      thursday: { total: 0, passed: 0, score: 0 },
      'full-audit': { total: 0, passed: 0, score: 0 },
    };

    tabs.forEach((t) => {
      const items = getItemsForTab(t);
      let passed = 0;
      let failed = 0;
      items.forEach((item) => {
        const s = evaluations[item.id]?.status;
        if (s === 'pass') passed++;
        else if (s === 'fail') failed++;
      });
      const total = passed + failed;
      const score = total > 0 ? Math.round((passed / total) * 100) : 0;
      res[t] = { total: items.length, passed, score };
    });

    return res;
  }, [evaluations, monthlyToggles]);

  // "Pass All" convenience button
  const handlePassAllShiftItems = () => {
    setEvaluations((prev) => {
      const updated = { ...prev };
      activeItems.forEach((item) => {
        updated[item.id] = {
          ...(updated[item.id] || { id: item.id }),
          status: 'pass',
        };
      });
      return updated;
    });
  };

  // Reset audit state
  const handleResetAudit = () => {
    if (window.confirm('Start a fresh inspection session? Current checks will be reset.')) {
      const fresh: Record<string, ItemEvaluation> = {};
      const allKnown = [
        ...CORE_SERVICES,
        ...SUNDAY_SPECIFIC,
        ...TUESDAY_SPECIFIC,
        ...THURSDAY_SPECIFIC,
      ];
      allKnown.forEach((item) => {
        fresh[item.id] = { id: item.id, status: 'pass' };
      });
      setEvaluations(fresh);
      setOverallNotes('Routine after-hours disinfection completed. Gym floor mopped, restrooms sanitized, and water dispensers polished.');
      setSignatureDataUrl('');
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Build the current complete inspection record
  const currentRecord: InspectionRecord = {
    id: `audit-${Date.now()}`,
    facility: FACILITY_INFO,
    inspectionDate: timestamp.formattedDate,
    inspectionTime: timestamp.formattedTime,
    activeDay: activeTab,
    inspectorName,
    supervisorName,
    supervisorSignature: signatureDataUrl,
    signedAt: `${timestamp.formattedDate} at ${timestamp.formattedTime}`,
    items: evaluations,
    monthlyToggles,
    overallNotes,
    completedPeriodicServices: [],
    score: activeScore,
  };

  // Active monthly count for current tab
  const activeMonthlyCount = useMemo(() => {
    if (activeTab === 'sunday') {
      return (monthlyToggles['sun-monthly-refrigerator'] ? 1 : 0) + (monthlyToggles['sun-monthly-partition-detail'] ? 1 : 0);
    }
    if (activeTab === 'tuesday') {
      return (monthlyToggles['tue-monthly-blinds-entrance'] ? 1 : 0) + (monthlyToggles['tue-monthly-vents-fixtures'] ? 1 : 0);
    }
    if (activeTab === 'thursday') {
      return (monthlyToggles['thu-monthly-detail-edge-vacuum'] ? 1 : 0) + (monthlyToggles['thu-monthly-fabric-furniture'] ? 1 : 0);
    }
    return Object.values(monthlyToggles).filter(Boolean).length;
  }, [activeTab, monthlyToggles]);

  // Hands-free Voice Walkthrough Assistant hook
  const voiceState = useVoiceWalkthrough({
    activeItems,
    evaluations,
    onUpdateStatus: handleUpdateStatus,
    onUpdateNotes: handleUpdateNotes,
    onPassAll: handlePassAllShiftItems,
    activeTab,
    onChangeTab: setActiveTab,
    compliancePercentage: activeScore.percentage,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white pb-24">
      {/* Header with facility metadata, PWA install prompt, network indicator, voice toggle */}
      <Header
        currentDayName={todayInfo.dayName}
        formattedDate={timestamp.formattedDate}
        formattedTime={timestamp.formattedTime}
        onResetAudit={handleResetAudit}
        isCompleted={activeScore.percentage >= 85}
        onOpenSourceDoc={() => setIsSourceDocOpen(true)}
        onOpenMonthlySummary={() => setIsMonthlySummaryOpen(true)}
        isVoiceListening={voiceState.isListening}
        onToggleVoice={voiceState.toggleListening}
        isVoiceSupported={voiceState.isSupported}
      />

      {/* Top Shift Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        matchedDay={todayInfo.matchedInspectionDay}
        dayCounts={dayStats}
        currentDayName={todayInfo.dayName}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 space-y-6">
        {/* Off-Schedule Notice if today is not a routine cleaning shift */}
        {!todayInfo.isScheduledDay && (
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400 font-bold text-xs">
                OFF
              </div>
              <div>
                <div className="font-bold text-slate-100">
                  Today is {todayInfo.dayName} (No Routine Shift Scheduled)
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Anytime Fitness #3007 is serviced 3x weekly: Sunday, Tuesday & Thursday at 11:00 PM. Displaying due items for the{' '}
                  <span className="text-purple-300 font-semibold">{dueInspection.shiftDay.toUpperCase()} Shift</span>.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-400">Next Scheduled:</span>
              <span className="text-xs font-bold text-purple-300 bg-purple-950/80 px-2.5 py-1 rounded-md border border-purple-800">
                {dueInspection.nextScheduledShift.dayName} @ {dueInspection.nextScheduledShift.time}
              </span>
            </div>
          </div>
        )}

        {/* Coverall Schedule Radar Banner */}
        <ScheduleRadarBanner
          activeTab={activeTab}
          monthlyToggles={monthlyToggles}
          onToggleMonthly={handleToggleMonthly}
          onOpenSourceDoc={() => setIsSourceDocOpen(true)}
          onOpenPeriodicServices={() => setIsPeriodicModalOpen(true)}
          onOpenMonthlySummary={() => setIsMonthlySummaryOpen(true)}
        />

        {/* Compliance Score Card */}
        <ComplianceScoreCard
          score={activeScore}
          activeTab={activeTab}
          onPassAll={handlePassAllShiftItems}
          monthlyCountActive={activeMonthlyCount}
        />

        {/* Dynamic Checklist Sections: Strictly What Is Due That Day */}
        <div className="space-y-6">
          {/* 1. Daily Core Services (9 items) */}
          <ChecklistSection
            title="Daily Core Services"
            badgeText="Required All Shifts (Due Tonight)"
            subtitle="Entrance foyer detailing, office cleaning, restroom disinfection, gym mirrors, trash removal, and hard floor mopping."
            items={dueInspection.coreItems}
            evaluations={evaluations}
            onUpdateStatus={handleUpdateStatus}
            onUpdateNotes={handleUpdateNotes}
            onAttachPhoto={handleAttachPhoto}
            onAddPhoto={handleAddPhoto}
            onRemovePhoto={handleRemovePhoto}
            activeTab={activeTab}
          />

          {/* 2. Shift Specific Services (Due Tonight) */}
          {dueInspection.shiftSpecificItems.length > 0 && (
            <ChecklistSection
              title={`${dueInspection.shiftDay.charAt(0).toUpperCase() + dueInspection.shiftDay.slice(1)} Specific Services`}
              badgeText={`${dueInspection.shiftDay.charAt(0).toUpperCase() + dueInspection.shiftDay.slice(1)} Shift (Due Tonight)`}
              subtitle={
                dueInspection.shiftDay === 'sunday'
                  ? 'Microwave interior cleaning, partition glass dusting, high-traffic vacuuming.'
                  : dueInspection.shiftDay === 'tuesday'
                  ? 'High/Low dusting (up to 6ft) and surface dusting of fixtures, desks, counters, display units & ledges.'
                  : 'Damp wipe office desks & furniture, sanitize phones, carpet spot vacuuming & desk mats, full floor carpet vacuum, traffic vacuum.'
              }
              items={dueInspection.shiftSpecificItems}
              evaluations={evaluations}
              onUpdateStatus={handleUpdateStatus}
              onUpdateNotes={handleUpdateNotes}
              onAttachPhoto={handleAttachPhoto}
              onAddPhoto={handleAddPhoto}
              onRemovePhoto={handleRemovePhoto}
              activeTab={activeTab}
            />
          )}

          {/* 3. Monthly Deep Clean Section: Only rendered if scheduled for tonight! */}
          {dueInspection.monthlyDueItems.length > 0 ? (
            <ChecklistSection
              title={`Scheduled Monthly Rotation: ${dueInspection.monthlyTaskDue?.name || 'Deep Clean'}`}
              badgeText={`Due Tonight • ${dueInspection.monthlyTaskDue?.occurrenceText || 'Monthly Rotation'}`}
              subtitle={`${dueInspection.monthlyTaskDue?.description || 'Scheduled commercial deep clean service'} (Included in tonight's due audit).`}
              items={dueInspection.monthlyDueItems}
              evaluations={evaluations}
              onUpdateStatus={handleUpdateStatus}
              onUpdateNotes={handleUpdateNotes}
              onAttachPhoto={handleAttachPhoto}
              onAddPhoto={handleAddPhoto}
              onRemovePhoto={handleRemovePhoto}
              activeTab={activeTab}
            />
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>
                  <strong>Monthly Rotation:</strong> No monthly deep clean is scheduled for tonight ({dueInspection.dayName}, Week {Math.ceil(new Date().getDate() / 7)}).
                </span>
              </div>
              <button
                onClick={() => setShowAdHocMonthly(!showAdHocMonthly)}
                className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 shrink-0 underline decoration-purple-500/50"
              >
                {showAdHocMonthly ? 'Hide Extra Tasks' : '+ Log Unscheduled / Ad-Hoc Monthly Deep Clean'}
              </button>
            </div>
          )}

          {/* 4. Optional Ad-Hoc / Unscheduled Monthly Deep Clean (Only shown if inspector opts in) */}
          {showAdHocMonthly && (
            <ChecklistSection
              title={`${dueInspection.shiftDay.charAt(0).toUpperCase() + dueInspection.shiftDay.slice(1)} Ad-Hoc Monthly Deep Clean`}
              badgeText="Optional / Extra"
              subtitle="Select and evaluate any monthly rotation items completed out of normal cycle."
              items={
                dueInspection.shiftDay === 'sunday'
                  ? SUNDAY_MONTHLY
                  : dueInspection.shiftDay === 'tuesday'
                  ? TUESDAY_MONTHLY
                  : THURSDAY_MONTHLY
              }
              evaluations={evaluations}
              onUpdateStatus={handleUpdateStatus}
              onUpdateNotes={handleUpdateNotes}
              onAttachPhoto={handleAttachPhoto}
              onAddPhoto={handleAddPhoto}
              onRemovePhoto={handleRemovePhoto}
              monthlyToggles={monthlyToggles}
              onToggleMonthly={handleToggleMonthly}
              activeTab={activeTab}
            />
          )}
        </div>

        {/* Digital Signature Pad for Supervisor Sign-off */}
        <SupervisorSignaturePad
          inspectorName={inspectorName}
          onChangeInspectorName={setInspectorName}
          supervisorName={supervisorName}
          onChangeSupervisorName={setSupervisorName}
          overallNotes={overallNotes}
          onChangeOverallNotes={setOverallNotes}
          signatureDataUrl={signatureDataUrl}
          onSaveSignature={setSignatureDataUrl}
        />

        {/* Submission & Resend API certified PDF dispatch */}
        <SubmissionSection
          record={currentRecord}
          activeItems={activeItems}
          isOnline={isOnline}
          onOpenMonthlySummary={() => setIsMonthlySummaryOpen(true)}
        />
      </main>

      {/* Original Source Document Reference Modal */}
      <SourceDocumentModal
        isOpen={isSourceDocOpen}
        onClose={() => setIsSourceDocOpen(false)}
        onSelectMonthlyTask={(key) => handleToggleMonthly(key)}
      />

      {/* Annual & Periodic Special Services Manager Modal */}
      <PeriodicServicesModal
        isOpen={isPeriodicModalOpen}
        onClose={() => setIsPeriodicModalOpen(false)}
        onServiceCompleted={(title) => {
          setOverallNotes((prev) => `${prev ? prev + ' ' : ''}[Logged Periodic Service: ${title}]`);
        }}
      />

      {/* Client Monthly QA Summary & Executive Report Modal (Option 2 Strategy) */}
      <MonthlySummaryModal
        isOpen={isMonthlySummaryOpen}
        onClose={() => setIsMonthlySummaryOpen(false)}
      />

      {/* Hands-free Voice Walkthrough Assistant Floating HUD */}
      <VoiceAssistantBar
        voiceState={voiceState}
        activeShiftName={
          activeTab === 'full-audit'
            ? 'Full Facility Audit'
            : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Shift`
        }
      />

      {/* Offline Connectivity Toast */}
      <OfflineIndicator />
    </div>
  );
}
