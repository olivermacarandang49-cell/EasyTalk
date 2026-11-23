/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DisabilityConditionId, VoiceSettings, UserRoleMode, AppLanguage } from './types';
import {
  CONDITIONS_DATA,
  CONDITIONS_DATA_TL,
  CORE_QUICK_MESSAGES,
  CORE_QUICK_MESSAGES_TL,
} from './data/conditionsData';
import { Header } from './components/Header';
import { ConditionSelector } from './components/ConditionSelector';
import { ConditionDetailPanel } from './components/ConditionDetailPanel';
import { MessageGrid } from './components/MessageGrid';
import { SpeakPanel } from './components/SpeakPanel';
import { Footer } from './components/Footer';
import { FullScreenMessageModal } from './components/FullScreenMessageModal';
import { CustomMessageModal } from './components/CustomMessageModal';
import { AccessibilitySettingsModal } from './components/AccessibilitySettingsModal';
import { TipsModal } from './components/TipsModal';
import { ListenTranscribeModal } from './components/ListenTranscribeModal';
import { EmergencyModal } from './components/EmergencyModal';
import { LoadingScreen } from './components/LoadingScreen';
import { BlindTouchPadModal } from './components/BlindTouchPadModal';
import { AccessGateScreen } from './components/AccessGateScreen';
import { AboutModal } from './components/AboutModal';

import {
  playTactileClick,
  playSuccessChime,
  playCardSound,
  playConditionTone,
  triggerHapticFeedback,
  speakText,
} from './utils/audioUtils';

const DEFAULT_SETTINGS: VoiceSettings = {
  language: 'en',
  voiceGender: 'male',
  rate: 0.98,
  pitch: 0.92,
  volume: 1.0,
  voiceURI: '',
  autoSpeakOnSelect: false,
  hapticFeedback: true,
  soundEffects: true,
  fontSize: 'normal',
  highContrast: false,
  autoScanEnabled: false,
  autoScanInterval: 2.5,
};

export default function App() {
  // Current active condition (defaults to 'deafness' for main board)
  const [selectedConditionId, setSelectedConditionId] = useState<DisabilityConditionId>('deafness');

  // Two-way communicator role: 'pwd' (PWD speaking) or 'companion' (normal person speaking to a PWD)
  const [userRole, setUserRole] = useState<UserRoleMode>('pwd');

  // Currently selected message (defaults to 'Kailangan ko ng tulong' in Tagalog mode)
  const [selectedMessage, setSelectedMessage] = useState<string>('I need assistance');

  // Voice & Accessibility settings in localStorage
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    try {
      const stored = localStorage.getItem('easytalk_voice_settings');
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  // Sync settings to localStorage
  const handleUpdateSettings = useCallback((newPartial: Partial<VoiceSettings>) => {
    setVoiceSettings((prev) => {
      const updated = { ...prev, ...newPartial };
      try {
        localStorage.setItem('easytalk_voice_settings', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // Full bidirectional message translation maps for language switching (Bug #9 fix)
  const EN_TO_TL_MAP: Record<string, string> = {
    'I need assistance': 'Kailangan ko ng tulong',
    'I want food': 'Gusto kong kumain',
    'I need water': 'Kailangan ko ng tubig',
    'I feel unwell': 'Masama ang pakiramdam ko',
    'I want to go home': 'Gusto ko nang umuwi',
    'Custom Message': 'Sariling Mensahe',
    'How can I assist you?': 'Paano kita matutulungan?',
    'Would you like some food?': 'Gusto mo bang kumain?',
    'Would you like a drink of water?': 'Gusto mo bang uminom ng tubig?',
    'Are you feeling unwell or in pain?': 'Masama ba ang pakiramdam mo o may masakit?',
    'Would you like to go home or rest?': 'Gusto mo na bang umuwi o magpahinga?',
  };
  const TL_TO_EN_MAP: Record<string, string> = Object.fromEntries(
    Object.entries(EN_TO_TL_MAP).map(([en, tl]) => [tl, en])
  );

  const handleToggleLanguage = useCallback((newLang: AppLanguage) => {
    const newGender = newLang === 'tl' ? 'female' : 'male';
    const newPitch = newLang === 'tl' ? 1.16 : 0.92;
    handleUpdateSettings({ language: newLang, voiceGender: newGender, pitch: newPitch });
    triggerHapticFeedback(50);
    playSuccessChime();
    if (newLang === 'tl') {
      setSelectedMessage((prev) => {
        if (!prev) return 'Kailangan ko ng tulong';
        return EN_TO_TL_MAP[prev] ?? prev;
      });
      speakText('Naka-on na ang Tagalog mode. Boses ng babae ang magsasalita.', {
        language: 'tl',
        voiceGender: 'female',
        rate: voiceSettings.rate,
        pitch: 1.16,
        volume: voiceSettings.volume,
        voiceURI: voiceSettings.voiceURI,
      });
    } else {
      setSelectedMessage((prev) => {
        if (!prev) return 'I need assistance';
        return TL_TO_EN_MAP[prev] ?? prev;
      });
      speakText('English mode enabled. Male voice is now speaking.', {
        language: 'en',
        voiceGender: 'male',
        rate: voiceSettings.rate,
        pitch: 0.92,
        volume: voiceSettings.volume,
        voiceURI: voiceSettings.voiceURI,
      });
    }
  }, [handleUpdateSettings, voiceSettings]);

  const handleToggleUserRole = useCallback((newRole: UserRoleMode) => {
    setUserRole(newRole);
    triggerHapticFeedback(50);
    const isTl = voiceSettings.language === 'tl';
    if (newRole === 'companion') {
      const phrase = isTl ? 'Paano kita matutulungan?' : 'How can I assist you?';
      setSelectedMessage(phrase);
      speakText(
        isTl
          ? 'Aktibo ang Companion Mode. Maaari ka nang pumili ng mensahe para sa may kapansanan.'
          : 'Companion Mode active. You can now choose phrases to speak or show to a person with a disability.',
        {
          language: voiceSettings.language,
          voiceGender: voiceSettings.voiceGender,
          rate: voiceSettings.rate,
          pitch: voiceSettings.pitch,
          volume: voiceSettings.volume,
          voiceURI: voiceSettings.voiceURI,
        }
      );
    } else {
      const phrase = isTl ? 'Kailangan ko ng tulong' : 'I need assistance';
      setSelectedMessage(phrase);
      speakText(
        isTl
          ? 'Aktibo ang PWD Mode. Pindutin ang iyong kailangan para magsalita.'
          : 'PWD Speaker Mode active. Tap your needs to speak aloud.',
        {
          language: voiceSettings.language,
          voiceGender: voiceSettings.voiceGender,
          rate: voiceSettings.rate,
          pitch: voiceSettings.pitch,
          volume: voiceSettings.volume,
          voiceURI: voiceSettings.voiceURI,
        }
      );
    }
  }, [voiceSettings]);

  // Initial app loading screen & mode entrance gate
  const [isLoading, setIsLoading] = useState(true);
  const [showAccessGate, setShowAccessGate] = useState(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [isListenOpen, setIsListenOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isBlindTouchPadOpen, setIsBlindTouchPadOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  // Track if the SOS was triggered FROM blind mode — so when it closes,
  // we return to the main board instead of back to Blind Touch Pad.
  const [sosTriggeredFromBlind, setSosTriggeredFromBlind] = useState(false);

  // Directly request browser microphone permission on click so prompt appears automatically
  const handleOpenListenTranscribe = useCallback(async () => {
    setIsListenOpen(true);
    triggerHapticFeedback(50);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (err) {
      console.warn('Microphone permission request on click:', err);
    }
  }, []);

  // User's custom saved phrases in localStorage
  const [savedPhrases, setSavedPhrases] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('easytalk_saved_phrases');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [
      'Please call my assistant',
      'Where is the elevator?',
      'I need a few minutes',
    ];
  });

  // Switch access / auto scan index
  const [activeScanIndex, setActiveScanIndex] = useState<number>(-1);
  // Save new phrase to localStorage
  const handleSavePhrase = useCallback((text: string) => {
    setSavedPhrases((prev) => {
      const updated = [text, ...prev.filter((p) => p !== text)];
      try {
        localStorage.setItem('easytalk_saved_phrases', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // ── BLIND MODE CLOSE — announce exit + open short window to return via voice ──
  const [blindReturnWindowOpen, setBlindReturnWindowOpen] = useState(false);
  const blindReturnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBlindModeClose = useCallback(() => {
    setIsBlindTouchPadOpen(false);
    const isTl = voiceSettings.language === 'tl';
    speakText(
      isTl
        ? 'Lumabas sa Blind Mode. Sabihin ang Bulag sa loob ng sampung segundo para bumalik.'
        : 'Exited Blind Mode. Say Blind within ten seconds to return.',
      {
        language: voiceSettings.language,
        voiceGender: voiceSettings.voiceGender,
        rate: voiceSettings.rate,
        pitch: voiceSettings.pitch,
        volume: voiceSettings.volume,
        voiceURI: voiceSettings.voiceURI,
      }
    );
    // Open a 10-second return window
    setBlindReturnWindowOpen(true);
    if (blindReturnTimerRef.current) clearTimeout(blindReturnTimerRef.current);
    blindReturnTimerRef.current = setTimeout(() => {
      setBlindReturnWindowOpen(false);
    }, 10000);
  }, [voiceSettings]);

  // ── BLIND RETURN VOICE LISTENER — only active for 10s after exiting Blind Mode ──
  useEffect(() => {
    if (!blindReturnWindowOpen || isBlindTouchPadOpen || isLoading || showAccessGate) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    let recognition: any = null;

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.lang = voiceSettings.language === 'tl' ? 'fil-PH' : 'en-US';

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (!event.results[i].isFinal) continue;
          const transcript = event.results[i][0]?.transcript?.trim().toLowerCase() || '';
          if (!transcript) continue;
          if (/\b(blind|bulag)\b/i.test(transcript)) {
            setBlindReturnWindowOpen(false);
            if (blindReturnTimerRef.current) clearTimeout(blindReturnTimerRef.current);
            setSelectedConditionId('blindness');
            setIsBlindTouchPadOpen(true);
            return;
          }
        }
      };

      recognition.onerror = () => { /* ignore */ };
      recognition.onend = () => { /* window closes on timeout, not on recognition end */ };
      recognition.start();
    } catch { /* ignore */ }

    return () => {
      if (recognition) {
        try {
          recognition.onend = null;
          recognition.onerror = null;
          recognition.abort();
        } catch { /* ignore */ }
      }
    };
  }, [blindReturnWindowOpen, isBlindTouchPadOpen, isLoading, showAccessGate, voiceSettings.language]);

  // Delete phrase from localStorage
  const handleDeletePhrase = useCallback((index: number) => {
    setSavedPhrases((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      try {
        localStorage.setItem('easytalk_saved_phrases', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // Play spoken audio guide for blind users
  const playEyesClosedAudioGuide = useCallback(() => {
    triggerHapticFeedback([50, 50, 100]);
    playSuccessChime();
    const isTl = voiceSettings.language === 'tl';
    const guideText = isTl
      ? 'Gabay sa boses para sa may kapansanan sa paningin. Pindutin ang numero 1 para sa Tulong. Pindutin ang 2 para sa Pagkain. Pindutin ang 3 para sa Tubig. Pindutin ang 4 kapag Masama ang Pakiramdam. Pindutin ang 5 para Umuwi. Pindutin ang 6 para sa Sariling Mensahe. Pindutin ang Spacebar anumang oras upang marinig muli ang mensahe.'
      : 'Audio Guide for Blind Accessibility. Press number 1 on your keyboard for Assistance. Press 2 for Food. Press 3 for Water. Press 4 for Unwell. Press 5 for Home. Press 6 for Custom Message. Press Spacebar anytime to repeat your message. Tapping any card also speaks it aloud immediately.';

    speakText(guideText, {
      rate: voiceSettings.rate,
      pitch: voiceSettings.pitch,
      volume: voiceSettings.volume,
      voiceURI: voiceSettings.voiceURI,
      language: voiceSettings.language,
      voiceGender: voiceSettings.voiceGender,
    });
  }, [voiceSettings]);

  // Selection handler for messages
  const handleSelectMessage = useCallback(
    (text: string, iconName?: string) => {
      setSelectedMessage(text);
      triggerHapticFeedback(45);

      if (voiceSettings.soundEffects) {
        if (iconName) {
          playCardSound(iconName);
        } else {
          playTactileClick();
        }
      }

      // Automatically speak on select when in Blind mode or if autoSpeak is enabled
      const shouldSpeakNow = selectedConditionId === 'blindness' || voiceSettings.autoSpeakOnSelect;
      if (shouldSpeakNow) {
        speakText(text, {
          rate: voiceSettings.rate,
          pitch: voiceSettings.pitch,
          volume: voiceSettings.volume,
          voiceURI: voiceSettings.voiceURI,
          language: voiceSettings.language,
          voiceGender: voiceSettings.voiceGender,
        });
      }
    },
    [selectedConditionId, voiceSettings]
  );

  // Selection handler for condition
  const handleSelectCondition = useCallback(
    (id: DisabilityConditionId) => {
      setSelectedConditionId(id);
      triggerHapticFeedback(50);
      if (voiceSettings.soundEffects) {
        playConditionTone(id);
      }
      if (id === 'blindness') {
        const isTl = voiceSettings.language === 'tl';
        const blindText = isTl
          ? 'Aktibo ang Blind Audio Mode. Lahat ng pindutan ay awtomatikong magsasalita. Pindutin ang 1 hanggang 6 sa keyboard o i-tap ang screen.'
          : 'Blind Mode active. Every button will now speak aloud automatically. Press numbers 1 to 6 on your keyboard or tap the screen.';

        speakText(blindText, {
          rate: voiceSettings.rate,
          pitch: voiceSettings.pitch,
          volume: voiceSettings.volume,
          voiceURI: voiceSettings.voiceURI,
          language: voiceSettings.language,
          voiceGender: voiceSettings.voiceGender,
        });
      }
    },
    [voiceSettings]
  );

  // Auto-scan cycle effect for switch access users
  useEffect(() => {
    if (!voiceSettings.autoScanEnabled) {
      setActiveScanIndex(-1);
      return;
    }

    const interval = setInterval(() => {
      setActiveScanIndex((prev) => (prev + 1) % 6);
    }, voiceSettings.autoScanInterval * 1000);

    return () => clearInterval(interval);
  }, [voiceSettings.autoScanEnabled, voiceSettings.autoScanInterval]);

  // Keyboard accessibility listeners (1-6 for quick cards, Space to speak, H for audio guide, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading || showAccessGate) {
        return;
      }

      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toLowerCase();

      const isSpace =
        e.keyCode === 32 ||
        e.code === 'Space' ||
        e.key === ' ' ||
        e.key === 'Space' ||
        e.key === 'Spacebar';

      const isEnter =
        e.keyCode === 13 ||
        e.code === 'Enter' ||
        e.code === 'NumpadEnter' ||
        e.key === 'Enter';

      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsTipsOpen(false);
        setIsCustomModalOpen(false);
        setIsFullScreenOpen(false);
        setIsListenOpen(false);
        setIsEmergencyOpen(false);
        if (isBlindTouchPadOpen) {
          handleBlindModeClose();
        } else {
          setIsBlindTouchPadOpen(false);
        }
        setIsAboutOpen(false);
      } else if (e.key === 'Backspace') {
        // Only navigate back to gate when no interactive element is focused
        // (prevents accidental trigger while focus is on a button/link/select)
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'button' || tag === 'select' || tag === 'a') {
          return;
        }
        e.preventDefault();
        setShowAccessGate(true);
      } else if (key === 't' || key === 'b') {
        e.preventDefault();
        setIsBlindTouchPadOpen((prev) => !prev);
      } else if (isSpace || isEnter) {
        // Spacebar or Enter speaks current message
        e.preventDefault();
        e.stopPropagation();
        triggerHapticFeedback(50);
        const phraseToSpeak = selectedMessage || 'I need assistance';
        if (voiceSettings.soundEffects) {
          playSuccessChime();
        }
        speakText(phraseToSpeak, {
          rate: voiceSettings.rate,
          pitch: voiceSettings.pitch,
          volume: voiceSettings.volume,
          voiceURI: voiceSettings.voiceURI,
          language: voiceSettings.language,
          voiceGender: voiceSettings.voiceGender,
        });
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const activeCoreList = voiceSettings.language === 'tl' ? CORE_QUICK_MESSAGES_TL : CORE_QUICK_MESSAGES;
        const currentIndex = activeCoreList.findIndex((m) => m.text === selectedMessage);
        const nextIndex = (currentIndex + 1) % activeCoreList.length;
        const nextItem = activeCoreList[nextIndex];
        handleSelectMessage(nextItem.text, nextItem.iconName);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const activeCoreList = voiceSettings.language === 'tl' ? CORE_QUICK_MESSAGES_TL : CORE_QUICK_MESSAGES;
        const currentIndex = activeCoreList.findIndex((m) => m.text === selectedMessage);
        const prevIndex = (currentIndex - 1 + activeCoreList.length) % activeCoreList.length;
        const prevItem = activeCoreList[prevIndex];
        handleSelectMessage(prevItem.text, prevItem.iconName);
      } else if (key === 'h' || key === '?') {
        // Audio help guide
        e.preventDefault();
        playEyesClosedAudioGuide();
      } else if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        const activeCoreList = voiceSettings.language === 'tl' ? CORE_QUICK_MESSAGES_TL : CORE_QUICK_MESSAGES;
        const index = parseInt(e.key, 10) - 1;
        if (index >= 0 && index < activeCoreList.length) {
          const item = activeCoreList[index];
          if (item.text === 'Custom Message' || item.text === 'Sariling Mensahe') {
            triggerHapticFeedback(50);
            playCardSound('custom');
            speakText(item.text, {
              rate: voiceSettings.rate,
              pitch: voiceSettings.pitch,
              volume: voiceSettings.volume,
              voiceURI: voiceSettings.voiceURI,
              language: voiceSettings.language,
              voiceGender: voiceSettings.voiceGender,
            });
            setIsCustomModalOpen(true);
          } else {
            handleSelectMessage(item.text, item.iconName);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isLoading, showAccessGate, selectedMessage, voiceSettings, handleSelectMessage, playEyesClosedAudioGuide]);

  const activeCondition = useMemo(() => {
    const dataSource = voiceSettings.language === 'tl' ? CONDITIONS_DATA_TL : CONDITIONS_DATA;
    return dataSource[selectedConditionId] || dataSource.deafness;
  }, [selectedConditionId, voiceSettings.language]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleHomeClick = () => {
    setSelectedConditionId('deafness');
    setSelectedMessage(voiceSettings.language === 'tl' ? 'Kailangan ko ng tulong' : 'I need assistance');
    if (voiceSettings.soundEffects) playSuccessChime();
  };

  return (
    <div
      className={`min-h-screen w-full max-w-full overflow-x-hidden flex flex-col justify-between transition-colors duration-200 ${
        voiceSettings.highContrast
          ? 'bg-slate-900 text-white'
          : 'bg-gradient-to-b from-[#EBF5FB] via-[#F4F9FD] to-[#E3EFFB] text-slate-800'
      } ${
        voiceSettings.fontSize === 'large'
          ? 'text-lg'
          : voiceSettings.fontSize === 'xlarge'
          ? 'text-xl'
          : 'text-base'
      }`}
    >
      {/* Top Header matching reference */}
      <Header
        onHomeClick={handleHomeClick}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTips={() => setIsTipsOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onEmergencySOS={() => setIsEmergencyOpen(true)}
        onToggleFullscreen={toggleFullscreen}
        soundEnabled={voiceSettings.soundEffects}
        onToggleSound={() =>
          handleUpdateSettings({ soundEffects: !voiceSettings.soundEffects })
        }
        userRole={userRole}
        onToggleUserRole={handleToggleUserRole}
        currentLanguage={voiceSettings.language}
        onToggleLanguage={handleToggleLanguage}
        onBackToGate={() => setShowAccessGate(true)}
      />

      {/* Main App Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-1.5 sm:px-6 md:px-8 py-1 sm:py-4 flex flex-col gap-1.5 sm:gap-4 justify-between">
        {/* Section 1: Condition Selector (Row of 5 Cards on desktop; compact strip on mobile) */}
        <ConditionSelector
          selectedCondition={selectedConditionId}
          onSelectCondition={handleSelectCondition}
          language={voiceSettings.language}
        />

        {/* Section 2: Main Interactive Communication Center matching bottom section of screenshot */}
        <section
          className={`w-full rounded-xl sm:rounded-3xl p-1.5 sm:p-5 lg:p-6 transition-all duration-200 border sm:border-[3px] shadow-sm flex-1 flex flex-col justify-between ${
            voiceSettings.highContrast
              ? 'bg-slate-800 border-sky-400 text-white'
              : 'bg-white/95 border-sky-300 shadow-sky-900/5'
          }`}
          aria-label="Communication Board"
        >
          {/* 3-Column Responsive Grid matching screenshot on desktop; tight 3-row layout on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-4 lg:gap-6 items-stretch flex-1">
            {/* Left Column: Condition Info & Character Speech Bubble (approx 3 cols) */}
            <div className="md:col-span-4 lg:col-span-3 min-w-0">
              <ConditionDetailPanel
                condition={activeCondition}
                onOpenTips={() => setIsTipsOpen(true)}
                userRole={userRole}
                language={voiceSettings.language}
                onOpenListenTranscribe={handleOpenListenTranscribe}
              />
            </div>

            {/* Middle Column: 6 Quick Communication Phrase Cards (approx 5-6 cols) */}
            <div className="md:col-span-5 lg:col-span-6 min-w-0 flex-1">
              <MessageGrid
                currentMessage={selectedMessage}
                onSelectMessage={handleSelectMessage}
                onOpenCustomModal={() => setIsCustomModalOpen(true)}
                condition={activeCondition}
                savedCustomPhrases={savedPhrases}
                activeScanIndex={activeScanIndex}
                userRole={userRole}
                language={voiceSettings.language}
                onOpenListenTranscribe={handleOpenListenTranscribe}
              />
            </div>

            {/* Right Column: Selected Message & Giant Speak Button with energetic rays (approx 3 cols) */}
            <div className="md:col-span-3 lg:col-span-3 min-w-0">
              <SpeakPanel
                currentMessage={selectedMessage}
                onClearMessage={() => setSelectedMessage('')}
                onOpenFullScreen={() => setIsFullScreenOpen(true)}
                onOpenListenTranscribe={handleOpenListenTranscribe}
                voiceSettings={voiceSettings}
                isAutoScanning={activeScanIndex !== -1}
              />
            </div>
          </div>
        </section>

        {/* Bottom Inclusive Footer Banner matching screenshot */}
        <Footer onOpenAbout={() => setIsAboutOpen(true)} language={voiceSettings.language} />
      </main>

      {/* Auxiliary Modals */}
      <FullScreenMessageModal
        isOpen={isFullScreenOpen}
        onClose={() => setIsFullScreenOpen(false)}
        message={selectedMessage}
        voiceSettings={voiceSettings}
      />

      <CustomMessageModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSelectAndClose={(msg) => {
          setSelectedMessage(msg);
          setIsCustomModalOpen(false);
          if (voiceSettings.autoSpeakOnSelect) {
            speakText(msg, {
              rate: voiceSettings.rate,
              pitch: voiceSettings.pitch,
              volume: voiceSettings.volume,
              voiceURI: voiceSettings.voiceURI,
              language: voiceSettings.language,
              voiceGender: voiceSettings.voiceGender,
            });
          }
        }}
        savedPhrases={savedPhrases}
        onSavePhrase={handleSavePhrase}
        onDeletePhrase={handleDeletePhrase}
        voiceSettings={voiceSettings}
      />

      <AccessibilitySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={voiceSettings}
        onUpdateSettings={handleUpdateSettings}
        onReplayLoading={() => {
          setIsLoading(true);
          setShowAccessGate(false);
        }}
        onReopenGate={() => setShowAccessGate(true)}
      />

      <TipsModal
        isOpen={isTipsOpen}
        onClose={() => setIsTipsOpen(false)}
        initialConditionId={selectedConditionId}
        language={voiceSettings.language}
      />

      <ListenTranscribeModal
        isOpen={isListenOpen}
        onClose={() => setIsListenOpen(false)}
        voiceSettings={voiceSettings}
      />

      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => {
          setIsEmergencyOpen(false);
          // If SOS was triggered from Blind Mode, go back to Blind Touch Pad
          if (sosTriggeredFromBlind) {
            setSosTriggeredFromBlind(false);
            setIsBlindTouchPadOpen(true);
          }
        }}
        voiceSettings={voiceSettings}
      />

      <BlindTouchPadModal
        isOpen={isBlindTouchPadOpen}
        onClose={handleBlindModeClose}
        voiceSettings={voiceSettings}
        onSelectMessage={handleSelectMessage}
        onBackToGate={() => setShowAccessGate(true)}
        onTriggerSOS={() => {
          setSosTriggeredFromBlind(true);
          setIsBlindTouchPadOpen(false);
          setIsEmergencyOpen(true);
        }}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        language={voiceSettings.language}
      />

      {/* App Intro Loading Screen (Letter-by-letter kinetic assembly) */}
      {isLoading && (
        <LoadingScreen
          onComplete={() => {
            setIsLoading(false);
            setShowAccessGate(true);
          }}
          onSkipWithMode={(mode) => {
            setIsLoading(false);
            if (mode === 'blind') {
              setShowAccessGate(false);
              setSelectedConditionId('blindness');
              setIsBlindTouchPadOpen(true);
            } else {
              setShowAccessGate(false);
            }
          }}
        />
      )}

      {/* Mode Gate Screen (Swipe 2 fingers for blind / Swipe up then start if not blind) */}
      {showAccessGate && !isLoading && (
        <AccessGateScreen
          onSelectBlindMode={() => {
            setShowAccessGate(false);
            setSelectedConditionId('blindness');
            setIsBlindTouchPadOpen(true);
          }}
          onSelectStandardMode={() => {
            setShowAccessGate(false);
          }}
          voiceSettings={voiceSettings}
        />
      )}
    </div>
  );
}
