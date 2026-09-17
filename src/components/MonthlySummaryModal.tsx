import React, { useState, useMemo } from 'react';
import {
  FileText,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  Send,
  Download,
  Eye,
  X,
  RotateCcw,
  Plus,
  Trash2,
  Loader2,
  Mail,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  calculateMonthlyMetrics,
  getCompletedInspections,
  saveCompletedInspection,
  deleteCompletedInspection,
  resetInspectionHistoryToDefault,
  CompletedInspection,
  MonthlyReportMetrics,
} from '../utils/inspectionHistory';
import { generateMonthlySummaryPDF } from '../utils/monthlySummaryPdfGenerator';
import { downloadCompletedInspectionPDF } from '../utils/pdfGenerator';
import { FACILITY_INFO } from '../types/inspection';

interface MonthlySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuditSubmitted?: (result: any) => void;
  onOpenSourceDocCalendar?: () => void;
}

export const MonthlySummaryModal: React.FC<MonthlySummaryModalProps> = ({
  isOpen,
  onClose,
  onAuditSubmitted,
  onOpenSourceDocCalendar,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'audits' | 'dispatch'>('overview');
  const [historyKey, setHistoryKey] = useState<number>(0);

  // Recipient state for monthly summary email
  const [clientEmail, setClientEmail] = useState<string>(() => {
    return localStorage.getItem('afnv_client_monthly_email') || 'jen.johnson@anytimefitness.ca';
  });
  const [ccEmails, setCcEmails] = useState<string>(() => {
    return localStorage.getItem('afnv_client_monthly_cc') || 'ronaldephard10@gmail.com, ronald@marketingdo.net';
  });

  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    mode?: 'live' | 'simulated';
    messageId?: string;
    note?: string;
    error?: string;
  } | null>(null);

  // Calculate metrics based on current inspection store
  const metrics: MonthlyReportMetrics = useMemo(() => {
    return calculateMonthlyMetrics(selectedMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, historyKey]);

  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    try {
      const { doc, filename } = generateMonthlySummaryPDF(metrics, clientEmail, ccEmails);
      doc.save(filename);
    } catch (err: any) {
      console.error('Failed to download Monthly QA PDF:', err);
      alert('Could not download PDF: ' + (err?.message || 'Unknown error'));
    }
  };

  const handlePreviewPDF = () => {
    try {
      const { doc } = generateMonthlySummaryPDF(metrics, clientEmail, ccEmails);
      const blobUrl = doc.output('bloburl');
      window.open(blobUrl, '_blank');
    } catch (err: any) {
      console.error('Failed to preview Monthly QA PDF:', err);
      alert('Could not open preview: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleSendMonthlyEmail = async () => {
    setIsSending(true);
    setSendResult(null);

    try {
      // 1. Generate the certified Monthly QA PDF
      const { base64, filename } = generateMonthlySummaryPDF(metrics, clientEmail, ccEmails);

      // 2. Transmit via server endpoint
      const response = await fetch('/api/send-monthly-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfBase64: base64,
          filename,
          recipientTo: clientEmail,
          recipientCc: ccEmails,
          monthName: metrics.monthName,
          inspectionsCount: metrics.inspectionsCount,
          averageScore: metrics.averageScore,
          rotationsCount: metrics.monthlyRotationsCompleted.length,
          deficienciesCount: metrics.deficiencies.length,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || `Server returned ${response.status}`);
      }

      setSendResult({
        success: true,
        mode: data.mode,
        messageId: data.messageId,
        note: data.note,
      });

      if (onAuditSubmitted) {
        onAuditSubmitted(data);
      }
    } catch (err: any) {
      console.error('Failed to send monthly QA summary:', err);
      setSendResult({
        success: false,
        error: err?.message || 'Failed to dispatch monthly QA email',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteInspection = (id: string) => {
    if (window.confirm('Remove this inspection from the monthly historical record?')) {
      deleteCompletedInspection(id);
      setHistoryKey((prev) => prev + 1);
    }
  };

  const handleResetHistory = () => {
    if (window.confirm('Reset inspection history back to the standard September 2026 seed audit log?')) {
      resetInspectionHistoryToDefault();
      setHistoryKey((prev) => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-purple-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 border-b border-purple-900/40 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-900/40 border border-purple-700/50 text-purple-300">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  Monthly Quality Assurance Summary
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                    Client Executive Report
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  {FACILITY_INFO.facility} • Account #{FACILITY_INFO.accountNumber} • Certified by {FACILITY_INFO.franchiseeName}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Operating Cadence Strategic Banner (Option 2) */}
        <div className="bg-purple-950/40 border-b border-purple-900/30 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-purple-200">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              <strong>Option 2 Cadence Active:</strong> Monthly Summary to Client • Every Inspection to Ronald (Recommended Strategy).
            </span>
          </div>
          <div className="text-[11px] text-purple-300 font-medium bg-purple-900/50 px-2.5 py-1 rounded-md border border-purple-700/40 self-start sm:self-auto">
            Schedule: First Friday Release (or On-Demand)
          </div>
        </div>

        {/* Month Selector & View Navigation Tabs */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 font-semibold">Reporting Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-purple-200 font-semibold rounded-lg px-2.5 py-1 focus:outline-hidden focus:border-purple-500"
            >
              <option value="2026-09">September 2026 (Contract Start)</option>
              <option value="2026-10">October 2026</option>
              <option value="2026-11">November 2026</option>
              <option value="2026-12">December 2026</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveSubTab('overview')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  activeSubTab === 'overview'
                    ? 'bg-purple-700 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Executive Overview
              </button>
              <button
                onClick={() => setActiveSubTab('audits')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                  activeSubTab === 'audits'
                    ? 'bg-purple-700 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Shift Audit Trail</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-purple-300">
                  {metrics.inspectionsCount}
                </span>
              </button>
              <button
                onClick={() => setActiveSubTab('dispatch')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 ${
                  activeSubTab === 'dispatch'
                    ? 'bg-purple-700 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mail className="w-3 h-3" />
                <span>Client Dispatch</span>
              </button>
            </div>

            {/* Dedicated Source Document (12-Mo Calendar) button in Monthly Report View */}
            {onOpenSourceDocCalendar && (
              <button
                onClick={onOpenSourceDocCalendar}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-900/80 to-indigo-900/80 hover:from-purple-800 hover:to-indigo-800 text-white border border-purple-500/50 font-bold transition shadow-sm cursor-pointer"
                title="Open Source Document & 12-Month Commercial Cleaning Calendar (Unit 103 - 2180 Dollarton Hwy • 156 Visits)"
              >
                <Calendar className="w-3.5 h-3.5 text-purple-300" />
                <span className="hidden sm:inline">Source Document (12-Mo Calendar)</span>
                <span className="sm:hidden">12-Mo Cal</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-200">
          {/* Executive Performance Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1: Completed Audits */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Shift Inspections
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{metrics.inspectionsCount}</span>
                <span className="text-xs text-slate-400">/ 13 scheduled</span>
              </div>
              <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>100% Verified Attendance</span>
              </p>
            </div>

            {/* Card 2: Average Compliance */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Avg Compliance
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-400">{metrics.averageScore}%</span>
                <span className="text-xs text-slate-400">score</span>
              </div>
              <p className="text-[11px] text-purple-300 font-medium">
                High Pass (Target: ≥85%)
              </p>
            </div>

            {/* Card 3: Deep Clean Rotations */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Deep Cleans Completed
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-purple-300">
                  {metrics.monthlyRotationsCompleted.length}
                </span>
                <span className="text-xs text-slate-400">of 6 rotational</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Agreement Schedule Met
              </p>
            </div>

            {/* Card 4: Deficiencies Remediated */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Deficiencies Caught
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black ${metrics.deficiencies.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {metrics.deficiencies.length}
                </span>
                <span className="text-xs text-slate-400">items</span>
              </div>
              <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>100% Remediated on-site</span>
              </p>
            </div>
          </div>

          {/* Sub-tab 1: Executive Overview */}
          {activeSubTab === 'overview' && (
            <div className="space-y-5">
              {/* Coverall 6 Monthly Deep-Clean Rotations Matrix */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Coverall Health-Based Cleaning System: Monthly Periodic Rotations
                  </h3>
                  <span className="text-[10px] text-slate-400">Page 2–5 Agreement Scope</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                  {[
                    {
                      rotation: '1st Tuesday',
                      name: 'Clean Partition Glass',
                      area: 'Interior Glass Partitions & Conference Dividers',
                      completed: metrics.monthlyRotationsCompleted.some((r) => r.toLowerCase().includes('partition')),
                    },
                    {
                      rotation: '2nd Saturday',
                      name: 'Detail Edge Vacuuming & Vacuum Fabric Furniture',
                      area: 'Baseboards, Crevices & Upholstered Seating',
                      completed: metrics.monthlyRotationsCompleted.some((r) => r.toLowerCase().includes('edge') || r.toLowerCase().includes('fabric') || r.toLowerCase().includes('furniture')),
                    },
                    {
                      rotation: '2nd Tuesday',
                      name: 'Dust Light Fixtures & Ceiling Vents',
                      area: 'Overhead Fixtures & Return Vents (6-10 ft)',
                      completed: metrics.monthlyRotationsCompleted.some((r) => r.toLowerCase().includes('fixture') || r.toLowerCase().includes('vent') || r.toLowerCase().includes('diffuser')),
                    },
                    {
                      rotation: '3rd Tuesday',
                      name: 'Dust Blinds & Entrance Glass Doors',
                      area: 'Window Blinds & Main Glass Entry Doors',
                      completed: metrics.monthlyRotationsCompleted.some((r) => r.toLowerCase().includes('blind') || r.toLowerCase().includes('entrance') || r.toLowerCase().includes('door')),
                    },
                    {
                      rotation: '4th Saturday',
                      name: 'Deep Clean Inside of Refrigerators',
                      area: 'Staff & Member Refrigerators (Sanitized)',
                      completed: metrics.monthlyRotationsCompleted.some((r) => r.toLowerCase().includes('refrigerator')),
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${
                        item.completed
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-[10px] uppercase font-bold text-purple-300">
                            {item.rotation}:
                          </span>
                          <span className="text-white">{item.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.area}</p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                          item.completed
                            ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-800 border border-slate-700 text-slate-400'
                        }`}
                      >
                        {item.completed ? '✓ Completed' : 'In Rotation'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deficiencies & Corrective Actions Log */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Quality Deficiency &amp; Immediate Remediation Log
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Proactive Quality Assurance by Ronald Ephard
                  </span>
                </div>

                {metrics.deficiencies.length === 0 ? (
                  <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Zero deficiencies recorded across all scheduled visits this month. All 10 serviced areas verified compliant.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {metrics.deficiencies.map((def, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-slate-900 border border-amber-900/40 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-amber-300">
                            [{def.date} - {def.shift} Shift] {def.itemName}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Resolved On-Site
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px]">{def.notes}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Strategic Explanation Callout */}
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-start gap-3 text-xs text-purple-200">
                <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-white">
                    Why Client Receives Monthly QA (Instead of Daily/Per-Visit Emails)
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Gym managers receive hundreds of vendor alerts each week. By consolidating the 12–13 monthly inspections into this single executive quality report delivered on the First Friday of each month, Anytime Fitness North Vancouver receives undeniable proof of compliance, photos, and deep-clean tasks without inbox fatigue. Meanwhile, you retain complete shift-by-shift internal documentation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab 2: Shift Audit Trail */}
          {activeSubTab === 'audits' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">
                  {metrics.inspectionsList.length} Inspections Audited in {metrics.monthName}
                </span>
                <button
                  onClick={handleResetHistory}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] transition"
                  title="Reset sample seed data"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>Reset Seed History</span>
                </button>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/70">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-purple-950/50 text-purple-200 border-b border-purple-900/40 text-[11px] uppercase tracking-wider">
                      <th className="p-3 font-bold">Date</th>
                      <th className="p-3 font-bold">Shift Timing</th>
                      <th className="p-3 font-bold">Score</th>
                      <th className="p-3 font-bold">Inspector</th>
                      <th className="p-3 font-bold">Monthly Tasks</th>
                      <th className="p-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {metrics.inspectionsList.map((insp) => (
                      <tr key={insp.id} className="hover:bg-slate-900/50 transition">
                        <td className="p-3 font-mono font-medium text-white">{insp.date}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800/40 text-purple-300 font-semibold text-[10px] uppercase">
                            {insp.shift} (11:00 PM)
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`font-bold ${insp.score >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {insp.score}% ({insp.passedCount} Pass / {insp.failedCount} Fail)
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{insp.inspectorName}</td>
                        <td className="p-3 text-slate-400 text-[11px]">
                          {insp.monthlyTasksCompleted.length > 0 ? (
                            <span className="text-purple-300 font-semibold">
                              {insp.monthlyTasksCompleted.join(', ')}
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                try {
                                  downloadCompletedInspectionPDF(insp);
                                } catch (e) {
                                  console.error('Failed to download PDF', e);
                                }
                              }}
                              className="p-1 rounded-lg text-purple-400 hover:text-purple-200 hover:bg-purple-950/70 transition"
                              title="Download certified PDF for this shift"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteInspection(insp.id)}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                              title="Delete entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-tab 3: Client Email Dispatch */}
          {activeSubTab === 'dispatch' && (
            <div className="space-y-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-purple-300 font-bold uppercase tracking-wider">
                  <Mail className="w-4 h-4 text-purple-400" />
                  <span>Monthly Executive Delivery Targeting</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Client Recipient (Anytime Fitness Manager)
                    </label>
                    <input
                      type="text"
                      value={clientEmail}
                      onChange={(e) => {
                        setClientEmail(e.target.value);
                        localStorage.setItem('afnv_client_monthly_email', e.target.value);
                      }}
                      placeholder="jen.johnson@anytimefitness.ca"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-hidden focus:border-purple-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Default: Primary Club Manager Jennifer Johnson
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Carbon Copy (Ronald / Coverall Franchisee)
                    </label>
                    <input
                      type="text"
                      value={ccEmails}
                      onChange={(e) => {
                        setCcEmails(e.target.value);
                        localStorage.setItem('afnv_client_monthly_cc', e.target.value);
                      }}
                      placeholder="ronaldephard10@gmail.com, ronald@marketingdo.net"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-hidden focus:border-purple-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Receives exact duplicate of the client's executive report
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Schedule Advice */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-purple-900/40 flex items-start gap-3 text-xs text-slate-300">
                <Clock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white mb-0.5">
                    Recommended Delivery Window: First Friday of the Month
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Sending on the First Friday morning gives the club manager a crisp end-of-week review of gym sanitation, positioning Coverall as a strategic partner ahead of weekend member traffic.
                  </p>
                </div>
              </div>

              {/* Dispatch Action Result Feedback */}
              {sendResult && (
                <div
                  className={`p-4 rounded-xl border text-xs ${
                    sendResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {sendResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-white">
                        {sendResult.success ? 'Monthly QA Summary Dispatched' : 'Transmission Issue'}
                      </h4>
                      {sendResult.success ? (
                        <>
                          <p>
                            Executive Report for <strong>{metrics.monthName}</strong> transmitted to <strong>{clientEmail}</strong>.
                          </p>
                          {sendResult.messageId && (
                            <p className="font-mono text-[11px] text-emerald-300">
                              Resend Reference ID: {sendResult.messageId}
                            </p>
                          )}
                          {sendResult.note && (
                            <p className="italic text-[11px] text-purple-300 mt-1">
                              {sendResult.note}
                            </p>
                          )}
                        </>
                      ) : (
                        <p>{sendResult.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviewPDF}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold transition"
            >
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              <span>Preview PDF</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple-800/60 bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 font-semibold transition"
            >
              <Download className="w-3.5 h-3.5 text-purple-300" />
              <span>Download PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendMonthlyEmail}
              disabled={isSending}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-bold transition shadow-lg shadow-purple-950/50 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating &amp; Transmitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Monthly Report to Jennifer Johnson</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
