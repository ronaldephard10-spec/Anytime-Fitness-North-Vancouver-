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
import { getMonthlyTasksDueForDate } from './utils/scheduleEngine';
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
import { useOnlineStatus } from './hooks/useOnlineStatus';

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

  // Helper to determine which items belong to a given tab
  const getItemsForTab = (tab: ActiveTab): InspectionItem[] => {
    if (tab === 'sunday') {
      const base = [...CORE_SERVICES, ...SUNDAY_SPECIFIC];
      if (monthlyToggles['sun-monthly-refrigerator']) {
        base.push(SUNDAY_MONTHLY[0]);
      }
      if (monthlyToggles['sun-monthly-partition-detail']) {
        base.push(SUNDAY_MONTHLY[1]);
      }
      return base;
    }

    if (tab === 'tuesday') {
      const base = [...CORE_SERVICES, ...TUESDAY_SPECIFIC];
      if (monthlyToggles['tue-monthly-blinds-entrance']) {
        base.push(TUESDAY_MONTHLY[0]);
      }
      if (monthlyToggles['tue-monthly-vents-fixtures']) {
        base.push(TUESDAY_MONTHLY[1]);
      }
      return base;
    }

    if (tab === 'thursday') {
      const base = [...CORE_SERVICES, ...THURSDAY_SPECIFIC];
      if (monthlyToggles['thu-monthly-detail-edge-vacuum']) {
        base.push(THURSDAY_MONTHLY[0]);
      }
      if (monthlyToggles['thu-monthly-fabric-furniture']) {
        base.push(THURSDAY_MONTHLY[1]);
      }
      return base;
    }

    // Full Audit Tab
    const full = [
      ...CORE_SERVICES,
      ...SUNDAY_SPECIFIC,
      ...TUESDAY_SPECIFIC,
      ...THURSDAY_SPECIFIC,
    ];
    if (monthlyToggles['sun-monthly-refrigerator']) full.push(SUNDAY_MONTHLY[0]);
    if (monthlyToggles['sun-monthly-partition-detail']) full.push(SUNDAY_MONTHLY[1]);
    if (monthlyToggles['tue-monthly-blinds-entrance']) full.push(TUESDAY_MONTHLY[0]);
    if (monthlyToggles['tue-monthly-vents-fixtures']) full.push(TUESDAY_MONTHLY[1]);
    if (monthlyToggles['thu-monthly-detail-edge-vacuum']) full.push(THURSDAY_MONTHLY[0]);
    if (monthlyToggles['thu-monthly-fabric-furniture']) full.push(THURSDAY_MONTHLY[1]);
    return full;
  };

  // Active items for the currently selected tab
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
    const tabs: ActiveTab[] = ['sunday', 'tuesday', 'thursday', 'full-audit'];
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white pb-16">
      {/* Header with facility metadata, PWA install prompt, network indicator */}
      <Header
        currentDayName={todayInfo.dayName}
        formattedDate={timestamp.formattedDate}
        formattedTime={timestamp.formattedTime}
        onResetAudit={handleResetAudit}
        isCompleted={activeScore.percentage >= 85}
        onOpenSourceDoc={() => setIsSourceDocOpen(true)}
        onOpenMonthlySummary={() => setIsMonthlySummaryOpen(true)}
      />

      {/* Top Tab Bar: [Sunday | Tuesday | Thursday | Full Audit] */}
      <TabBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        matchedDay={todayInfo.matchedInspectionDay}
        dayCounts={dayStats}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 space-y-6">
        {/* Coverall Schedule Radar Banner: tells what monthly/weekly/daily task is due tonight */}
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

        {/* Dynamic Checklist Sections according to Active Tab */}
        <div className="space-y-6">
          {/* 1. "Daily Core Services" - Loads on all days */}
          <ChecklistSection
            title="Daily Core Services"
            badgeText="Required All Days"
            subtitle="Entrance & foyer detailing, office cleaning & organization, restrooms disinfection, gym mirrors, trash removal, and hard floor mopping."
            items={CORE_SERVICES}
            evaluations={evaluations}
            onUpdateStatus={handleUpdateStatus}
            onUpdateNotes={handleUpdateNotes}
            onAttachPhoto={handleAttachPhoto}
            onAddPhoto={handleAddPhoto}
            onRemovePhoto={handleRemovePhoto}
            activeTab={activeTab}
          />

          {/* 2. Sunday Specific Section */}
          {(activeTab === 'sunday' || activeTab === 'full-audit') && (
            <div className="space-y-4">
              <ChecklistSection
                title="Sunday Specific Services"
                badgeText="Sunday Shift"
                subtitle="Microwave interior, partition glass dusting, high-traffic vacuuming."
                items={SUNDAY_SPECIFIC}
                evaluations={evaluations}
                onUpdateStatus={handleUpdateStatus}
                onUpdateNotes={handleUpdateNotes}
                onAttachPhoto={handleAttachPhoto}
                onAddPhoto={handleAddPhoto}
                onRemovePhoto={handleRemovePhoto}
                activeTab={activeTab}
              />

              {/* Sunday Monthly Toggles */}
              <ChecklistSection
                title="Sunday Monthly Deep Clean Toggles"
                badgeText="Monthly Detail"
                subtitle="Toggle on when monthly rotation is due. Adds to active day score calculation."
                items={SUNDAY_MONTHLY}
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
            </div>
          )}

          {/* 3. Tuesday Specific Section */}
          {(activeTab === 'tuesday' || activeTab === 'full-audit') && (
            <div className="space-y-4">
              <ChecklistSection
                title="Tuesday Specific Services"
                badgeText="Tuesday Shift"
                subtitle="High/Low dusting (up to 6ft) and surface dusting of fixtures, desks, counters, display units & ledges."
                items={TUESDAY_SPECIFIC}
                evaluations={evaluations}
                onUpdateStatus={handleUpdateStatus}
                onUpdateNotes={handleUpdateNotes}
                onAttachPhoto={handleAttachPhoto}
                onAddPhoto={handleAddPhoto}
                onRemovePhoto={handleRemovePhoto}
                activeTab={activeTab}
              />

              {/* Tuesday Monthly Toggles */}
              <ChecklistSection
                title="Tuesday Monthly Deep Clean Toggles"
                badgeText="Monthly Detail"
                subtitle="Toggle on when monthly blinds/glass or ceiling vents/fixtures deep cleaning is scheduled."
                items={TUESDAY_MONTHLY}
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
            </div>
          )}

          {/* 4. Thursday Specific Section */}
          {(activeTab === 'thursday' || activeTab === 'full-audit') && (
            <div className="space-y-4">
              <ChecklistSection
                title="Thursday Specific Services"
                badgeText="Thursday Shift"
                subtitle="Damp wipe office desks & furniture, sanitize phones, carpet spot vacuuming & desk mats, full floor carpet vacuum, traffic vacuum."
                items={THURSDAY_SPECIFIC}
                evaluations={evaluations}
                onUpdateStatus={handleUpdateStatus}
                onUpdateNotes={handleUpdateNotes}
                onAttachPhoto={handleAttachPhoto}
                onAddPhoto={handleAddPhoto}
                onRemovePhoto={handleRemovePhoto}
                activeTab={activeTab}
              />

              {/* Thursday Monthly Toggles */}
              <ChecklistSection
                title="Thursday Monthly Deep Clean Toggles"
                badgeText="Monthly Detail"
                subtitle="Toggle on when monthly detail edge vacuuming or fabric furniture vacuuming is scheduled."
                items={THURSDAY_MONTHLY}
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
            </div>
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

      {/* Offline Connectivity Toast */}
      <OfflineIndicator />
    </div>
  );
}
