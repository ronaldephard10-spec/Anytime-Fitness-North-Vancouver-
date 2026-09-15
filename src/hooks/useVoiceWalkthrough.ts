import { useState, useEffect, useRef, useCallback } from 'react';
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  parseSpeechCommand,
  speakConfirmation,
  VoiceAction,
} from '../utils/voiceAssistant';
import { InspectionItem, ItemEvaluation, ActiveTab } from '../types/inspection';

interface UseVoiceWalkthroughProps {
  activeItems: InspectionItem[];
  evaluations: Record<string, ItemEvaluation>;
  onUpdateStatus: (itemId: string, status: 'pass' | 'fail' | 'na') => void;
  onUpdateNotes: (itemId: string, notes: string) => void;
  onPassAll: () => void;
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  compliancePercentage: number;
}

export interface VoiceWalkthroughState {
  isSupported: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  interimTranscript: string;
  lastTranscript: string;
  lastFeedback: string;
  error: string | null;
  soundEnabled: boolean;
  toggleListening: () => void;
  toggleSound: () => void;
  clearError: () => void;
}

export const useVoiceWalkthrough = ({
  activeItems,
  evaluations,
  onUpdateStatus,
  onUpdateNotes,
  onPassAll,
  activeTab,
  onChangeTab,
  compliancePercentage,
}: UseVoiceWalkthroughProps): VoiceWalkthroughState => {
  const isSupported = isSpeechRecognitionSupported();

  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [lastTranscript, setLastTranscript] = useState<string>('');
  const [lastFeedback, setLastFeedback] = useState<string>('Voice assistant ready. Tap microphone to start.');
  const [error, setError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('afnv_voice_sound');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);
  const restartTimeoutRef = useRef<any>(null);

  // Sync refs to avoid stale closures in callbacks
  isListeningRef.current = isListening;
  isSpeakingRef.current = isSpeaking;

  // Speak feedback helper respecting soundEnabled state and avoiding self-pickup
  const speak = useCallback(
    (text: string) => {
      if (!soundEnabled) return;
      setIsSpeaking(true);
      isSpeakingRef.current = true;

      speakConfirmation(
        text,
        () => {
          setIsSpeaking(true);
          isSpeakingRef.current = true;
        },
        () => {
          // Delay clearing speaking flag slightly to let room echo settle
          setTimeout(() => {
            setIsSpeaking(false);
            isSpeakingRef.current = false;
          }, 300);
        }
      );
    },
    [soundEnabled]
  );

  // Process a recognized command
  const executeCommand = useCallback(
    (action: VoiceAction) => {
      switch (action.type) {
        case 'PASS_ITEM': {
          onUpdateStatus(action.item.id, 'pass');
          const shortName = action.item.name;
          const newFeedback = `${shortName} passed.`;
          setLastFeedback(newFeedback);

          // Check if this completes the inspection
          let remainingPendingOrFailed = 0;
          activeItems.forEach((i) => {
            const status = i.id === action.item.id ? 'pass' : (evaluations[i.id]?.status || 'pending');
            if (status !== 'pass' && status !== 'na') {
              remainingPendingOrFailed++;
            }
          });

          if (remainingPendingOrFailed === 0) {
            speak(`${shortName} passed. Inspection 100% complete.`);
          } else {
            speak(`${shortName} passed.`);
          }
          break;
        }

        case 'FAIL_ITEM': {
          onUpdateStatus(action.item.id, 'fail');
          if (action.notes) {
            onUpdateNotes(action.item.id, action.notes);
          }
          const shortName = action.item.name;
          const feedbackMsg = `${shortName} marked fail. Please take a photo.`;
          setLastFeedback(feedbackMsg);
          speak(feedbackMsg);

          // Smoothly scroll to the failed item on the screen so Ronald can see it
          const el =
            document.getElementById(`checklist-item-${action.item.id}`) ||
            document.getElementById(`item-${action.item.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          break;
        }

        case 'NOTE_ITEM': {
          onUpdateNotes(action.item.id, action.notes);
          const shortName = action.item.name;
          const feedbackMsg = `Note added to ${shortName}: "${action.notes}"`;
          setLastFeedback(feedbackMsg);
          speak(`Note added to ${shortName}.`);
          break;
        }

        case 'WHATS_LEFT': {
          const uncompleted = activeItems.filter((i) => {
            const st = evaluations[i.id]?.status;
            return st !== 'pass' && st !== 'na';
          });

          if (uncompleted.length === 0) {
            const msg = `All ${activeItems.length} items completed. Inspection 100% complete.`;
            setLastFeedback(msg);
            speak(msg);
          } else {
            const sampleNames = uncompleted.slice(0, 3).map((i) => i.name).join(', ');
            const remainingCount = uncompleted.length;
            const extra = remainingCount > 3 ? ` and ${remainingCount - 3} more` : '';
            const msg = `${remainingCount} item${remainingCount === 1 ? '' : 's'} remaining: ${sampleNames}${extra}.`;
            setLastFeedback(msg);
            speak(msg);
          }
          break;
        }

        case 'NEXT_SECTION': {
          const tabOrder: ActiveTab[] = ['sunday', 'tuesday', 'thursday'];
          const currentIndex = tabOrder.indexOf(activeTab);
          const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % tabOrder.length;
          const nextTab = tabOrder[nextIndex];
          onChangeTab(nextTab);

          const tabLabel = `${nextTab.charAt(0).toUpperCase() + nextTab.slice(1)} Shift`;
          const msg = `Switched to ${tabLabel}.`;
          setLastFeedback(msg);
          speak(msg);
          break;
        }

        case 'SUBMIT_REPORT': {
          const msg = 'Navigating to report submission. Ready to certify and dispatch.';
          setLastFeedback(msg);
          speak(msg);

          const submissionEl = document.getElementById('submission-section');
          if (submissionEl) {
            submissionEl.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          }
          break;
        }

        case 'PASS_ALL': {
          onPassAll();
          const msg = 'All shift items marked passed. Inspection 100% complete.';
          setLastFeedback(msg);
          speak(msg);
          break;
        }

        case 'UNKNOWN':
        default: {
          const msg = `Command not recognized: "${action.rawText}". Try: "Pass [item]", "Fail [item]", "What's left?", or "Submit report".`;
          setLastFeedback(msg);
          break;
        }
      }
    },
    [
      activeItems,
      evaluations,
      onUpdateStatus,
      onUpdateNotes,
      onPassAll,
      activeTab,
      onChangeTab,
      speak,
    ]
  );

  // Initialize SpeechRecognition instance
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setError(null);
    };

    recognition.onresult = (event: any) => {
      // If the synthesizer is currently speaking audio feedback, ignore input to prevent echo
      if (isSpeakingRef.current) return;

      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        const text = result[0]?.transcript || '';

        if (result.isFinal) {
          const finalClean = text.trim();
          if (finalClean) {
            setLastTranscript(finalClean);
            setInterimTranscript('');
            const action = parseSpeechCommand(finalClean, activeItems);
            executeCommand(action);
          }
        } else {
          interim += text;
        }
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error event:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('Microphone permission denied. Please allow microphone access in browser settings.');
        setIsListening(false);
        isListeningRef.current = false;
      } else if (event.error === 'no-speech') {
        // Normal occurrence when user pauses - continuous loop handles it
      } else if (event.error === 'audio-capture') {
        setError('No microphone detected. Please verify microphone hardware.');
        setIsListening(false);
        isListeningRef.current = false;
      }
    };

    recognition.onend = () => {
      // Auto-restart if listening is still intended (phone speech pause recovery)
      if (isListeningRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
          if (isListeningRef.current) {
            try {
              recognition.start();
            } catch (e) {
              // already started or transitioning
            }
          }
        }, 150);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      clearTimeout(restartTimeoutRef.current);
      try {
        recognition.abort();
      } catch {}
    };
  }, [isSupported, activeItems, executeCommand]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (!isSupported) {
      setError('Web Speech recognition is not supported on this browser. Try Chrome, Safari, or Edge.');
      return;
    }

    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      // Stop listening
      isListeningRef.current = false;
      setIsListening(false);
      clearTimeout(restartTimeoutRef.current);
      try {
        recognition.stop();
      } catch {}
      setLastFeedback('Voice assistant paused.');
    } else {
      // Start listening
      setError(null);
      isListeningRef.current = true;
      setIsListening(true);
      setLastFeedback('Listening hands-free... Say "Pass [item]", "Fail [item]", or "What\'s left?"');
      try {
        recognition.start();
      } catch (err: any) {
        if (err?.name !== 'InvalidStateError') {
          console.warn('Recognition start error:', err);
        }
      }
      speak('Voice walkthrough active. I am listening.');
    }
  }, [isListening, isSupported, speak]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('afnv_voice_sound', String(next));
      return next;
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
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
  };
};
