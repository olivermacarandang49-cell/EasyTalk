import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  RotateCcw,
  Send,
  Sparkles,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Lock,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Keyboard,
  Info,
} from 'lucide-react';
import {
  speakText,
  playTactileClick,
  playSuccessChime,
  triggerHapticFeedback,
} from '../utils/audioUtils';
import { VoiceSettings } from '../types';

interface ListenTranscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceSettings: VoiceSettings;
}

export const ListenTranscribeModal: React.FC<ListenTranscribeModalProps> = ({
  isOpen,
  onClose,
  voiceSettings,
}) => {
  // isListening is strictly controlled by user intent - it NEVER turns off on its own
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [transcriptHistory, setTranscriptHistory] = useState<
    Array<{ id: string; text: string; time: string; fromCompanion?: boolean }>
  >([]);
  const [supported, setSupported] = useState(true);
  const [recLanguage, setRecLanguage] = useState<'tl' | 'en'>(
    voiceSettings.language || 'tl'
  );
  const [customReply, setCustomReply] = useState('');
  const [companionInputText, setCompanionInputText] = useState('');

  // Status & tip states
  const [micPermissionBlocked, setMicPermissionBlocked] = useState(false);
  const [networkIssue, setNetworkIssue] = useState(false);
  const [dismissedNetworkNotice, setDismissedNetworkNotice] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const [audioLevel, setAudioLevel] = useState(0);
  const [micStreamActive, setMicStreamActive] = useState(false);

  // Intent ref: strictly true when user clicked "Start Mic", false ONLY when user clicked "Stop Mic" or closed modal
  const isListeningIntentRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const restartTimeoutRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const scrollEndRef = useRef<HTMLDivElement>(null);

  const isTl = recLanguage === 'tl';

  // Stop microphone stream & visualizer
  const stopAudioStream = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch {
        // ignore
      }
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }
    setMicStreamActive(false);
    setAudioLevel(0);
  }, []);

  // Connect live audio level meter to stream
  const connectAudioVisualizer = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!audioContextRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setAudioLevel(normalized);
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (err) {
      console.warn('Audio visualizer error:', err);
    }
  }, []);

  // Start media stream for live level meter safely
  const startAudioStream = useCallback(async () => {
    if (streamRef.current) return;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        setMicStreamActive(true);
        connectAudioVisualizer(stream);
      }
    } catch {
      // Audio stream is optional; speech recognition will still proceed
    }
  }, [connectAudioVisualizer]);

  // Stop recognition completely - ONLY CALLED WHEN USER INTENTIONALLY STOPS OR CLOSES
  const stopRecognition = useCallback(() => {
    isListeningIntentRef.current = false;
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    stopAudioStream();
    setIsListening(false);
    setInterimTranscript('');
  }, [stopAudioStream]);

  // Launch a continuous SpeechRecognition instance
  const launchRecognitionSession = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = recLanguage === 'tl' ? 'fil-PH' : 'en-US';

      recognition.onstart = () => {
        // Keep listening state on
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            const finalText = item[0].transcript.trim();
            if (finalText) {
              const timeStr = new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });
              setTranscriptHistory((prev) => [
                ...prev,
                { id: `${Date.now()}-${Math.random()}`, text: finalText, time: timeStr },
              ]);
            }
          } else {
            interim += item[0].transcript;
          }
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = (e: any) => {
        console.warn('SpeechRecognition status:', e?.error);

        if (e?.error === 'network') {
          setNetworkIssue(true);
        } else if (e?.error === 'not-allowed') {
          // If mic permission blocked, show notice
          setMicPermissionBlocked(true);
        }

        // CRITICAL: NEVER turn off isListening or cancel intent here!
        // The user wants it to STAY ON unless they manually click stop.
      };

      recognition.onend = () => {
        // Chromium ends recognition after silence or each speech sentence.
        // As long as the user hasn't clicked stop (isListeningIntentRef.current === true),
        // we KEEP isListening=true and restart immediately!
        if (isListeningIntentRef.current) {
          if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
          }
          restartTimeoutRef.current = setTimeout(() => {
            if (isListeningIntentRef.current) {
              launchRecognitionSession();
            }
          }, 150);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Recognition launch notice:', err);
      // Even if start throws (e.g. in preview without cloud speech),
      // we still maintain audio stream and user's ON state!
      if (isListeningIntentRef.current) {
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }
        restartTimeoutRef.current = setTimeout(() => {
          if (isListeningIntentRef.current) {
            launchRecognitionSession();
          }
        }, 1500);
      }
    }
  }, [recLanguage]);

  // Start Mic by User - stays ON continuously until user clicks Stop
  const startRecognitionByUser = useCallback(() => {
    isListeningIntentRef.current = true;
    setIsListening(true);
    setMicPermissionBlocked(false);

    // Keep audio stream active
    startAudioStream();

    // Start recognition session
    launchRecognitionSession();
  }, [launchRecognitionSession, startAudioStream]);

  // Clean up when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopRecognition();
    }
    // Do NOT auto-start on open — wait for user to click "Start Mic" (Bug #2 fix)
    return () => {
      stopRecognition();
    };
  }, [isOpen, stopRecognition]);

  // Toggle button on/off - only user action flips the state
  const toggleListening = () => {
    if (voiceSettings.soundEffects) playTactileClick();
    triggerHapticFeedback(50);

    if (isListening || isListeningIntentRef.current) {
      // User explicitly stopped mic
      stopRecognition();
    } else {
      // User explicitly started mic
      startRecognitionByUser();
    }
  };

  const handleClear = () => {
    if (voiceSettings.soundEffects) playTactileClick();
    setTranscriptHistory([]);
    setInterimTranscript('');
  };

  // Companion types message directly for the deaf person
  const handleCompanionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = companionInputText.trim();
    if (!trimmed) return;

    if (voiceSettings.soundEffects) playSuccessChime();
    triggerHapticFeedback(50);

    const timeStr = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setTranscriptHistory((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        text: trimmed,
        time: timeStr,
        fromCompanion: true,
      },
    ]);
    setCompanionInputText('');
  };

  // Deaf person speaks back to hearing person
  const handleSpeakReply = (textToSpeak: string) => {
    if (!textToSpeak.trim()) return;
    triggerHapticFeedback(50);
    if (voiceSettings.soundEffects) playSuccessChime();

    speakText(textToSpeak, {
      rate: voiceSettings.rate,
      pitch: voiceSettings.pitch,
      volume: voiceSettings.volume,
      voiceURI: voiceSettings.voiceURI,
      language: voiceSettings.language,
      voiceGender: voiceSettings.voiceGender,
    });
  };

  const handleCustomSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customReply.trim()) return;
    handleSpeakReply(customReply);
    setCustomReply('');
  };

  const handleOpenExternal = () => {
    try {
      window.open(window.location.href, '_blank');
    } catch {
      // fallback
    }
  };

  const handleCopyUrl = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptHistory, interimTranscript]);

  if (!isOpen) return null;

  const quickRepliesTl = [
    'Opo, naiintindihan ko po',
    'Pakiulit po nang dahan-dahan',
    'Pakisulat po sa papel',
    'Salamat po nang marami!',
    'Sandali lang po',
    'Magkano po lahat?',
  ];

  const quickRepliesEn = [
    'Yes, I understand',
    'Please repeat slowly',
    'Please write it down',
    'Thank you very much!',
    'Just a moment please',
    'How much is it?',
  ];

  const activeQuickReplies = isTl ? quickRepliesTl : quickRepliesEn;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Live Voice Recorder para sa Bingi"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full p-3.5 sm:p-6 shadow-2xl border-2 border-sky-300 flex flex-col max-h-[95vh] overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-sky-100 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={`p-2 sm:p-2.5 rounded-full ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-[#0F3E76] text-white'
              } shadow-md`}
            >
              <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-[#0F3E76] leading-none">
                  {isTl
                    ? 'Live Speech Recorder para sa Bingi'
                    : 'Live Speech Recorder for Deaf'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#0F3E76] text-[10px] font-extrabold uppercase tracking-wider">
                  Live Captions
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-1">
                {isTl
                  ? 'Nananatiling bukas ang mic hangga\'t hindi mo kini-click ang Stop Mic!'
                  : 'Mic stays open continuously until you click Stop Mic!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Language Toggle for speech recognition */}
            <div className="flex items-center p-0.5 bg-sky-50 rounded-full border border-sky-200">
              <button
                onClick={() => {
                  setRecLanguage('tl');
                  if (recognitionRef.current) {
                    recognitionRef.current.lang = 'fil-PH';
                  }
                }}
                className={`px-2 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                  recLanguage === 'tl'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Makinig sa Tagalog / Filipino"
              >
                🇵🇭 Tagalog
              </button>
              <button
                onClick={() => {
                  setRecLanguage('en');
                  if (recognitionRef.current) {
                    recognitionRef.current.lang = 'en-US';
                  }
                }}
                className={`px-2 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                  recLanguage === 'en'
                    ? 'bg-[#0F3E76] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Listen in English"
              >
                🇺🇸 English
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title={isTl ? 'Isara' : 'Close'}
              aria-label="Close"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Live Status Strip with Audio Level Meter */}
        <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isListening
                  ? 'bg-rose-500 animate-ping'
                  : micStreamActive
                  ? 'bg-emerald-500'
                  : 'bg-slate-400'
              }`}
            />
            <span className="text-xs font-bold text-[#0F3E76]">
              {isListening
                ? isTl
                  ? '🔴 Bukas ang mic (Nakikinig nang tuloy-tuloy)'
                  : '🔴 Mic open (Listening continuously)'
                : isTl
                ? '⚪ Naka-stop ang mic'
                : '⚪ Mic stopped'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Volume Meter Bar */}
            {micStreamActive && (
              <div
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-sky-200"
                title="Live Microphone Volume"
              >
                <span className="text-[10px] font-bold text-slate-500">MIC:</span>
                <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-75 ${
                      audioLevel > 50
                        ? 'bg-rose-500'
                        : audioLevel > 15
                        ? 'bg-emerald-500'
                        : 'bg-sky-400'
                    }`}
                    style={{ width: `${Math.max(6, audioLevel)}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={toggleListening}
              className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 active:scale-95 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>{isTl ? 'Stop Mic' : 'Stop Mic'}</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isTl ? 'Start Mic' : 'Start Mic'}</span>
                </>
              )}
            </button>

            {(transcriptHistory.length > 0 || interimTranscript) && (
              <button
                onClick={handleClear}
                className="p-1 rounded-lg hover:bg-white text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                title={isTl ? 'Burahin ang transcript' : 'Clear transcript'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Informative Top Hint Pill: Clean & Compact */}
        {networkIssue && !dismissedNetworkNotice && (
          <div className="mt-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 text-xs text-amber-900 font-medium">
              <Globe className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {isTl
                  ? 'Nasa IDE preview ka. Para sa microphone speech-to-text, buksan sa Google Chrome:'
                  : 'Running in IDE preview. For microphone speech recognition, open in Google Chrome:'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleOpenExternal}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
              >
                <ExternalLink className="w-3 h-3" />
                <span>{isTl ? 'Buksan sa Chrome' : 'Open in Chrome'}</span>
              </button>
              <button
                onClick={handleCopyUrl}
                className="px-2 py-1 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title="Copy current page URL"
              >
                {copiedUrl ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3 text-amber-700" />
                )}
                <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={() => setDismissedNetworkNotice(true)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
                title="Dismiss tip"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Companion / Speaker Direct Typing Input */}
        <form
          onSubmit={handleCompanionSubmit}
          className="mt-2 flex items-center gap-1.5 bg-blue-50/80 p-1.5 rounded-xl border border-blue-200 shrink-0"
        >
          <div className="flex items-center gap-1 text-[11px] font-bold text-blue-900 shrink-0 px-1">
            <Keyboard className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">
              {isTl ? 'Isulat sa Bingi:' : 'Type for Deaf:'}
            </span>
          </div>
          <input
            type="text"
            value={companionInputText}
            onChange={(e) => setCompanionInputText(e.target.value)}
            onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            placeholder={
              isTl
                ? 'I-type dito ang nais sabihin sa kausap (Pindutin ang Enter)...'
                : 'Type message to display on screen (Press Enter)...'
            }
            className="flex-1 px-2.5 py-1 text-xs bg-white rounded-lg border border-blue-300 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={!companionInputText.trim()}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
              companionInputText.trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-3 h-3" />
            <span>{isTl ? 'Ipakita' : 'Post'}</span>
          </button>
        </form>

        {/* Live Conversation Screen */}
        <div className="mt-2.5 flex-1 min-h-[140px] max-h-[240px] overflow-y-auto p-3.5 sm:p-5 rounded-2xl bg-slate-950 text-white border-2 border-slate-700 flex flex-col justify-start space-y-2.5 font-sans relative select-text">
          {/* True Mic Permission Denied View */}
          {micPermissionBlocked && (
            <div className="my-auto p-4 rounded-2xl bg-rose-950/90 border-2 border-rose-500 text-rose-100 flex flex-col items-center text-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center text-xl">
                <Lock className="w-5 h-5 text-rose-300" />
              </div>
              <div className="max-w-md">
                <h3 className="text-sm font-black text-rose-200">
                  {isTl
                    ? 'Kailangan ang Pahintulot sa Mikropono'
                    : 'Microphone Permission Required'}
                </h3>
                <p className="text-xs text-rose-200/90 mt-1 leading-relaxed">
                  {isTl
                    ? 'Na-block ang mikropono. Pakipindot ang lock 🔒 o site settings sa gilid ng web address bar at gawing "Allow" ang Microphone.'
                    : 'Microphone is blocked. Click the lock 🔒 icon next to your browser URL bar and allow Microphone access.'}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={startRecognitionByUser}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isTl ? 'Subukan Muli' : 'Retry Permission'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Normal Conversation Stream */}
          {!micPermissionBlocked && (
            <>
              {transcriptHistory.length === 0 && !interimTranscript && (
                <div className="my-auto text-center py-6 px-3 flex flex-col items-center">
                  <div className="relative mb-2">
                    <div className="w-12 h-12 rounded-full bg-sky-600/30 animate-ping absolute inset-0" />
                    <div className="w-12 h-12 rounded-full bg-[#0F3E76] text-white flex items-center justify-center text-xl relative shadow-md">
                      🗣️
                    </div>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-sky-200">
                    {isTl ? 'Handa nang makipag-usap' : 'Ready to communicate'}
                  </h3>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                    {isTl
                      ? 'Lilitaw dito ang bawat salitang sasabihin o ita-type ng kausap.'
                      : 'Words spoken or typed by the companion will appear here in real time.'}
                  </p>
                </div>
              )}

              {transcriptHistory.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col rounded-xl p-3 border transition-all ${
                    item.fromCompanion
                      ? 'bg-blue-950/80 border-blue-600/70 shadow-sm'
                      : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-bold flex items-center gap-1 text-sky-400">
                      <span>{item.fromCompanion ? '⌨️ ' : '🗣️ '}</span>
                      <span>{isTl ? 'Kausap:' : 'Speaker:'}</span>
                    </span>
                    <span className="font-mono text-slate-400">{item.time}</span>
                  </div>
                  <p className="text-base sm:text-xl font-bold text-slate-50 leading-snug break-words">
                    {item.text}
                  </p>
                </div>
              ))}

              {interimTranscript && (
                <div className="bg-blue-950/70 border border-blue-500/70 rounded-xl p-2.5 animate-pulse">
                  <span className="text-[10px] text-blue-300 font-bold block mb-1">
                    ⚡ {isTl ? 'Kasalukuyang sinasabi...' : 'Speaking right now...'}
                  </span>
                  <p className="text-base sm:text-2xl font-black text-amber-300 leading-snug">
                    "{interimTranscript}"
                  </p>
                </div>
              )}
              <div ref={scrollEndRef} />
            </>
          )}
        </div>

        {/* Bottom Section: Quick Responses & Text-to-Speech Back to the Speaker */}
        <div className="mt-3 pt-2.5 border-t border-sky-100 flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0F3E76] flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {isTl
                  ? 'Mabilisang Sagot ng Bingi (Pindutin para marinig ng kausap):'
                  : 'Quick Voice Replies (Tap to speak back):'}
              </span>
            </span>
          </div>

          {/* Quick Reply Pills */}
          <div className="flex flex-wrap gap-1.5">
            {activeQuickReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => handleSpeakReply(reply)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 active:scale-95 text-[#0F3E76] text-[11px] sm:text-xs font-bold transition-all cursor-pointer border border-sky-200"
                title={isTl ? 'Magsalita sa kausap' : 'Speak to person'}
              >
                <Volume2 className="w-3 h-3 text-blue-600 shrink-0" />
                <span>{reply}</span>
              </button>
            ))}
          </div>

          {/* Custom Typing Reply Input */}
          <form
            onSubmit={handleCustomSend}
            className="mt-1 flex items-center gap-1.5"
          >
            <input
              type="text"
              value={customReply}
              onChange={(e) => setCustomReply(e.target.value)}
              onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              placeholder={
                isTl
                  ? 'O mag-type ng sariling isasagot sa kausap...'
                  : 'Or type a custom reply to speak aloud...'
              }
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-sky-300 text-xs sm:text-sm font-semibold text-[#0F3E76] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <button
              type="submit"
              disabled={!customReply.trim()}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 text-white transition-all shadow-xs ${
                customReply.trim()
                  ? 'bg-[#0F3E76] hover:bg-[#0A2D57] active:scale-95 cursor-pointer'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-300" />
              <span>{isTl ? 'I-boses' : 'Speak'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
