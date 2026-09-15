import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, MinusCircle, CheckCheck, AlertCircle, Download, Save, Check } from 'lucide-react';
import { ActiveTab } from '../types/inspection';

interface ScoreBreakdown {
  percentage: number;
  passedCount: number;
  failedCount: number;
  naCount: number;
  totalEvaluated: number;
  totalScorable: number;
}

interface ComplianceScoreCardProps {
  score: ScoreBreakdown;
  activeTab: ActiveTab;
  onPassAll: () => void;
  monthlyCountActive: number;
  onDownloadReport?: () => void;
  onSaveReport?: () => void;
}

export const ComplianceScoreCard: React.FC<ComplianceScoreCardProps> = ({
  score,
  activeTab,
  onPassAll,
  monthlyCountActive,
  onDownloadReport,
  onSaveReport,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const isPassing = score.percentage >= 85;
  const isPerfect = score.percentage === 100 && score.totalScorable > 0;

  const tabLabels: Record<ActiveTab, string> = {
    sunday: 'Sunday Shift',
    tuesday: 'Tuesday Shift',
    thursday: 'Thursday Shift',
    'full-audit': 'Full Facility Audit',
  };

  return (
    <div
      id="compliance-score-card"
      className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl shadow-black/20"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Score Badge & Title */}
        <div className="flex items-center gap-4">
          <div
            className={`relative flex items-center justify-center w-20 h-20 rounded-2xl border-2 transition-all ${
              isPerfect
                ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-950/50'
                : isPassing
                ? 'bg-purple-950/60 border-purple-400 text-purple-300'
                : 'bg-rose-950/60 border-rose-500 text-rose-300'
            }`}
          >
            <div className="text-center">
              <span className="text-2xl font-black tracking-tight block">
                {score.totalScorable === 0 ? '0' : score.percentage}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
                Score
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-purple-900/60 text-purple-200 border border-purple-700/50">
                <Award className="w-3.5 h-3.5 text-purple-300" />
                {tabLabels[activeTab]}
              </span>

              {isPassing ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  Certified Standard (≥85%)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-500/30">
                  <AlertCircle className="w-3 h-3" />
                  Below 85% Target
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white mt-1">
              Active Compliance Score: {score.percentage}%
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Calculated dynamically strictly for <strong>{tabLabels[activeTab]}</strong> items
              {monthlyCountActive > 0 ? ` (+${monthlyCountActive} active monthly deep cleans)` : ''}.
            </p>
          </div>
        </div>

        {/* Right: Quick actions & counters */}
        <div className="w-full sm:w-auto flex flex-wrap items-center gap-2 sm:justify-end">
          {/* Item counters */}
          <div className="flex items-center gap-2 text-xs bg-slate-950/60 p-1.5 px-3 rounded-xl border border-slate-800">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold" title="Passed items">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {score.passedCount} Pass
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-rose-400 font-semibold" title="Failed items">
              <XCircle className="w-3.5 h-3.5" />
              {score.failedCount} Fail
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-slate-400 font-semibold" title="Non-applicable items">
              <MinusCircle className="w-3.5 h-3.5" />
              {score.naCount} N/A
            </span>
          </div>

          {/* Quick Mark All Passed button */}
          <button
            id="mark-all-passed-button"
            onClick={onPassAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold shadow-sm transition active:scale-95"
            title="Mark all current shift items as passed"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Pass All Shift Items</span>
          </button>

          {/* Quick Save to History */}
          {onSaveReport && (
            <button
              onClick={() => {
                onSaveReport();
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-sm transition active:scale-95 ${
                saveSuccess
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              }`}
              title="Save current audit into persistent history"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-purple-400" />
                  <span>Save Report</span>
                </>
              )}
            </button>
          )}

          {/* Quick Download PDF */}
          {onDownloadReport && (
            <button
              onClick={() => {
                onDownloadReport();
                setDownloadSuccess(true);
                setTimeout(() => setDownloadSuccess(false), 3000);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold shadow-sm transition active:scale-95 ${
                downloadSuccess
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-purple-900/60 hover:bg-purple-800/80 border-purple-600 text-purple-100'
              }`}
              title="Download official certified inspection PDF"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-purple-300" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Progress visual bar */}
      <div className="w-full bg-slate-950 rounded-full h-2 mt-4 overflow-hidden p-0.5 border border-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isPassing ? 'bg-gradient-to-r from-purple-500 to-emerald-400' : 'bg-gradient-to-r from-rose-600 to-amber-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, score.percentage))}%` }}
        />
      </div>
    </div>
  );
};
