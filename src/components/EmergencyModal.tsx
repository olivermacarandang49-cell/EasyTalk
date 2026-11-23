import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AlertOctagon,
  X,
  Phone,
  Volume2,
  ShieldAlert,
  HeartPulse,
  Compass,
  AlertTriangle,
  Check,
  PhoneCall,
  Mic,
  MicOff,
} from 'lucide-react';
import {
  speakText,
  isSystemSpeaking,
  playEmergencyAlert,
  playSuccessChime,
  triggerHapticFeedback,
} from '../utils/audioUtils';
import { VoiceSettings } from '../types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceSettings: VoiceSettings;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  voiceSettings,
}) => {
  const [userName, setUserName] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [activeAlertText, setActiveAlertText] = useState('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [micListening, setMicListening] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isListeningIntentRef = useRef<boolean>(false);
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDialingRef = useRef<boolean>(false);
  const lastDialTimeRef = useRef<number>(0);
  const autoDialTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [autoDialCountdown, setAutoDialCountdown] = useState<number | null>(null);

  const isTl = voiceSettings.language === 'tl';

  // Extract dialable phone number from contact field
  const extractPhoneNumber = useCallback((str: string) => {
    const matched = str.match(/[\d+()-]{7,}/);
    return matched ? matched[0].replace(/[^\d+]/g, '') : null;
  }, []);

  const dialableContact = extractPhoneNumber(emergencyContact);

  // Load saved info from localStorage
  useEffect(() => {
    try {
      const savedInfo = localStorage.getItem('easytalk_emergency_info');
      if (savedInfo) {
        const parsed = JSON.parse(savedInfo);
        setUserName(parsed.userName || '');
        setEmergencyContact(parsed.emergencyContact || '');
        setMedicalNotes(parsed.medicalNotes || '');
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  // Dial a telephone number with accessible spoken voice confirmation (strictly 1-time notification guard)
  const handleDial = useCallback(
    (number: string, serviceName: string) => {
      const now = Date.now();
      // Guard against repeated notifications: if already dialing or dialed in the last 6 seconds, ignore duplicate calls!
      if (isDialingRef.current || now - lastDialTimeRef.current < 6000) {
        return;
      }

      isDialingRef.current = true;
      lastDialTimeRef.current = now;

      triggerHapticFeedback([100, 50, 100, 50, 200]);
      playSuccessChime();

      const announce = isTl
        ? `Dina-dial na po ang ${serviceName}. Pakihawakan ang inyong telepono.`
        : `Dialing ${serviceName} now. Please prepare your telephone line.`;

      setStatusMessage(announce);

      // Stop mic recognition temporarily so it doesn't listen to its own TTS voice or duplicate spoken phrases
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      speakText(announce, {
        language: voiceSettings.language,
        voiceGender: voiceSettings.voiceGender,
        rate: 1.05,
        pitch: 1.1,
        volume: 1.0,
      });

      // Launch the system phone dialer via tel:
      try {
        const link = document.createElement('a');
        link.href = `tel:${number}`;
        link.target = '_self';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {
        window.location.href = `tel:${number}`;
      }

      // Re-enable dialing after 6 seconds
      setTimeout(() => {
        isDialingRef.current = false;
      }, 6000);
    },
    [isTl, voiceSettings]
  );

  // Sound siren and speak emergency broadcast
  const handleRepeatAlarm = useCallback(
    (customText?: string) => {
      triggerHapticFeedback([120, 60, 120, 60, 250]);
      playEmergencyAlert();

      const textToSpeak =
        customText ||
        activeAlertText ||
        (isTl
          ? 'Saklolo! Kailangan ko ng agarang tulong at saklolo!'
          : 'Emergency! I need immediate help and assistance!');

      setActiveAlertText(textToSpeak);
      speakText(textToSpeak, {
        language: voiceSettings.language,
        voiceGender: voiceSettings.voiceGender,
        rate: 1.05,
        pitch: 1.15,
        volume: 1.0,
      });
    },
    [activeAlertText, isTl, voiceSettings]
  );

  // Cancel / Close Emergency if user is okay (instant response)
  const handleCancelEmergency = useCallback(() => {
    // 1. Immediately kill any siren or TTS audio
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // 2. Abort speech recognition listener
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
    isListeningIntentRef.current = false;

    triggerHapticFeedback([40, 40]);
    playSuccessChime();

    // Clear auto-dial countdown
    if (autoDialTimerRef.current) {
      clearInterval(autoDialTimerRef.current);
      autoDialTimerRef.current = null;
    }
    setAutoDialCountdown(null);

    // 3. Immediately close modal so user sees instant action
    onClose();

    // 4. Spoken confirmation in the background (sanitized of trigger words)
    const cancelMsg = isTl
      ? 'Kinansela ang alarma. Mabuti at ligtas ka na.'
      : 'Alert cancelled. Glad that you are safe and okay.';

    speakText(cancelMsg, {
      language: voiceSettings.language,
      voiceGender: voiceSettings.voiceGender,
      rate: 1.05,
      pitch: 1.1,
      volume: 1.0,
    });
  }, [isTl, voiceSettings, onClose]);

  // When modal opens, sound siren and speak clear step-by-step instructions for blind users
  useEffect(() => {
    if (isOpen) {
      playEmergencyAlert();

      const initialAlert = isTl
        ? 'Saklolo! Kailangan ko ng agarang tulong at proteksyon!'
        : 'Emergency! I need immediate help and assistance!';
      setActiveAlertText(initialAlert);

      // Spoken voice guide sanitized of all voice recognition trigger words!
      // NEVER say "I'm okay", "Cancel", "Saklolo", "Emergency", or "Call 911" out loud through TTS,
      // otherwise device microphone hears its own speaker and auto-triggers/cancels!
      const spokenInstructions = isTl
        ? 'Aktibo ang pulang alarma. Pindutin ang 1 sa keyboard o pindutan para tumawag, o pindutin ang Escape kapag maayos ka na.'
        : 'Urgent alarm is active. Press 1 to place an urgent call, or press Escape when you are safe.';

      speakText(spokenInstructions, {
        language: voiceSettings.language,
        voiceGender: voiceSettings.voiceGender,
        rate: 1.05,
        pitch: 1.12,
        volume: 1.0,
      });

      // Auto-dial emergency contact after 10s countdown if one is saved and user doesn't cancel
      const savedInfo = (() => {
        try {
          const s = localStorage.getItem('easytalk_emergency_info');
          return s ? JSON.parse(s) : null;
        } catch { return null; }
      })();
      const autoDialNumber = savedInfo?.emergencyContact
        ? savedInfo.emergencyContact.match(/[\d+()-]{7,}/)?.[0]?.replace(/[^\d+]/g, '')
        : null;

      if (autoDialNumber) {
        let countdown = 10;
        setAutoDialCountdown(countdown);
        const tick = setInterval(() => {
          countdown -= 1;
          setAutoDialCountdown(countdown);
          if (countdown <= 0) {
            clearInterval(tick);
            setAutoDialCountdown(null);
            handleDial(autoDialNumber, isTl ? 'Emergency Contact' : 'Emergency Contact');
          }
        }, 1000);
        autoDialTimerRef.current = tick as unknown as NodeJS.Timeout;
      }
    } else {
      // Clear auto-dial when modal closes
      if (autoDialTimerRef.current) {
        clearInterval(autoDialTimerRef.current);
        autoDialTimerRef.current = null;
      }
      setAutoDialCountdown(null);
    }
  }, [isOpen, isTl, voiceSettings.language, voiceSettings.voiceGender, handleDial]);

  // Voice Command Listener inside Emergency Modal (Recognizes "Tawagan ang 911", "Call 911", etc.)
  useEffect(() => {
    if (!isOpen) {
      isListeningIntentRef.current = false;
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
      setMicListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicListening(false);
      return;
    }

    isListeningIntentRef.current = true;

    const startListener = () => {
      if (!isListeningIntentRef.current) return;

      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.lang = isTl ? 'fil-PH' : 'en-US';

        recognition.onstart = () => {
          setMicListening(true);
        };

        recognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0]?.transcript?.trim().toLowerCase() || '';
            if (!transcript) continue;

            // 1. FIRST PRIORITY: CANCEL / I'M OKAY — ALWAYS works, never blocked by TTS guard!
            // If user says they are okay, close SOS immediately regardless of TTS state.
            const isCancelCommand =
              /\b(cancel|kansela|kansel|close|close sos|isara|sara|exit|i'm okay|im okay|i am okay|i'm ok|im ok|i am ok|okay lang ako|ok lang ako|ayos na ako|ligtas na ako|stop alarm|itigil)\b/i.test(
                transcript
              );

            if (isCancelCommand) {
              handleCancelEmergency();
              return;
            }

            // 2. DIALING COMMANDS: Block these while TTS is speaking to prevent phantom calls
            // (e.g. TTS says "nine-one-one" and mic hears it and dials)
            if (isSystemSpeaking()) {
              return;
            }

            if (isDialingRef.current || Date.now() - lastDialTimeRef.current < 6000) {
              return;
            }

            // Guard against self-triggering dialer while device TTS is speaking
            if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
              return;
            }

            // Check for 911 calling command
            if (
              transcript.includes('911') ||
              transcript.includes('nine one one') ||
              transcript.includes('nine-one-one') ||
              transcript.includes('tawagan ang 911') ||
              transcript.includes('tawag 911') ||
              transcript.includes('call 911')
            ) {
              handleDial('911', '911 Emergency');
              return;
            }

            // Check for Red Cross 143 command
            if (
              transcript.includes('143') ||
              transcript.includes('red cross') ||
              transcript.includes('tawag 143') ||
              transcript.includes('tawagan ang red cross')
            ) {
              handleDial('143', 'Philippine Red Cross');
              return;
            }

            // Check for Contact / Family calling command
            if (
              transcript.includes('pamilya') ||
              transcript.includes('nanay') ||
              transcript.includes('tatay') ||
              transcript.includes('kasama') ||
              transcript.includes('contact') ||
              transcript.includes('family') ||
              transcript.includes('call mom') ||
              transcript.includes('call family')
            ) {
              if (dialableContact) {
                handleDial(dialableContact, 'Emergency Contact');
              } else {
                speakText(
                  isTl
                    ? 'Wala pa pong naka-save na numero ng emergency contact.'
                    : 'No emergency contact phone number saved yet.',
                  {
                    language: voiceSettings.language,
                    voiceGender: voiceSettings.voiceGender,
                  }
                );
              }
              return;
            }

            // Check for Alarm repeat command
            if (
              transcript.includes('sirena') ||
              transcript.includes('alarma') ||
              transcript.includes('siren') ||
              transcript.includes('sound alarm')
            ) {
              handleRepeatAlarm();
              return;
            }
          }
        };

        recognition.onerror = () => {
          // Restart on end if still open
        };

        recognition.onend = () => {
          if (isListeningIntentRef.current) {
            restartTimerRef.current = setTimeout(() => {
              startListener();
            }, 600);
          } else {
            setMicListening(false);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch {
        setMicListening(false);
      }
    };

    startListener();

    return () => {
      isListeningIntentRef.current = false;
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [isOpen, isTl, handleDial, dialableContact, handleRepeatAlarm, voiceSettings]);

  // Keyboard navigation hotkeys inside Emergency Modal:
  // Key 1 -> 911
  // Key 2 -> Red Cross 143
  // Key 3 -> Personal Emergency Contact
  // Spacebar -> Sound Siren Alarm
  // Escape -> Close Modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Key 1: Call 911
      if (e.key === '1') {
        e.preventDefault();
        handleDial('911', '911 Emergency Hotline');
      }
      // Key 2: Call Red Cross 143
      else if (e.key === '2') {
        e.preventDefault();
        handleDial('143', 'Philippine Red Cross 143');
      }
      // Key 3: Call Personal Contact
      else if (e.key === '3') {
        e.preventDefault();
        if (dialableContact) {
          handleDial(dialableContact, 'Personal Emergency Contact');
        } else {
          speakText(
            isTl
              ? 'Wala pa pong naka-save na numero ng pamilya o contact.'
              : 'No family emergency contact number saved yet.',
            {
              language: voiceSettings.language,
              voiceGender: voiceSettings.voiceGender,
            }
          );
        }
      }
      // Spacebar: Sound Siren Alarm Again
      else if (e.key === ' ' || e.code === 'Space') {
        // Only trigger if not actively typing in an input
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          handleRepeatAlarm();
        }
      }
      // Escape: Cancel / Close Emergency
      else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancelEmergency();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, handleDial, dialableContact, handleRepeatAlarm, handleCancelEmergency, onClose, isTl, voiceSettings]);

  if (!isOpen) return null;

  const persistInfo = (name: string, contact: string, notes: string) => {
    try {
      localStorage.setItem(
        'easytalk_emergency_info',
        JSON.stringify({ userName: name, emergencyContact: contact, medicalNotes: notes })
      );
      setIsSavedNotice(true);
      setTimeout(() => setIsSavedNotice(false), 2000);
    } catch {
      // Ignore
    }
  };

  const handleNameChange = (val: string) => {
    setUserName(val);
    persistInfo(val, emergencyContact, medicalNotes);
  };

  const handleContactChange = (val: string) => {
    setEmergencyContact(val);
    persistInfo(userName, val, medicalNotes);
  };

  const handleNotesChange = (val: string) => {
    setMedicalNotes(val);
    persistInfo(userName, emergencyContact, val);
  };

  // Quick SOS presets
  const quickSituations = isTl
    ? [
        {
          label: 'Matinding Sakit / Medikal',
          icon: <HeartPulse className="w-4 h-4 text-rose-600" />,
          phrase: 'May masamang nararamdaman sa aking katawan! Kailangan ko ng doktor o nars agad!',
        },
        {
          label: 'Nasa Panganib / Saklolo',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
          phrase: 'Nasa panganib ako! Pakiusap tulungan po ninyo ako agad!',
        },
        {
          label: 'Nahulog / Di Makagalaw',
          icon: <AlertOctagon className="w-4 h-4 text-purple-600" />,
          phrase: 'Nahulog po ako at hindi ako makatayo! Pakiusap tulungan akong makabangon!',
        },
        {
          label: 'Naliligaw / Uuwi',
          icon: <Compass className="w-4 h-4 text-sky-600" />,
          phrase: 'Naliligaw po ako at naguguluhan. Pakitulungan po akong makauwi sa aking pamilya!',
        },
      ]
    : [
        {
          label: 'Medical / Severe Pain',
          icon: <HeartPulse className="w-4 h-4 text-rose-600" />,
          phrase: 'Medical emergency! I am in severe pain and need a doctor or ambulance!',
        },
        {
          label: 'In Danger / Need Help',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
          phrase: 'I am in danger! Please help me immediately!',
        },
        {
          label: 'Fell / Mobility Issue',
          icon: <AlertOctagon className="w-4 h-4 text-purple-600" />,
          phrase: 'I have fallen and cannot get up! Please help me stand or sit safely!',
        },
        {
          label: 'Lost / Need Direction',
          icon: <Compass className="w-4 h-4 text-sky-600" />,
          phrase: 'I am lost and confused. Please help me contact my family or find my way home!',
        },
      ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isTl ? 'Emergency SOS Alarma' : 'Emergency SOS Alert'}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-red-950/80 backdrop-blur-xs select-none animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border-4 border-red-500 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-red-100">
          <div className="flex items-center gap-2.5 text-red-600 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-6 h-6 text-red-600 animate-bounce" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-none text-red-600">
                EMERGENCY SOS
              </h2>
              <p className="text-[11px] text-red-500 font-semibold mt-0.5">
                {isTl
                  ? 'Sabihin ang "Tawagan ang 911" · O sabihin ang "I\'m okay" / "Cancel"'
                  : 'Say aloud "Call 911" · Or say "I\'m okay" / "Cancel"'}
              </p>
            </div>
          </div>
          <button
            onClick={handleCancelEmergency}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Live Mic Voice Command Bar */}
        <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-100 via-rose-50 to-red-100 border border-red-300 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold text-red-900">
            {micListening ? (
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <Mic className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {isTl
                    ? 'Boses Aktibo: Sabihin ang "Tawagan ang 911" o "I\'m okay" / "Cancel"'
                    : 'Voice Mic Active: Say "Call 911" or "I\'m okay" / "Cancel"'}
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-600">
                <MicOff className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  {isTl
                    ? 'Pindutin ang 1 para sa 911 · 2 para sa Red Cross'
                    : 'Press 1 for 911 · Press 2 for Red Cross'}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="mt-2.5 flex-1 overflow-y-auto pr-1 space-y-3.5">
          {/* Big Alert Notice */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-center shadow-xs">
            <p className="text-lg sm:text-xl font-black text-red-700 leading-snug">
              {isTl ? 'KAILANGAN KO NG AGARANG TULONG!' : 'I NEED IMMEDIATE ASSISTANCE!'}
            </p>
            <p className="text-xs text-red-600 mt-1 font-semibold leading-relaxed">
              {activeAlertText}
            </p>
            {statusMessage && (
              <p className="mt-1 text-xs font-bold text-emerald-700 bg-emerald-50 py-1 px-2 rounded-lg inline-block border border-emerald-200">
                {statusMessage}
              </p>
            )}
          </div>

          {/* Auto-dial countdown banner */}
          {autoDialCountdown !== null && (
            <div className="p-3 rounded-2xl bg-amber-50 border-2 border-amber-400 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
                <PhoneCall className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                <span>
                  {isTl
                    ? `Awtomatikong tatawagin ang emergency contact sa loob ng ${autoDialCountdown} segundo...`
                    : `Auto-dialing emergency contact in ${autoDialCountdown} seconds...`}
                </span>
              </div>
              <button
                onClick={() => {
                  if (autoDialTimerRef.current) {
                    clearInterval(autoDialTimerRef.current);
                    autoDialTimerRef.current = null;
                  }
                  setAutoDialCountdown(null);
                }}
                className="px-3 py-1 rounded-full bg-amber-200 hover:bg-amber-300 text-amber-900 font-black text-xs cursor-pointer shrink-0 active:scale-95"
              >
                {isTl ? 'Kanselahin' : 'Cancel'}
              </button>
            </div>
          )}

          {/* Siren Sound Trigger Button */}
          <div className="flex justify-center">
            <button
              onClick={() => handleRepeatAlarm()}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-sm sm:text-base shadow-lg ring-4 ring-red-300 animate-pulse transition-all cursor-pointer"
            >
              <Volume2 className="w-5 h-5 shrink-0" />
              <span>
                {isTl
                  ? 'Patunugin ang Sirena (Pindutin ang Space)'
                  : 'Sound Alarm (Press Space)'}
              </span>
            </button>
          </div>

          {/* One-Tap Emergency Calling Buttons with Hotkeys */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-red-50 to-rose-50/70 border-2 border-red-300 shadow-xs space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-red-900 flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-red-600" />
                <span>
                  {isTl
                    ? 'Direktang Tawag (Pindutin ang 1 o 2 sa keyboard):'
                    : 'Direct Calling (Press 1 or 2 on keyboard):'}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDial('911', '911 Emergency Services')}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs sm:text-sm shadow-md text-center transition-all cursor-pointer border-2 border-white ring-2 ring-red-400"
              >
                <span className="w-6 h-6 rounded-full bg-white text-red-700 font-black text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <Phone className="w-4 h-4" />
                <span>{isTl ? 'Tawagan ang 911' : 'Call 911'}</span>
              </button>

              <button
                onClick={() => handleDial('143', 'Philippine Red Cross 143')}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-rose-700 hover:bg-rose-800 active:scale-95 text-white font-black text-xs sm:text-sm shadow-md text-center transition-all cursor-pointer border-2 border-white ring-2 ring-rose-400"
              >
                <span className="w-6 h-6 rounded-full bg-white text-rose-800 font-black text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <HeartPulse className="w-4 h-4" />
                <span>Red Cross 143</span>
              </button>
            </div>

            {dialableContact && (
              <button
                onClick={() => handleDial(dialableContact, 'Personal Emergency Contact')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm shadow-sm text-center transition-all cursor-pointer"
              >
                <span className="w-5 h-5 rounded-full bg-white text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <Phone className="w-4 h-4" />
                <span>
                  {isTl ? 'Tawagan ang Kasama / Pamilya:' : 'Call Family Contact:'}{' '}
                  {dialableContact}
                </span>
              </button>
            )}
          </div>

          {/* Quick Situation Pills */}
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-600 mb-2">
              {isTl ? 'Piliin ang Uri ng Sitwasyon:' : 'Choose Emergency Type:'}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {quickSituations.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRepeatAlarm(item.phrase)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-red-50/70 border border-slate-200 hover:border-red-300 transition-all text-left cursor-pointer active:scale-95"
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Medical & Contact Details Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <div className="flex items-center gap-1.5 uppercase text-[#0F3E76]">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>
                  {isTl ? 'Kard ng Impormasyon sa Emergency' : 'Emergency Card Information'}
                </span>
              </div>
              {isSavedNotice && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Check className="w-3 h-3" />
                  {isTl ? 'Nai-save!' : 'Auto-saved!'}
                </span>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                {isTl ? 'Aking Pangalan (Name):' : 'My Name:'}
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => handleNameChange(e.target.value)}
                onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                placeholder={isTl ? 'Hal. Juan Dela Cruz' : 'e.g. Alex Smith'}
                className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                {isTl
                  ? 'Pangalan at Numero ng Emergency Contact (Pindutin ang 3 para tawagan):'
                  : 'Emergency Contact Name & Phone (Press 3 to call):'}
              </label>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="tel"
                  value={emergencyContact}
                  onChange={(e) => handleContactChange(e.target.value)}
                  placeholder={isTl ? 'Hal. Nanay: 0917-123-4567' : 'e.g. Mom: (0917) 123-4567'}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
                  inputMode="tel"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                {isTl ? 'Medikal na Kondisyon / Paalala:' : 'Important Medical Alerts / Conditions:'}
              </label>
              <input
                type="text"
                value={medicalNotes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder={
                  isTl
                    ? 'Hal. Non-verbal, May hika, Alerdyik sa Penicillin'
                    : 'e.g. Non-verbal, Diabetic, Allergic to Penicillin'
                }
                className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          </div>
        </div>

        {/* Bottom Button */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleCancelEmergency}
            className="w-full py-2.5 rounded-full bg-slate-900 hover:bg-black text-white font-black text-xs sm:text-sm shadow-md transition-colors cursor-pointer active:scale-98"
          >
            {isTl
              ? 'Ligtas na Ako / I-cancel ang SOS (Sabihin ang "I\'m okay" o "Cancel")'
              : 'I Am Okay / Cancel SOS (Say "I\'m okay" or "Cancel")'}
          </button>
        </div>
      </div>
    </div>
  );
};
