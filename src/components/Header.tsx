import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  ShieldCheck,
  Clock,
  Wifi,
  WifiOff,
  FileText,
  Key,
  Mic,
  Radio,
  Download,
  Save,
  Check,
  BookOpen,
} from 'lucide-react';
import { FACILITY_INFO } from '../types/inspection';
import { PWAInstallBanner } from './PWAInstallBanner';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface HeaderProps {
  currentDayName: string;
  formattedDate: string;
  formattedTime: string;
  onResetAudit: () => void;
  isCompleted: boolean;
  onOpenSourceDoc?: () => void;
  onOpenQAGuide?: () => void;
  onOpenMonthlySummary?: () => void;
  isVoiceListening?: boolean;
  onToggleVoice?: () => void;
  isVoiceSupported?: boolean;
  onDownloadReport?: () => void;
  onSaveReport?: () => void;
  lastSavedText?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentDayName,
  formattedDate,
  formattedTime,
  onResetAudit,
  onOpenSourceDoc,
  onOpenQAGuide,
  onOpenMonthlySummary,
  isVoiceListening,
  onToggleVoice,
  isVoiceSupported,
  onDownloadReport,
  onSaveReport,
  lastSavedText,
}) => {
  const isOnline = useOnlineStatus();
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleDownloadClick = () => {
    if (onDownloadReport) {
      onDownloadReport();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }
  };

  const handleSaveClick = () => {
    if (onSaveReport) {
      onSaveReport();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <header id="facility-header" className="w-full bg-slate-900/90 border-b border-purple-900/40 backdrop-blur-md sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
        {/* Top brand row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Anytime Fitness Purple Badge */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-700 to-indigo-900 border border-purple-400/30 flex items-center justify-center text-white shadow-md shadow-purple-950/50">
              <ShieldCheck className="w-6 h-6 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-purple-900/70 text-purple-300 border border-purple-700/50">
                  Clean Audit Pro
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  <Clock className="w-3 h-3 text-purple-400" />
                  {currentDayName} • 11:00 PM Shift
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                  Acct #3007
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight mt-0.5">
                {FACILITY_INFO.facility}
              </h1>
            </div>
          </div>

          {/* Right utility buttons: Voice Assistant, Monthly Summary, Source Document, PWA install, connectivity, reset */}
          <div className="flex items-center gap-2.5 ml-auto">
            {/* Hands-Free Voice Walkthrough Toggle */}
            {isVoiceSupported && onToggleVoice && (
              <button
                onClick={onToggleVoice}
                id="header-voice-assistant-btn"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition shadow-sm relative ${
                  isVoiceListening
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 ring-2 ring-purple-400/40 shadow-purple-900/50'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                }`}
                title={isVoiceListening ? 'Hands-Free Voice Active (Tap to pause)' : 'Activate Hands-Free Voice Walkthrough'}
              >
                {isVoiceListening ? (
                  <>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                    </span>
                    <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
                    <span className="hidden sm:inline">Voice Active</span>
                    <span className="sm:hidden">Voice</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-purple-400" />
                    <span className="hidden sm:inline">Voice Walkthrough</span>
                    <span className="sm:hidden">Voice</span>
                  </>
                )}
              </button>
            )}

            {/* Monthly Client Summary Report button */}
            {onOpenMonthlySummary && (
              <button
                onClick={onOpenMonthlySummary}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 text-white border border-purple-500/50 text-xs font-bold transition shadow-sm"
                title="Open Client Monthly QA Summary & Executive PDF Generator (Option 2 Strategy)"
              >
                <FileText className="w-3.5 h-3.5 text-purple-200" />
                <span className="hidden sm:inline">Monthly QA Report</span>
                <span className="sm:hidden">Monthly QA</span>
                <span className="text-[10px] bg-purple-950/80 px-1.5 py-0.2 rounded border border-purple-400/50 text-purple-200 font-extrabold">Client</span>
              </button>
            )}

            {/* Coverall QA Inspection Method Guide button */}
            {onOpenQAGuide && (
              <button
                onClick={onOpenQAGuide}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-900/60 to-purple-800/60 hover:from-purple-800/80 hover:to-purple-700/80 text-purple-200 border border-purple-600/60 text-xs font-semibold transition shadow-sm cursor-pointer"
                title="Open Coverall QA Inspection Method Guide, Walkthrough Procedures & 9/7/5 Rating Rules"
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-300" />
                <span className="hidden sm:inline">QA Guide</span>
                <span className="text-[10px] bg-purple-950 px-1 rounded border border-purple-800">FBO</span>
              </button>
            )}

            {/* Source Document Reference button */}
            {onOpenSourceDoc && (
              <button
                onClick={onOpenSourceDoc}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-700/50 text-xs font-semibold transition shadow-sm cursor-pointer"
                title="View Coverall Health-Based Cleaning System Original Work Agreement & Schedule (Acct #3007)"
              >
                <FileText className="w-3.5 h-3.5 text-purple-300" />
                <span className="hidden sm:inline">Source Agreement</span>
                <span className="text-[10px] bg-purple-950 px-1 rounded border border-purple-800">Docs</span>
              </button>
            )}

            {/* Online/Offline pill */}
            <div
              id="network-status-badge"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                isOnline
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                  : 'bg-amber-950/50 border-amber-500/50 text-amber-300'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  <span>Offline Mode</span>
                </>
              )}
            </div>

            {/* PWA Install */}
            <PWAInstallBanner />

            {/* Quick Save Report Button */}
            {onSaveReport && (
              <button
                id="header-save-report-btn"
                onClick={handleSaveClick}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
                  saveSuccess
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
                }`}
                title="Save current audit to local inspection history"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden md:inline">Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-purple-400" />
                    <span className="hidden md:inline">Save</span>
                  </>
                )}
              </button>
            )}

            {/* Quick Download Report (PDF) Button */}
            {onDownloadReport && (
              <button
                id="header-download-report-btn"
                onClick={handleDownloadClick}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition shadow-sm ${
                  downloadSuccess
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : 'bg-purple-900/60 hover:bg-purple-800/80 border-purple-600 text-purple-100 shadow-purple-950/40'
                }`}
                title="Download today's inspection report as certified PDF"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-purple-300" />
                    <span className="hidden sm:inline">Download Report</span>
                    <span className="sm:hidden">PDF</span>
                  </>
                )}
              </button>
            )}

            {/* Reset / New Shift button */}
            <button
              id="reset-audit-button"
              onClick={onResetAudit}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition"
              title="Reset today's checklist state"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Facility Metadata Bar */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-x-5 gap-y-1.5 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="font-medium">{FACILITY_INFO.address}</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Contact: <strong className="text-slate-200">{FACILITY_INFO.contactName}</strong> ({FACILITY_INFO.contactPhone})</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-amber-300/90 text-[11px]">
              <Key className="w-3 h-3 text-amber-400" />
              <span>Keys: 1 Fob + 1 Key</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-purple-300 bg-purple-950/50 px-2.5 py-1 rounded-md border border-purple-800/40">
            <Clock className="w-3 h-3 text-purple-400 shrink-0" />
            <span>
              <strong>Schedule:</strong> {FACILITY_INFO.frequency}
            </span>
            <span className="text-slate-400 ml-1 hidden xl:inline">• {formattedDate} {formattedTime}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
