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
} from 'lucide-react';
import { InspectionRecord, RECIPIENT_CONFIG, InspectionItem, ItemEvaluation } from '../types/inspection';
import { generateInspectionPDF } from '../utils/pdfGenerator';
import { CertificatePreviewModal } from './CertificatePreviewModal';

interface SubmissionSectionProps {
  record: InspectionRecord;
  activeItems: InspectionItem[];
  isOnline: boolean;
  onAuditSubmitted?: (result: any) => void;
}

export const SubmissionSection: React.FC<SubmissionSectionProps> = ({
  record,
  activeItems,
  isOnline,
  onAuditSubmitted,
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

  // Email Recipient Routing State (persisted locally so changes stick across sessions)
  const [recipientTo, setRecipientTo] = useState<string>(() => {
    return localStorage.getItem('afnv_recipient_to') || record.recipientTo || RECIPIENT_CONFIG.to;
  });
  const [recipientCc, setRecipientCc] = useState<string>(() => {
    const saved = localStorage.getItem('afnv_recipient_cc');
    if (saved !== null) return saved;
    return record.recipientCc !== undefined ? record.recipientCc : RECIPIENT_CONFIG.cc;
  });
  const [isEditingRecipients, setIsEditingRecipients] = useState(false);

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
      id="audit-submission-card"
      className="w-full bg-gradient-to-b from-slate-900 to-purple-950/40 border border-purple-900/50 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-900/30">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Certified Audit Dispatch & Export
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300">
              Official PDF Report
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
            Automated delivery to Anytime Fitness and Clean Audit Pro management via Resend API
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
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

      {/* Recipient Routing & Customization Box */}
      <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
              Email Dispatch Routing (Resend API)
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

        <p className="text-[11px] text-slate-400">
          Emails are routed exclusively to the addresses configured above. It does not go to any other email.
        </p>
      </div>

      {/* Primary Dispatch Action Button */}
      <div className="pt-2">
        <button
          id="send-inspection-button"
          onClick={handleSendResendEmail}
          disabled={isSending}
          className="w-full sm:w-auto min-w-[280px] flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-950/60 transition active:scale-[0.98] disabled:opacity-50"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating PDF & Transmitting via Resend...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Send Certified Inspection PDF via Resend</span>
            </>
          )}
        </button>
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
                    has been processed.
                  </p>
                  <p className="text-[11px] text-emerald-300 font-mono">
                    Routing: {recipientTo} {recipientCc ? `(Cc: ${recipientCc})` : ''}
                  </p>
                  {sendResult.messageId && (
                    <p className="text-[11px] opacity-80 font-mono">
                      Tracking Reference ID: {sendResult.messageId}
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
