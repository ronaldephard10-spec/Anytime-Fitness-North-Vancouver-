import React from 'react';
import { RotateCcw, Download, Save, X, AlertTriangle } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmResetOnly: () => void;
  onSaveAndReset: () => void;
  onDownloadAndReset: () => void;
  activeShiftName: string;
  scorePercentage: number;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmResetOnly,
  onSaveAndReset,
  onDownloadAndReset,
  activeShiftName,
  scorePercentage,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="reset-confirm-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="reset-confirm-modal"
        className="w-full max-w-lg bg-slate-900 border border-purple-900/60 rounded-2xl shadow-2xl p-6 space-y-5 text-slate-200"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Reset Inspection Session?
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Current {activeShiftName} shift audit score is <strong>{scorePercentage}%</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          Starting a fresh audit will clear all checkmark statuses, signature, and notes for today. Before resetting, you can download the certified PDF or save it to your inspection audit history.
        </p>

        <div className="space-y-2.5 pt-1">
          {/* Option 1: Download & Reset */}
          <button
            onClick={onDownloadAndReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-md shadow-purple-950/60 active:scale-[0.99]"
          >
            <Download className="w-4 h-4 text-purple-200" />
            <span>Download Report (PDF) &amp; Reset</span>
          </button>

          {/* Option 2: Save to History & Reset */}
          <button
            onClick={onSaveAndReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-semibold text-xs transition active:scale-[0.99]"
          >
            <Save className="w-4 h-4 text-purple-400" />
            <span>Save to History &amp; Reset</span>
          </button>

          {/* Option 3: Reset without saving */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirmResetOnly}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 border border-rose-900/50 transition"
            >
              Reset Without Saving
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
