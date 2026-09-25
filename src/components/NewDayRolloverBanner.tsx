import React from 'react';
import { Sparkles, Download, CheckCircle2, X, FileText, ArrowRight, History } from 'lucide-react';
import { CompletedInspection } from '../utils/inspectionHistory';
import { downloadCompletedInspectionPDF } from '../utils/pdfGenerator';

interface NewDayRolloverBannerProps {
  previousDate: string;
  previousShift: string;
  archivedRecord?: CompletedInspection | null;
  currentDayName: string;
  onDismiss: () => void;
  onOpenHistory: () => void;
}

export const NewDayRolloverBanner: React.FC<NewDayRolloverBannerProps> = ({
  previousDate,
  previousShift,
  archivedRecord,
  currentDayName,
  onDismiss,
  onOpenHistory,
}) => {
  const [downloading, setDownloading] = React.useState(false);
  const [downloaded, setDownloaded] = React.useState(false);

  const handleDownloadPrevious = () => {
    if (!archivedRecord) return;
    try {
      setDownloading(true);
      downloadCompletedInspectionPDF(archivedRecord);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 4000);
    } catch (e) {
      console.error('Failed to download archived report', e);
      alert('Could not generate PDF download');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      id="new-day-rollover-banner"
      className="w-full bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-600/60 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden"
    >
      {/* Decorative ambient glow */}
      <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center shrink-0 text-purple-300 shadow-inner">
            <Sparkles className="w-5 h-5 text-purple-300" />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-900/80 border border-purple-400/50 text-purple-200">
                New Day Started
              </span>
              <span className="text-sm sm:text-xs font-bold text-white">
                {currentDayName} Shift Initialized
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Previous audit safely archived
              </span>
            </div>

            <p className="text-sm sm:text-xs text-slate-200 leading-relaxed max-w-2xl">
              A fresh checklist has been prepared for today. Your inspection from{' '}
              <strong className="text-white">{previousDate} ({previousShift.toUpperCase()})</strong>{' '}
              {archivedRecord ? `scored ${archivedRecord.score}% and ` : ''}has been stored in your certified history.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:self-end md:self-center shrink-0">
          {archivedRecord && (
            <button
              onClick={handleDownloadPrevious}
              disabled={downloading}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm sm:text-xs font-bold transition shadow-md shadow-purple-950/60 active:scale-95 disabled:opacity-50 min-h-[44px]"
              title="Download previous day's certified PDF report"
            >
              {downloaded ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Report Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-purple-100" />
                  <span>Download {previousDate} Report (PDF)</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-sm sm:text-xs font-semibold transition active:scale-95 min-h-[44px]"
            title="View full inspection history"
          >
            <History className="w-4 h-4 text-purple-400" />
            <span>View History</span>
          </button>

          <button
            onClick={onDismiss}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Dismiss notification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
