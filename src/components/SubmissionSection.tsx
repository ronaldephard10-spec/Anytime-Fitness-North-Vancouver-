import React, { useState } from 'react';
import {
  FileText,
  Send,
  Download,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Eye,
  X,
  Camera,
  Edit3,
  RotateCcw,
  Check,
  Calendar,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  InspectionRecord,
  RECIPIENT_CONFIG,
  CLIENT_REPORT_RECIPIENTS,
  InspectionItem,
  ItemEvaluation,
  ReportingCadence,
} from '../types/inspection';
import { generateInspectionPDF } from '../utils/pdfGenerator';
import { CertificatePreviewModal } from './CertificatePreviewModal';
import {
  getReportingCadence,
  setReportingCadence,
  saveCompletedInspection,
  CompletedInspection,
} from '../utils/inspectionHistory';

interface SubmissionSectionProps {
  record: InspectionRecord;
  activeItems: InspectionItem[];
  isOnline: boolean;
  onAuditSubmitted?: (result: any) => void;
  onOpenMonthlySummary?: () => void;
}

export const SubmissionSection: React.FC<SubmissionSectionProps> = ({
  record,
  activeItems,
  isOnline,
  onAuditSubmitted,
  onOpenMonthlySummary,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    mode?: 'live' | 'simulated';
    messageId?: string;
    note?: string;
    error?: string;
  } | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Active Cadence Strategy (Option 1, 2, or 3)
  const [cadence, setCadenceState] = useState<ReportingCadence>(() => getReportingCadence());

  // Email Recipient Routing State
  const [recipientTo, setRecipientTo] = useState<string>(() => {
    const saved = localStorage.getItem('afnv_recipient_to');
    if (saved) return saved;
    // Default based on cadence
    if (getReportingCadence() === 'every-visit') {
      return `${CLIENT_REPORT_RECIPIENTS.to}, ${RECIPIENT_CONFIG.to}`;
    }
    return RECIPIENT_CONFIG.to;
  });

  const [recipientCc, setRecipientCc] = useState<string>(() => {
    const saved = localStorage.getItem('afnv_recipient_cc');
    if (saved !== null) return saved;
    return record.recipientCc !== undefined ? record.recipientCc : RECIPIENT_CONFIG.cc;
  });

  const [isEditingRecipients, setIsEditingRecipients] = useState(false);

  const handleCadenceChange = (newCadence: ReportingCadence) => {
    setCadenceState(newCadence);
    setReportingCadence(newCadence);

    if (newCadence === 'monthly-summary') {
      // Option 2: Send to Ronald only per visit; client gets monthly summary
      setRecipientTo(RECIPIENT_CONFIG.to);
      setRecipientCc(RECIPIENT_CONFIG.cc);
      localStorage.setItem('afnv_recipient_to', RECIPIENT_CONFIG.to);
      localStorage.setItem('afnv_recipient_cc', RECIPIENT_CONFIG.cc);
    } else if (newCadence === 'every-visit') {
      // Option 3: Send directly to client + Ronald after every visit
      const combinedTo = `${CLIENT_REPORT_RECIPIENTS.to}, ${RECIPIENT_CONFIG.to}`;
      setRecipientTo(combinedTo);
      setRecipientCc(RECIPIENT_CONFIG.cc);
      localStorage.setItem('afnv_recipient_to', combinedTo);
      localStorage.setItem('afnv_recipient_cc', RECIPIENT_CONFIG.cc);
    } else if (newCadence === 'weekly-summary') {
      // Option 1: Send to Ronald on Sun/Tue; Thursday includes client
      if (record.activeDay === 'thursday') {
        const combinedTo = `${CLIENT_REPORT_RECIPIENTS.to}, ${RECIPIENT_CONFIG.to}`;
        setRecipientTo(combinedTo);
        localStorage.setItem('afnv_recipient_to', combinedTo);
      } else {
        setRecipientTo(RECIPIENT_CONFIG.to);
        localStorage.setItem('afnv_recipient_to', RECIPIENT_CONFIG.to);
      }
    }
  };

  const handleToChange = (val: string) => {
    setRecipientTo(val);
    localStorage.setItem('afnv_recipient_to', val);
  };

  const handleCcChange = (val: string) => {
    setRecipientCc(val);
    localStorage.setItem('afnv_recipient_cc', val);
  };

  const handleResetRecipients = () => {
    setRecipientTo(RECIPIENT_CONFIG.to);
    setRecipientCc(RECIPIENT_CONFIG.cc);
    localStorage.removeItem('afnv_recipient_to');
    localStorage.removeItem('afnv_recipient_cc');
  };

  const isCustomized =
    recipientTo !== RECIPIENT_CONFIG.to || recipientCc !== RECIPIENT_CONFIG.cc;

  // Enriched record with dynamic recipients
  const activeRecordWithRecipients: InspectionRecord = {
    ...record,
    recipientTo,
    recipientCc,
  };

  const handleDownloadPDF = () => {
    try {
      const { doc, filename } = generateInspectionPDF(activeRecordWithRecipients, activeItems);
      doc.save(filename);
    } catch (err: any) {
      console.error('PDF download error:', err);
      alert('Could not download PDF: ' + (err?.message || 'Unknown error'));
    }
  };

  const handlePreviewPDF = () => {
    setIsPreviewOpen(true);
  };

  // Collect deficiencies for persistent history logging
  const getDeficienciesList = () => {
    const list: Array<{ itemName: string; notes: string; resolved: boolean }> = [];
    activeItems.forEach((item) => {
      const ev = record.items[item.id];
      if (ev && ev.status === 'fail') {
        list.push({
          itemName: item.name,
          notes: ev.notes || 'Identified during walk-through and corrected before departure.',
          resolved: true,
        });
      }
    });
    return list;
  };

  // Collect active monthly tasks completed
  const getActiveMonthlyTasksCompleted = () => {
    const completed: string[] = [];
    Object.entries(record.monthlyToggles || {}).forEach(([key, val]) => {
      if (val) {
        const matchingItem = activeItems.find((i) => i.id === key || i.id.includes(key));
        if (matchingItem) {
          completed.push(matchingItem.name);
        } else {
          completed.push(key.replace(/-/g, ' ').toUpperCase());
        }
      }
    });
    return completed;
  };

  const handleSendResendEmail = async () => {
    setIsSending(true);
    setSendResult(null);

    try {
      // 1. Generate certified PDF with configured recipients in attestation
      const { base64, filename } = generateInspectionPDF(activeRecordWithRecipients, activeItems);

      // 2. Dispatch to /api/send-inspection (handles Vercel serverless & local dev)
      const response = await fetch('/api/send-inspection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfBase64: base64,
          filename,
          recipientTo,
          recipientCc,
          record: {
            id: record.id,
            activeDay: record.activeDay,
            inspectionDate: record.inspectionDate,
            inspectionTime: record.inspectionTime,
            inspectorName: record.inspectorName,
            supervisorName: record.supervisorName,
            score: record.score,
            overallNotes: record.overallNotes,
            photoCount: totalPhotos,
            recipientTo,
            recipientCc,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || `Server returned ${response.status}`);
      }

      // 3. Persist this completed inspection into local historical store
      const completedAudit: CompletedInspection = {
        id: record.id,
        date: record.inspectionDate,
        isoDate: new Date().toISOString().split('T')[0],
        time: record.inspectionTime,
        shift: record.activeDay,
        score: record.score.percentage,
        passedCount: record.score.passedCount,
        failedCount: record.score.failedCount,
        naCount: record.score.naCount,
        totalEvaluated: record.score.totalEvaluated,
        inspectorName: record.inspectorName || 'Ronald Ephard',
        supervisorName: record.supervisorName || 'Jennifer Johnson',
        notes: record.overallNotes || 'Inspection certified compliant.',
        monthlyTasksCompleted: getActiveMonthlyTasksCompleted(),
        deficiencies: getDeficienciesList(),
        photoCount: totalPhotos,
        dispatchedTo: recipientTo,
        cadenceMode: cadence,
        createdAt: new Date().toISOString(),
      };

      saveCompletedInspection(completedAudit);

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
      console.error('Failed to send audit email:', err);
      setSendResult({
        success: false,
        error: err?.message || 'Failed to dispatch inspection email',
      });
    } finally {
      setIsSending(false);
    }
  };

  const totalPhotos = (Object.values(record.items || {}) as ItemEvaluation[]).reduce<number>(
    (acc, ev) => {
      if (ev.photos && ev.photos.length > 0) return acc + ev.photos.length;
      if (ev.photoUrl) return acc + 1;
      return acc;
    },
    0
  );

  return (
    <div
      id="submission-section"
      className="w-full bg-gradient-to-b from-slate-900 to-purple-950/40 border border-purple-900/50 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-900/30">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Certified Inspection Dispatch &amp; Client Reporting
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300">
              Clean Audit Pro
            </span>
            {totalPhotos > 0 && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300 flex items-center gap-1">
                <Camera className="w-3 h-3" />
                <span>
                  {totalPhotos} Station {totalPhotos === 1 ? 'Picture' : 'Pictures'} Attached
                </span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Anytime Fitness North Vancouver • Account #3007 • Resend API Dispatched
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenMonthlySummary && (
            <button
              onClick={onOpenMonthlySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-600 bg-purple-900/60 hover:bg-purple-800 text-purple-100 text-xs font-bold transition shadow-sm"
              title="Open Client Monthly QA Summary Generator"
            >
              <FileText className="w-3.5 h-3.5 text-purple-300" />
              <span>Monthly Client QA Report</span>
            </button>
          )}

          <button
            onClick={handlePreviewPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition active:scale-95"
            title="Preview generated PDF document"
          >
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            <span>Preview PDF</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-purple-700/60 bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 text-xs font-semibold transition active:scale-95"
            title="Download PDF directly to device"
          >
            <Download className="w-3.5 h-3.5 text-purple-300" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Strategic Reporting Cadence Policy Selector */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Client Reporting Policy &amp; Cadence
            </span>
          </div>
          <span className="text-[11px] text-purple-300 font-semibold">
            Select how Anytime Fitness receives reports
          </span>
        </div>

        {/* 3 Strategy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {/* Option 2 (Recommended / Active) */}
          <button
            type="button"
            onClick={() => handleCadenceChange('monthly-summary')}
            className={`p-3 rounded-xl border text-left transition relative ${
              cadence === 'monthly-summary'
                ? 'bg-purple-950/60 border-purple-500 shadow-md ring-1 ring-purple-500/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">Option 2 (Preferred)</span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                Recommended
              </span>
            </div>
            <div className="text-[11px] font-semibold text-purple-300 mb-1">
              Monthly Summary to Client • Every Inspection to Ronald
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Emails Ronald after every visit. Client receives a single executive report on the First Friday of the month. Avoids report fatigue.
            </p>
          </button>

          {/* Option 1 */}
          <button
            type="button"
            onClick={() => handleCadenceChange('weekly-summary')}
            className={`p-3 rounded-xl border text-left transition relative ${
              cadence === 'weekly-summary'
                ? 'bg-purple-950/60 border-purple-500 shadow-md ring-1 ring-purple-500/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">Option 1</span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                Balanced
              </span>
            </div>
            <div className="text-[11px] font-semibold text-purple-300 mb-1">
              Weekly Thursday Roll-up
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Complete inspections Sun, Tue, Thu. Dispatches weekly certified PDF to client only after Thursday cleaning with all 3 shifts.
            </p>
          </button>

          {/* Option 3 */}
          <button
            type="button"
            onClick={() => handleCadenceChange('every-visit')}
            className={`p-3 rounded-xl border text-left transition relative ${
              cadence === 'every-visit'
                ? 'bg-purple-950/60 border-purple-500 shadow-md ring-1 ring-purple-500/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">Option 3</span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-950 border border-amber-500/40 text-amber-300">
                Problem Accounts
              </span>
            </div>
            <div className="text-[11px] font-semibold text-amber-300 mb-1">
              Every Visit to Client
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Direct email to Jennifer Johnson after every Sun, Tue, and Thu shift. Used for new accounts, complaints, or contract renewals.
            </p>
          </button>
        </div>

        {/* Dynamic Cadence Notice Banner */}
        {cadence === 'monthly-summary' && (
          <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-800/40 flex items-start gap-2.5 text-xs text-purple-200">
            <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">
                Active Routing: Shift PDF will be sent to Ronald Ephard only.
              </span>
              <span className="text-slate-300 ml-1">
                Anytime Fitness manager (Jennifer Johnson) will NOT receive individual shift emails. All shifts are logged into history and compiled into the Monthly QA Summary.
              </span>
            </div>
          </div>
        )}

        {cadence === 'weekly-summary' && (
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
            <Calendar className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">
                Weekly Cadence Active:
              </span>
              <span className="text-slate-300 ml-1">
                {record.activeDay === 'thursday'
                  ? 'Thursday shift active: PDF report will be delivered to Jennifer Johnson & Ronald.'
                  : `${record.activeDay.toUpperCase()} shift: Stored in app and emailed internally to Ronald.`}
              </span>
            </div>
          </div>
        )}

        {cadence === 'every-visit' && (
          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 flex items-start gap-2.5 text-xs text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">
                Every-Visit Delivery Active:
              </span>
              <span className="text-amber-100 ml-1">
                This shift audit will be emailed directly to client Jennifer Johnson (jen.johnson@anytimefitness.ca) upon clicking Send.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Recipient Routing & Customization Box */}
      <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
              Shift Email Dispatch Routing
            </span>
            {isCustomized && (
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                Customized
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isCustomized && (
              <button
                type="button"
                onClick={handleResetRecipients}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 text-[11px] text-slate-300 hover:text-white transition"
                title="Restore default recipient emails"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Reset Defaults</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsEditingRecipients(!isEditingRecipients)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                isEditingRecipients
                  ? 'bg-purple-700 hover:bg-purple-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-750 border border-slate-700 text-purple-300'
              }`}
            >
              {isEditingRecipients ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Done Editing</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3 h-3" />
                  <span>Change Email</span>
                </>
              )}
            </button>
          </div>
        </div>

        {isEditingRecipients ? (
          /* Recipient Edit Form */
          <div className="space-y-3 pt-1 bg-slate-900/90 p-3.5 rounded-xl border border-purple-900/40">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                  Primary Recipient (To)
                </label>
                <span className="text-[10px] text-slate-400">Separate multiple with commas</span>
              </div>
              <input
                type="text"
                value={recipientTo}
                onChange={(e) => handleToChange(e.target.value)}
                placeholder="e.g. ronaldephard10@gmail.com, manager@anytimefitness.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-hidden focus:border-purple-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                  Carbon Copy (Cc)
                </label>
                <span className="text-[10px] text-slate-400">Optional (leave empty for no CC)</span>
              </div>
              <input
                type="text"
                value={recipientCc}
                onChange={(e) => handleCcChange(e.target.value)}
                placeholder="e.g. ronald@marketingdo.net"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-hidden focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              <span className="italic">Changes are automatically saved for your future inspections.</span>
              <button
                type="button"
                onClick={() => setIsEditingRecipients(false)}
                className="text-purple-400 hover:text-purple-300 font-semibold"
              >
                Save &amp; Close
              </button>
            </div>
          </div>
        ) : (
          /* Recipient Cards Display */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="block text-slate-500 font-sans text-[10px] uppercase font-bold">To (Primary)</span>
              <span className="text-purple-300 font-semibold break-all block">{recipientTo || '(None specified)'}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="block text-slate-500 font-sans text-[10px] uppercase font-bold">Cc (Carbon Copy)</span>
              <span className="text-purple-300 font-semibold break-all block">{recipientCc || '(None)'}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="block text-slate-500 font-sans text-[10px] uppercase font-bold">From (Sender)</span>
              <span className="text-emerald-400 font-semibold truncate block">{RECIPIENT_CONFIG.from}</span>
            </div>
          </div>
        )}
      </div>

      {/* Primary Dispatch Action Buttons */}
      <div className="pt-2 flex flex-wrap items-center gap-3">
        <button
          id="send-inspection-button"
          onClick={handleSendResendEmail}
          disabled={isSending}
          className="flex-1 sm:flex-initial min-w-[280px] flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-950/60 transition active:scale-[0.98] disabled:opacity-50"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Certifying Audit &amp; Transmitting...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>
                {cadence === 'monthly-summary'
                  ? 'Save & Send Shift Audit to Ronald (Internal Record)'
                  : 'Send Certified Inspection PDF via Resend'}
              </span>
            </>
          )}
        </button>

        {onOpenMonthlySummary && (
          <button
            type="button"
            onClick={onOpenMonthlySummary}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-purple-700/60 text-purple-200 font-bold text-sm transition"
          >
            <FileText className="w-4 h-4 text-purple-400" />
            <span>Generate Client Monthly QA Report</span>
            <ArrowRight className="w-4 h-4 text-purple-400" />
          </button>
        )}
      </div>

      {/* Result feedback */}
      {sendResult && (
        <div
          className={`rounded-xl p-4 border transition-all ${
            sendResult.success
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {sendResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}

            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-sm text-white">
                {sendResult.success ? 'Inspection Certified & Dispatched' : 'Transmission Issue'}
              </h4>

              {sendResult.success ? (
                <>
                  <p>
                    Certified PDF for Anytime Fitness North Vancouver (<strong>{record.activeDay.toUpperCase()} Shift</strong>)
                    has been saved to the Monthly Record and dispatched.
                  </p>
                  <p className="text-[11px] text-emerald-300 font-mono">
                    Routing: {recipientTo} {recipientCc ? `(Cc: ${recipientCc})` : ''}
                  </p>
                  {sendResult.messageId && (
                    <p className="text-[11px] opacity-80 font-mono">
                      Tracking Reference ID: {sendResult.messageId}
                    </p>
                  )}
                  {cadence === 'monthly-summary' && (
                    <p className="text-[11px] text-purple-300 font-medium mt-1">
                      ✓ Logged to Monthly QA Summary. Jennifer Johnson will receive this shift compiled into the executive report on the First Friday of next month.
                    </p>
                  )}
                  {sendResult.note && (
                    <p className="text-[11px] text-purple-300 italic mt-1">
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

      {/* Certified Inspection Certificate Document Preview Modal */}
      {isPreviewOpen && (
        <CertificatePreviewModal
          record={activeRecordWithRecipients}
          activeItems={activeItems}
          onClose={() => setIsPreviewOpen(false)}
          onDownload={handleDownloadPDF}
        />
      )}
    </div>
  );
};

