import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  HelpCircle,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  ArrowDownCircle,
} from 'lucide-react';
import { VoiceWalkthroughState } from '../hooks/useVoiceWalkthrough';

interface VoiceAssistantBarProps {
  voiceState: VoiceWalkthroughState;
  activeShiftName: string;
}

export const VoiceAssistantBar: React.FC<VoiceAssistantBarProps> = ({
  voiceState,
  activeShiftName,
}) => {
  const {
    isSupported,
    isListening,
    isSpeaking,
    interimTranscript,
    lastTranscript,
    lastFeedback,
    error,
    soundEnabled,
    toggleListening,
    toggleSound,
    clearError,
  } = voiceState;

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isSupported) {
    return null; // Gracefully hidden on unsupported browsers
  }

  return (
    <>
      {/* Floating Bottom HUD Bar */}
      <div className="fixed bottom-4 right-4 z-40 max-w-[calc(100vw-2rem)] sm:max-w-md w-full transition-all">
        {/* Error Toast if microphone permission or capture failed */}
        {error && (
          <div className="mb-2 p-3 rounded-xl bg-rose-950/95 border border-rose-500/50 shadow-2xl text-xs text-rose-200 flex items-start justify-between gap-2 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-rose-400 hover:text-white p-0.5 rounded transition"
              title="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Voice Commands Cheat Sheet Drawer */}
        {isHelpOpen && (
          <div className="mb-3 p-4 rounded-2xl bg-slate-900/95 border border-purple-500/30 shadow-2xl backdrop-blur-md text-xs text-slate-200 space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-white text-sm">Hands-Free Voice Commands</span>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-emerald-500/30">
                <div className="font-bold text-emerald-300 flex items-center gap-1 mb-0.5">
                  <CheckCircle2 className="w-3 h-3" /> "Pass [item]"
                </div>
                <p className="text-slate-400">
                  e.g., "Pass restrooms", "Pass entrance", "Pass gym mirrors", "Pass all"
                </p>
              </div>

              <div className="p-2 rounded-lg bg-slate-950/60 border border-rose-500/30">
                <div className="font-bold text-rose-300 flex items-center gap-1 mb-0.5">
                  <AlertCircle className="w-3 h-3" /> "Fail [item]"
                </div>
                <p className="text-slate-400">
                  e.g., "Fail microwave door handle dirty" (scrolls to item & prompts photo)
                </p>
              </div>

              <div className="p-2 rounded-lg bg-slate-950/60 border border-cyan-500/30">
                <div className="font-bold text-cyan-300 mb-0.5">"Note [item] [text]"</div>
                <p className="text-slate-400">
                  e.g., "Note water dispenser refilled sanitizing station"
                </p>
              </div>

              <div className="p-2 rounded-lg bg-slate-950/60 border border-purple-500/30">
                <div className="font-bold text-purple-300 mb-0.5">"What's left?" / "Next section"</div>
                <p className="text-slate-400">
                  Reads out remaining unpassed items or switches to the next shift tab.
                </p>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-800/40 flex items-center justify-between text-[11px] text-purple-200">
              <span>Say <strong>"Submit report"</strong> at any time to jump to final review.</span>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-2 py-0.5 rounded bg-purple-800 text-white font-semibold text-[10px] hover:bg-purple-700 transition"
              >
                Got it
              </button>
            </div>
          </div>
        )}

        {/* Main HUD Capsule */}
        <div
          className={`rounded-2xl border transition-all duration-300 backdrop-blur-xl shadow-2xl ${
            isListening
              ? 'bg-slate-950/95 border-purple-500/60 ring-2 ring-purple-500/30 shadow-purple-950/80'
              : 'bg-slate-900/95 border-slate-800'
          } p-3 sm:p-3.5`}
        >
          <div className="flex items-center justify-between gap-3">
            {/* Primary Mic Trigger & Pulsing Visual Indicator */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                {/* Continuous Pulse Waves when Listening */}
                {isListening && (
                  <>
                    <span className="absolute -inset-1 rounded-full bg-purple-500 opacity-75 animate-ping" />
                    <span className="absolute -inset-2 rounded-full bg-indigo-500/30 animate-pulse" />
                  </>
                )}

                <button
                  onClick={toggleListening}
                  id="voice-mic-toggle-btn"
                  className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg ${
                    isListening
                      ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white ring-2 ring-white/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                  title={isListening ? 'Pause hands-free listening' : 'Start hands-free voice walkthrough'}
                  aria-label="Toggle Voice Walkthrough Assistant"
                >
                  {isListening ? (
                    <Radio className="w-5 h-5 animate-pulse text-white" />
                  ) : (
                    <Mic className="w-5 h-5 text-slate-300" />
                  )}
                </button>
              </div>

              {/* Status Text & Dynamic Hearing Feedback */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      isListening
                        ? isSpeaking
                          ? 'bg-cyan-400 animate-bounce'
                          : 'bg-emerald-400 animate-pulse'
                        : 'bg-slate-500'
                    }`}
                  />
                  <span className="text-xs font-bold text-white truncate">
                    {isListening
                      ? isSpeaking
                        ? 'Speaking Confirmation...'
                        : 'Listening Hands-Free...'
                      : 'Voice Assistant'}
                  </span>
                  {isListening && (
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300 shrink-0">
                      Active
                    </span>
                  )}
                </div>

                {/* Subtitle / Live Transcription */}
                <div className="text-[11px] truncate mt-0.5">
                  {interimTranscript ? (
                    <span className="text-purple-300 italic font-mono">
                      Hearing: "{interimTranscript}"
                    </span>
                  ) : lastFeedback ? (
                    <span className="text-slate-300">
                      {lastFeedback}
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      Tap mic to start walking through {activeShiftName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Action Icons: Sound Mute, Help Drawer, Minimize */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Voice Feedback Audio Mute Toggle */}
              <button
                onClick={toggleSound}
                className={`p-1.5 rounded-lg border text-xs transition ${
                  soundEnabled
                    ? 'bg-slate-800 border-slate-700 text-purple-300 hover:text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
                }`}
                title={soundEnabled ? 'Speech feedback active (tap to mute)' : 'Speech feedback muted (tap to enable)'}
                aria-label="Toggle Voice Audio Feedback"
              >
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Help Cheat Sheet */}
              <button
                onClick={() => setIsHelpOpen((prev) => !prev)}
                className={`p-1.5 rounded-lg border text-xs transition ${
                  isHelpOpen
                    ? 'bg-purple-950 border-purple-600 text-purple-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title="View voice commands cheat sheet"
                aria-label="Voice commands cheat sheet"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>

              {/* Expand / Minimize Toggle */}
              <button
                onClick={() => setIsMinimized((prev) => !prev)}
                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition"
                title={isMinimized ? 'Expand' : 'Collapse'}
                aria-label="Toggle drawer"
              >
                {isMinimized ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Expanded Live Status View */}
          {!isMinimized && isListening && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="text-purple-400 font-semibold">Try:</span>
                <span className="text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  "Pass restrooms"
                </span>
                <span className="text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 hidden sm:inline">
                  "What's left?"
                </span>
              </div>
              {lastTranscript && (
                <div className="truncate max-w-[180px] text-slate-400">
                  Last: <span className="text-white font-mono">"{lastTranscript}"</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
