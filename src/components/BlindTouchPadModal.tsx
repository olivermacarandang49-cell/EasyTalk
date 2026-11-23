import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  playCardSound,
  playSuccessChime,
  playEmergencyAlert,
  triggerHapticFeedback,
  speakText,
  isSystemSpeaking,
} from '../utils/audioUtils';
import { VoiceSettings, QuickMessage } from '../types';
import { EyeOff, Mic, MicOff, Volume2 } from 'lucide-react';

// ── DEFAULT SPEED DIAL PHRASES ─────────────────────────────────────────────
export const DEFAULT_SPEED_DIAL_EN = [
  'I am blind and need your assistance. Please come near me.',
  'Please call my emergency contact.',
  'I need a moment, please wait.',
];
export const DEFAULT_SPEED_DIAL_TL = [
  'Ako ay bulag at kailangan ko ng tulong. Pakiusap lumapit po kayo sa akin.',
  'Pakitawagan ang aking emergency contact.',
  'Sandali lang po, pakiusap hintayin ninyo ako.',
];

function loadSpeedDial(lang: 'en' | 'tl'): string[] {
  try {
    const stored = localStorage.getItem('easytalk_blind_speeddial');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length === 3) return parsed;
    }
  } catch { /* ignore */ }
  return lang === 'tl' ? [...DEFAULT_SPEED_DIAL_TL] : [...DEFAULT_SPEED_DIAL_EN];
}

// ── CATEGORIES ────────────────────────────────────────────────────────────
interface BlindCategory {
  id: string;
  nameTl: string;
  nameEn: string;
  itemsTl: QuickMessage[];
  itemsEn: QuickMessage[];
}

export const BLIND_CATEGORIES: BlindCategory[] = [
  {
    id: 'speeddial',
    nameTl: 'Aking mga Parirala',
    nameEn: 'My Phrases',
    itemsTl: [
      { id: 'sd-1', text: DEFAULT_SPEED_DIAL_TL[0], iconName: 'assistance', category: 'core' },
      { id: 'sd-2', text: DEFAULT_SPEED_DIAL_TL[1], iconName: 'assistance', category: 'core' },
      { id: 'sd-3', text: DEFAULT_SPEED_DIAL_TL[2], iconName: 'rest', category: 'core' },
    ],
    itemsEn: [
      { id: 'sd-1', text: DEFAULT_SPEED_DIAL_EN[0], iconName: 'assistance', category: 'core' },
      { id: 'sd-2', text: DEFAULT_SPEED_DIAL_EN[1], iconName: 'assistance', category: 'core' },
      { id: 'sd-3', text: DEFAULT_SPEED_DIAL_EN[2], iconName: 'rest', category: 'core' },
    ],
  },
  {
    id: 'needs',
    nameTl: 'Pangangailangan',
    nameEn: 'Daily Needs',
    itemsTl: [
      { id: 'bn-1', text: 'Kailangan ko ng tulong', iconName: 'assistance', category: 'core' },
      { id: 'bn-2', text: 'Gusto kong kumain', iconName: 'food', category: 'core' },
      { id: 'bn-3', text: 'Kailangan ko ng tubig', iconName: 'water', category: 'core' },
      { id: 'bn-4', text: 'Masama ang pakiramdam ko', iconName: 'unwell', category: 'medical' },
      { id: 'bn-5', text: 'Gusto ko nang umuwi', iconName: 'home', category: 'core' },
      { id: 'bn-6', text: 'Kailangan kong gumamit ng banyo', iconName: 'toilet', category: 'needs' },
    ],
    itemsEn: [
      { id: 'bn-1', text: 'I need assistance', iconName: 'assistance', category: 'core' },
      { id: 'bn-2', text: 'I want food', iconName: 'food', category: 'core' },
      { id: 'bn-3', text: 'I need water', iconName: 'water', category: 'core' },
      { id: 'bn-4', text: 'I feel unwell', iconName: 'unwell', category: 'medical' },
      { id: 'bn-5', text: 'I want to go home', iconName: 'home', category: 'core' },
      { id: 'bn-6', text: 'I need to use the restroom', iconName: 'toilet', category: 'needs' },
    ],
  },
  {
    id: 'navigation',
    nameTl: 'Paligid at Gabay',
    nameEn: 'Navigation',
    itemsTl: [
      { id: 'bg-1', text: 'Pakiusap ilarawan ang nasa paligid ko', iconName: 'listen', category: 'navigation' },
      { id: 'bg-2', text: 'Maaari mo ba akong akayin sa labasan o banyo?', iconName: 'navigation', category: 'navigation' },
      { id: 'bg-3', text: 'Pakibasa nang malakas ang nakasulat o menu para sa akin', iconName: 'assistance', category: 'needs' },
      { id: 'bg-4', text: 'Mayroon bang hakbang, hagdan, o harang sa harap ko?', iconName: 'navigation', category: 'navigation' },
      { id: 'bg-5', text: 'Pakilagay ang kamay ko sa hawakan ng pinto o upuan', iconName: 'needs', category: 'needs' },
      { id: 'bg-6', text: 'May tao bang nakatayo malapit sa akin?', iconName: 'listen', category: 'navigation' },
    ],
    itemsEn: [
      { id: 'bg-1', text: 'Please describe what is around me', iconName: 'listen', category: 'navigation' },
      { id: 'bg-2', text: 'Can you guide me to the exit or restroom?', iconName: 'navigation', category: 'navigation' },
      { id: 'bg-3', text: 'Please read the text or menu aloud for me', iconName: 'assistance', category: 'needs' },
      { id: 'bg-4', text: 'Is there a step, stair, or obstacle in front of me?', iconName: 'navigation', category: 'navigation' },
      { id: 'bg-5', text: 'Please place my hand on the door handle or seat', iconName: 'needs', category: 'needs' },
      { id: 'bg-6', text: 'Is there someone standing near me?', iconName: 'listen', category: 'navigation' },
    ],
  },
  {
    id: 'companion',
    nameTl: 'Kasama / Gabay',
    nameEn: 'Companion',
    itemsTl: [
      { id: 'bc-1', text: 'Nakatayo ako sa mismong tapat mo', iconName: 'listen', category: 'navigation' },
      { id: 'bc-2', text: 'Hawakan mo ang siko ko, aakayin kita nang ligtas', iconName: 'assistance', category: 'navigation' },
      { id: 'bc-3', text: 'May mga hakbang sa unahan, mag-ingat sa paghakbang', iconName: 'navigation', category: 'navigation' },
      { id: 'bc-4', text: 'Ang pinto at upuan ay nasa iyong kanang bahagi', iconName: 'navigation', category: 'navigation' },
      { id: 'bc-5', text: 'Hayaan mong basahin ko nang malakas ang nakasulat para sa iyo', iconName: 'assistance', category: 'needs' },
      { id: 'bc-6', text: 'Sandali lang akong lalayo, babalik ako kaagad', iconName: 'listen', category: 'navigation' },
    ],
    itemsEn: [
      { id: 'bc-1', text: 'I am standing right in front of you', iconName: 'listen', category: 'navigation' },
      { id: 'bc-2', text: 'Take my arm, I will guide you safely', iconName: 'assistance', category: 'navigation' },
      { id: 'bc-3', text: 'There are steps ahead, please step carefully', iconName: 'navigation', category: 'navigation' },
      { id: 'bc-4', text: 'The door and seat are right on your right side', iconName: 'navigation', category: 'navigation' },
      { id: 'bc-5', text: 'Let me read this document or menu out loud for you', iconName: 'assistance', category: 'needs' },
      { id: 'bc-6', text: 'I am stepping away for a moment, I will be right back', iconName: 'listen', category: 'navigation' },
    ],
  },
];

const EMERGENCY_TRIGGER_REGEX =
  /\b(saklolo|saklolohan|tulungan niyo ako|tulungan mo ako|emergency|help me|call 911|tawagan ang 911)\b/i;

// ── COMPONENT ─────────────────────────────────────────────────────────────
interface BlindTouchPadModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceSettings: VoiceSettings;
  onSelectMessage: (text: string, iconName?: string) => void;
  onBackToGate?: () => void;
  onTriggerSOS?: () => void;
}

export const BlindTouchPadModal: React.FC<BlindTouchPadModalProps> = ({
  isOpen,
  onClose,
  voiceSettings,
  onSelectMessage,
  onBackToGate,
  onTriggerSOS,
}) => {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [micActive, setMicActive] = useState(false);
  // ── CONFIRM EXIT state ────────────────────────────────────────────────────
  const [exitPending, setExitPending] = useState(false);
  const exitPendingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Refs
  const recognitionRef = useRef<any>(null);
  const isListeningIntentRef = useRef<boolean>(false);
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredRef = useRef<boolean>(false);
  const openedAtRef = useRef<number>(Date.now());
  const shakeTimestampsRef = useRef<number[]>([]);
  const lastShakeAlertRef = useRef<number>(0);
  const tapTimestampsRef = useRef<number[]>([]);
  const reminderIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const voiceTriggerTimestampsRef = useRef<number[]>([]);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSwiping = useRef(false);
  const lastTapTimeRef = useRef<number>(0);
  // Last spoken text — for double-shake repeat
  const lastSpokenTextRef = useRef<string>('');
  const lastShakeRepeatRef = useRef<number>(0);

  const isTl = voiceSettings.language === 'tl';

  // ── SPEED DIAL ────────────────────────────────────────────────────────────
  const [speedDialPhrases, setSpeedDialPhrases] = useState<string[]>(() =>
    loadSpeedDial(voiceSettings.language)
  );
  useEffect(() => {
    if (isOpen) setSpeedDialPhrases(loadSpeedDial(voiceSettings.language));
  }, [isOpen, voiceSettings.language]);

  // ── CURRENT ITEMS ─────────────────────────────────────────────────────────
  const currentCategory = BLIND_CATEGORIES[categoryIndex];
  const baseItems = isTl ? currentCategory.itemsTl : currentCategory.itemsEn;
  const currentItems: QuickMessage[] = currentCategory.id === 'speeddial'
    ? speedDialPhrases.map((text, idx) => ({
        id: `sd-${idx + 1}`,
        text: text || (isTl ? DEFAULT_SPEED_DIAL_TL[idx] : DEFAULT_SPEED_DIAL_EN[idx]),
        iconName: 'assistance' as const,
        category: 'core' as const,
      }))
    : baseItems;

  const currentPhrase = currentItems[phraseIndex];

  // ── SPEAK PHRASE ──────────────────────────────────────────────────────────
  // Core action: announce the phrase at the given index, speak it aloud
  const speakPhrase = useCallback(
    (index: number, withCounter = true) => {
      const item = currentItems[index];
      if (!item) return;

      triggerHapticFeedback(45);
      playCardSound(item.iconName);

      const text = withCounter
        ? `${index + 1} of ${currentItems.length}: ${item.text}`
        : item.text;

      lastSpokenTextRef.current = item.text;

      speakText(text, {
        rate: voiceSettings.rate,
        pitch: voiceSettings.pitch,
        volume: voiceSettings.volume,
        voiceURI: voiceSettings.voiceURI,
        language: voiceSettings.language,
        voiceGender: voiceSettings.voiceGender,
      });

      onSelectMessage(item.text, item.iconName);
    },
    [currentItems, voiceSettings, onSelectMessage]
  );

  // ── NAVIGATE PHRASE ───────────────────────────────────────────────────────
  const goNextPhrase = useCallback(() => {
    setPhraseIndex((prev) => {
      const next = (prev + 1) % currentItems.length;
      const looped = next === 0;
      if (looped) triggerHapticFeedback([80, 40, 80]);
      speakPhrase(next, true);
      return next;
    });
  }, [currentItems.length, speakPhrase]);

  const goPrevPhrase = useCallback(() => {
    setPhraseIndex((prev) => {
      const next = (prev - 1 + currentItems.length) % currentItems.length;
      const looped = next === currentItems.length - 1;
      if (looped) triggerHapticFeedback([80, 40, 80]);
      speakPhrase(next, true);
      return next;
    });
  }, [currentItems.length, speakPhrase]);

  // ── NAVIGATE CATEGORY ─────────────────────────────────────────────────────
  const goNextCategory = useCallback(() => {
    const next = (categoryIndex + 1) % BLIND_CATEGORIES.length;
    setCategoryIndex(next);
    setPhraseIndex(0);
    triggerHapticFeedback([60, 60, 100]);
    playSuccessChime();
    const cat = BLIND_CATEGORIES[next];
    const name = isTl ? cat.nameTl : cat.nameEn;
    const msg = isTl
      ? `Susunod. Kategorya: ${name}.`
      : `Next. Category: ${name}.`;
    speakText(msg, {
      rate: voiceSettings.rate,
      pitch: voiceSettings.pitch,
      volume: voiceSettings.volume,
      voiceURI: voiceSettings.voiceURI,
      language: voiceSettings.language,
      voiceGender: voiceSettings.voiceGender,
    });
  }, [categoryIndex, isTl, voiceSettings]);

  const goPrevCategory = useCallback(() => {
    const next = (categoryIndex - 1 + BLIND_CATEGORIES.length) % BLIND_CATEGORIES.length;
    setCategoryIndex(next);
    setPhraseIndex(0);
    triggerHapticFeedback([60, 60, 100]);
    playSuccessChime();
    const cat = BLIND_CATEGORIES[next];
    const name = isTl ? cat.nameTl : cat.nameEn;
    const msg = isTl
      ? `Nakaraan. Kategorya: ${name}.`
      : `Previous. Category: ${name}.`;
    speakText(msg, {
      rate: voiceSettings.rate,
      pitch: voiceSettings.pitch,
      volume: voiceSettings.volume,
      voiceURI: voiceSettings.voiceURI,
      language: voiceSettings.language,
      voiceGender: voiceSettings.voiceGender,
    });
  }, [categoryIndex, isTl, voiceSettings]);

  // ── LIST ALL PHRASES ──────────────────────────────────────────────────────
  const listAllPhrases = useCallback(() => {
    triggerHapticFeedback([40, 40, 80]);
    playSuccessChime();
    const catName = isTl ? currentCategory.nameTl : currentCategory.nameEn;
    const intro = isTl ? `${catName}. ` : `${catName}. `;
    const list = currentItems.map((item, idx) => `${idx + 1}: ${item.text}`).join('. ');
    speakText(`${intro}${list}`, {
      rate: voiceSettings.rate,
      pitch: voiceSettings.pitch,
      volume: voiceSettings.volume,
      voiceURI: voiceSettings.voiceURI,
      language: voiceSettings.language,
      voiceGender: voiceSettings.voiceGender,
    });
  }, [isTl, currentCategory, currentItems, voiceSettings]);

  // ── VOICE GUIDE (key H) ───────────────────────────────────────────────────
  const playVoiceGuide = useCallback(() => {
    triggerHapticFeedback([50, 50, 100]);
    const catName = isTl ? currentCategory.nameTl : currentCategory.nameEn;
    const phraseText = currentItems[phraseIndex]?.text ?? '';

    const guide = isTl
      ? `Kasalukuyang kategorya: ${catName}. `
        + `Parirala ${phraseIndex + 1} ng ${currentItems.length}: ${phraseText}. `
        + `Swipe pakanan para sa susunod na parirala. `
        + `Swipe pakaliwa para sa nakaraang parirala. `
        + `Swipe pataas para sa susunod na kategorya. `
        + `Swipe pababa para sa nakaraang kategorya. `
        + `Mag-tap kahit saan para ulitin ang parirala. `
        + `Long press para marinig ang lahat ng parirala. `
        + `Sa keyboard: Arrow left at right para sa parirala. Arrow up at down para sa kategorya. `
        + `Ugayin ang telepono ng tatlong beses para sa SOS. `
        + `Sabihin nang dalawang beses ang Saklolo para sa SOS.`
      : `Current category: ${catName}. `
        + `Phrase ${phraseIndex + 1} of ${currentItems.length}: ${phraseText}. `
        + `Swipe right for next phrase. `
        + `Swipe left for previous phrase. `
        + `Swipe up for next category. `
        + `Swipe down for previous category. `
        + `Tap anywhere to repeat the phrase. `
        + `Long press to hear all phrases. `
        + `On keyboard: Arrow left and right for phrases. Arrow up and down for categories. `
        + `Shake three times for SOS. `
        + `Say Emergency twice for voice SOS.`;

    speakText(guide, {
      rate: voiceSettings.rate,
      pitch: voiceSettings.pitch,
      volume: voiceSettings.volume,
      voiceURI: voiceSettings.voiceURI,
      language: voiceSettings.language,
      voiceGender: voiceSettings.voiceGender,
    });
  }, [isTl, voiceSettings, currentCategory, phraseIndex, currentItems]);

  // ── CONFIRM EXIT ─────────────────────────────────────────────────────────
  // First press → audio warning. Second press within 3s → actually exit.
  const handleConfirmExit = useCallback((goToGate = false) => {
    if (exitPending) {
      // Second press — confirmed exit
      if (exitPendingTimerRef.current) clearTimeout(exitPendingTimerRef.current);
      setExitPending(false);
      onClose();
      if (goToGate && onBackToGate) onBackToGate();
    } else {
      // First press — warn the user
      setExitPending(true);
      triggerHapticFeedback([50, 50]);
      speakText(
        isTl
          ? 'Pindutin ulit para lumabas sa Blind Mode.'
          : 'Press again to exit Blind Mode.',
        {
          language: voiceSettings.language,
          voiceGender: voiceSettings.voiceGender,
          rate: voiceSettings.rate,
          pitch: voiceSettings.pitch,
          volume: voiceSettings.volume,
        }
      );
      // Auto-cancel after 3 seconds
      exitPendingTimerRef.current = setTimeout(() => {
        setExitPending(false);
      }, 3000);
    }
  }, [exitPending, isTl, voiceSettings, onClose, onBackToGate]);

  // ── EMERGENCY TRIGGER ─────────────────────────────────────────────────────
  const handleTriggerEmergency = useCallback(
    (_reason: string) => {
      if (hasTriggeredRef.current) return;
      hasTriggeredRef.current = true;
      setTimeout(() => { hasTriggeredRef.current = false; }, 5000);

      triggerHapticFeedback([120, 60, 120, 60, 300]);
      playEmergencyAlert();

      let sosFired = false;
      const fireSOS = () => {
        if (sosFired) return;
        sosFired = true;
        if (onTriggerSOS) onTriggerSOS();
      };

      const announcement = isTl
        ? 'Binubuksan ang pulang alarma ngayon.'
        : 'Opening urgent alarm now.';

      speakText(announcement, {
        rate: 1.05, pitch: 1.15, volume: 1.0,
        language: voiceSettings.language,
        voiceGender: voiceSettings.voiceGender,
        onEnd: fireSOS,
      });
      setTimeout(fireSOS, 1000);
    },
    [isTl, voiceSettings, onTriggerSOS]
  );

  // ── WELCOME MESSAGE ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      isSwiping.current = false;
      setExitPending(false);
      if (exitPendingTimerRef.current) {
        clearTimeout(exitPendingTimerRef.current);
        exitPendingTimerRef.current = null;
      }
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      return;
    }

    openedAtRef.current = Date.now();
    setCategoryIndex(0);
    setPhraseIndex(0);
    triggerHapticFeedback([60, 60, 120]);
    playSuccessChime();

    // Short welcome — automatic on open
    const welcome = isTl
      ? 'Blind Mode. Swipe pakanan para sa susunod na parirala. Swipe pakaliwa para sa nakaraan. Swipe pataas o pababa para magpalit ng kategorya. Mag-tap para ulitin. Long press para marinig ang lahat. Ugayin ng tatlong beses para sa SOS. Sabihin ang Gabay para sa kumpletong gabay.'
      : 'Blind Mode. Swipe right for next phrase. Swipe left for previous. Swipe up or down to change category. Tap to repeat. Long press to hear all. Shake three times for SOS. Say Guide for the full guide.';

    // After welcome → announce first phrase so user knows where they are
    speakText(welcome, {
      rate: voiceSettings.rate,
      pitch: voiceSettings.pitch,
      volume: voiceSettings.volume,
      voiceURI: voiceSettings.voiceURI,
      language: voiceSettings.language,
      voiceGender: voiceSettings.voiceGender,
      onEnd: () => {
        const firstCat = BLIND_CATEGORIES[0];
        const firstItems = isTl ? firstCat.itemsTl : firstCat.itemsEn;
        const firstPhrase = firstItems[0];
        if (firstPhrase) {
          const catName = isTl ? firstCat.nameTl : firstCat.nameEn;
          const announcement = isTl
            ? `Kategorya 1: ${catName}. Parirala 1 ng ${firstItems.length}: ${firstPhrase.text}.`
            : `Category 1: ${catName}. Phrase 1 of ${firstItems.length}: ${firstPhrase.text}.`;
          speakText(announcement, {
            rate: voiceSettings.rate,
            pitch: voiceSettings.pitch,
            volume: voiceSettings.volume,
            voiceURI: voiceSettings.voiceURI,
            language: voiceSettings.language,
            voiceGender: voiceSettings.voiceGender,
          });
          onSelectMessage(firstPhrase.text, firstPhrase.iconName);
        }
      },
    });
  }, [isOpen, voiceSettings, isTl]);

  // ── AUTO-SCAN ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !voiceSettings.autoScanEnabled) return;
    const interval = setInterval(() => {
      setPhraseIndex((prev) => {
        const next = (prev + 1) % currentItems.length;
        speakPhrase(next, true);
        return next;
      });
    }, voiceSettings.autoScanInterval * 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, voiceSettings.autoScanEnabled, voiceSettings.autoScanInterval, categoryIndex, speedDialPhrases]);

  // ── VOICE RECOGNITION (emergency wake words) ──────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      isListeningIntentRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.abort();
        } catch { /* ignore */ }
        recognitionRef.current = null;
      }
      setMicActive(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicActive(false);
      // On iOS Safari, SpeechRecognition is not supported — speak a notice
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      if (isIOS) {
        speakText(
          isTl
            ? 'Hindi sinusuportahan ang voice recognition sa iOS Safari. Gagamitin ang mga button para sa SOS.'
            : 'Voice recognition is not supported on iOS Safari. Use the shake gesture or 5-tap for SOS.',
          { language: voiceSettings.language, voiceGender: voiceSettings.voiceGender }
        );
      }
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

        recognition.onstart = () => setMicActive(true);

        recognition.onresult = (event: any) => {
          if (hasTriggeredRef.current) return;
          if (Date.now() - openedAtRef.current < 2500) return;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (!event.results[i].isFinal) continue;
            const transcript = event.results[i][0]?.transcript?.trim().toLowerCase() || '';
            if (!transcript) continue;

            if (isSystemSpeaking()) {
              if (EMERGENCY_TRIGGER_REGEX.test(transcript)) {
                handleTriggerEmergency(`voice: "${transcript}"`);
              }
              return;
            }

            if (/\b(cancel|kansela|i'm okay|im okay|okay lang ako|ayos na ako)\b/i.test(transcript)) {
              hasTriggeredRef.current = false;
              playSuccessChime();
              speakText(isTl ? 'Naiintindihan ko, ligtas ka.' : 'Understood, glad you are okay.', {
                language: voiceSettings.language,
                voiceGender: voiceSettings.voiceGender,
              });
              return;
            }

            if (/\b(close|exit|umalis|isara)\b/i.test(transcript)) {
              playSuccessChime();
              onClose();
              return;
            }

            // "Guide" / "Gabay" / "Help" voice command → speak full detailed guide
            if (/\b(guide|gabay|help|tulong|paano|how)\b/i.test(transcript)) {
              playVoiceGuide();
              return;
            }

            if (EMERGENCY_TRIGGER_REGEX.test(transcript)) {
              const now = Date.now();
              voiceTriggerTimestampsRef.current.push(now);
              voiceTriggerTimestampsRef.current = voiceTriggerTimestampsRef.current.filter(
                (t) => now - t < 4000
              );
              if (voiceTriggerTimestampsRef.current.length >= 2) {
                voiceTriggerTimestampsRef.current = [];
                handleTriggerEmergency(`voice-confirmed: "${transcript}"`);
              } else {
                triggerHapticFeedback([50, 50]);
                speakText(
                  isTl
                    ? 'Narinig kita. Ulitin pa ng isa para kumpirmahin.'
                    : 'Heard you. Say it once more to confirm.',
                  { language: voiceSettings.language, voiceGender: voiceSettings.voiceGender, rate: 1.1 }
                );
              }
              return;
            }
          }
        };

        recognition.onerror = () => { /* restart on end */ };
        recognition.onend = () => {
          if (isListeningIntentRef.current) {
            restartTimerRef.current = setTimeout(() => startListener(), 600);
          } else {
            setMicActive(false);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch {
        setMicActive(false);
      }
    };

    startListener();

    return () => {
      isListeningIntentRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.abort();
        } catch { /* ignore */ }
      }
    };
  }, [isOpen, isTl, handleTriggerEmergency, onClose, voiceSettings, playVoiceGuide]);

  // ── SHAKE TO SOS ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) return;

    const THRESHOLD = 18;
    const WINDOW_MS = 2000;
    const COUNT_NEEDED = 3;
    const COOLDOWN_MS = 8000;
    let lastAcc = 0;

    const handleMotion = (e: DeviceMotionEvent) => {
      if (hasTriggeredRef.current) return;
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const total = Math.sqrt(Math.pow(acc.x ?? 0, 2) + Math.pow(acc.y ?? 0, 2) + Math.pow(acc.z ?? 0, 2));
      const delta = Math.abs(total - lastAcc);
      lastAcc = total;
      if (delta > THRESHOLD) {
        const now = Date.now();
        if (now - lastShakeAlertRef.current < COOLDOWN_MS) return;
        shakeTimestampsRef.current.push(now);
        shakeTimestampsRef.current = shakeTimestampsRef.current.filter((t) => now - t < WINDOW_MS);

        const count = shakeTimestampsRef.current.length;

        if (count >= COUNT_NEEDED) {
          // 3+ shakes → SOS
          shakeTimestampsRef.current = [];
          lastShakeAlertRef.current = now;
          handleTriggerEmergency('shake');
        } else if (count === 2) {
          // 2 quick shakes within 1.5s → repeat last spoken phrase
          const twoShakeWindow = shakeTimestampsRef.current.filter((t) => now - t < 1500);
          if (twoShakeWindow.length >= 2 && lastSpokenTextRef.current) {
            lastShakeRepeatRef.current = now;
            triggerHapticFeedback([40, 40]);
            speakText(lastSpokenTextRef.current, {
              rate: voiceSettings.rate,
              pitch: voiceSettings.pitch,
              volume: voiceSettings.volume,
              voiceURI: voiceSettings.voiceURI,
              language: voiceSettings.language,
              voiceGender: voiceSettings.voiceGender,
            });
          }
        }
      }
    };

    const startListening = () => window.addEventListener('devicemotion', handleMotion, true);
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then((s: string) => { if (s === 'granted') startListening(); })
        .catch(() => {});
    } else {
      startListening();
    }
    return () => window.removeEventListener('devicemotion', handleMotion, true);
  }, [isOpen, handleTriggerEmergency]);

  // ── 5-TAP SOS ─────────────────────────────────────────────────────────────
  // On mobile, tap counting happens inside handleTouchEnd to avoid the
  // touchend + synthesized-click double-fire conflict.
  // On desktop (no touch events), onClick on the root div counts as a tap.
  const handleRapidTapSOS = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Skip synthesized click events that follow a touch — mobile already counted in touchend
    if ((e as any).sourceCapabilities?.firesTouchEvents) return;
    if ((e.target as HTMLElement).closest('button, a')) return;
    if (hasTriggeredRef.current) return;
    const now = Date.now();
    tapTimestampsRef.current.push(now);
    tapTimestampsRef.current = tapTimestampsRef.current.filter((t) => now - t < 3000);
    if (tapTimestampsRef.current.length >= 5) {
      tapTimestampsRef.current = [];
      handleTriggerEmergency('5-tap-desktop');
    }
  }, [handleTriggerEmergency]);

  // ── PERIODIC REMINDER ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      if (reminderIntervalRef.current) clearInterval(reminderIntervalRef.current);
      return;
    }
    reminderIntervalRef.current = setInterval(() => {
      if (hasTriggeredRef.current) return;
      const reminder = isTl
        ? 'Paalala: Ugayin ng tatlong beses para sa agarang tulong.'
        : 'Reminder: Shake three times for urgent help.';
      speakText(reminder, {
        language: voiceSettings.language,
        voiceGender: voiceSettings.voiceGender,
        rate: voiceSettings.rate,
        pitch: voiceSettings.pitch,
        volume: voiceSettings.volume,
      });
    }, 90000);
    return () => {
      if (reminderIntervalRef.current) clearInterval(reminderIntervalRef.current);
    };
  }, [isOpen, isTl, voiceSettings]);

  // ── KEYBOARD NAVIGATION ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key === 'e' || key === '9') {
        e.preventDefault();
        handleTriggerEmergency(`hotkey: ${key}`);
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        handleConfirmExit(false);

      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleConfirmExit(true);

      } else if (key === 'h' || key === '?') {
        e.preventDefault();
        playVoiceGuide();

      } else if (key === 'l') {
        e.preventDefault();
        listAllPhrases();

      } else if (key === '0') {
        e.preventDefault();
        goNextCategory();

      } else if (e.key === 'ArrowUp') {
        // Up = previous category
        e.preventDefault();
        goPrevCategory();

      } else if (e.key === 'ArrowDown') {
        // Down = next category
        e.preventDefault();
        goNextCategory();

      } else if (e.key === 'ArrowRight') {
        // Right = next phrase
        e.preventDefault();
        goNextPhrase();

      } else if (e.key === 'ArrowLeft') {
        // Left = previous phrase
        e.preventDefault();
        goPrevPhrase();

      } else if (
        e.keyCode === 32 || e.code === 'Space' ||
        e.key === ' ' || e.key === 'Spacebar' ||
        e.keyCode === 13 || e.code === 'Enter' || e.code === 'NumpadEnter'
      ) {
        e.preventDefault();
        e.stopPropagation();
        speakPhrase(phraseIndex, false);

      } else if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        e.preventDefault();
        const idx = parseInt(e.key, 10) - 1;
        setPhraseIndex(idx);
        speakPhrase(idx, false);

      } else if (['7', '8', '9'].includes(e.key)) {
        // Speed Dial direct jump
        e.preventDefault();
        const sdCatIndex = BLIND_CATEGORIES.findIndex((c) => c.id === 'speeddial');
        const sdIdx = parseInt(e.key, 10) - 7;
        if (sdCatIndex !== -1) {
          setCategoryIndex(sdCatIndex);
          setPhraseIndex(sdIdx);
          setTimeout(() => speakPhrase(sdIdx, false), 100);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [
    isOpen, phraseIndex, categoryIndex, currentItems,
    speakPhrase, goNextPhrase, goPrevPhrase,
    goNextCategory, goPrevCategory,
    playVoiceGuide, listAllPhrases,
    handleTriggerEmergency, handleConfirmExit,
    onClose, onBackToGate,
  ]);

  // ── TOUCH GESTURES ────────────────────────────────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      isSwiping.current = false;
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };

      // Long press → list all phrases (600ms)
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = setTimeout(() => {
        isSwiping.current = true;
        triggerHapticFeedback([50, 50, 100]);
        listAllPhrases();
      }, 600);
    }
  }, [listAllPhrases]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!touchStartRef.current || e.changedTouches.length === 0) {
      isSwiping.current = false;
      return;
    }

    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const totalMove = Math.sqrt(dx * dx + dy * dy);
    const elapsed = Date.now() - touchStartRef.current.time;

    const SWIPE_THRESHOLD = 60;

    if (Math.abs(dy) > SWIPE_THRESHOLD && Math.abs(dy) > Math.abs(dx)) {
      // Vertical swipe → change category
      isSwiping.current = true;
      if (dy < 0) goNextCategory(); else goPrevCategory();

    } else if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe → navigate phrase
      isSwiping.current = true;
      if (dx > 0) goNextPhrase(); else goPrevPhrase();

    } else if (totalMove < 15 && elapsed < 500 && !isSwiping.current) {
      // Tap → repeat current phrase
      const now = Date.now();
      const timeSinceLast = now - lastTapTimeRef.current;

      if (timeSinceLast < 400) {
        // Double tap → speak without counter (clean repeat)
        speakPhrase(phraseIndex, false);
        lastTapTimeRef.current = 0;
      } else {
        // Single tap → speak with counter so user knows position
        speakPhrase(phraseIndex, true);
        lastTapTimeRef.current = now;
      }

      // Count toward 5-tap SOS (mobile only — desktop uses onClick)
      if (!hasTriggeredRef.current) {
        tapTimestampsRef.current.push(now);
        tapTimestampsRef.current = tapTimestampsRef.current.filter((t) => now - t < 3000);
        if (tapTimestampsRef.current.length >= 5) {
          tapTimestampsRef.current = [];
          handleTriggerEmergency('5-tap-mobile');
        }
      }
    }

    touchStartRef.current = null;
    setTimeout(() => { isSwiping.current = false; }, 300);
  }, [goNextCategory, goPrevCategory, goNextPhrase, goPrevPhrase, speakPhrase, phraseIndex, handleTriggerEmergency]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Blind Touch Pad Mode"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none touch-none"
      onClick={handleRapidTapSOS}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0 safe-top safe-x">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-full bg-amber-400 text-slate-950 shrink-0">
            <EyeOff className="w-5 h-5" />
          </span>
          <div>
            <span className="font-black text-sm text-amber-300 block tracking-wide">
              BLIND TOUCH PAD
            </span>
            <span className="text-[11px] text-slate-400">
              {isTl
                ? 'Swipe ← → parirala · ↑ ↓ kategorya · Tap ulitin · Long press listahan'
                : 'Swipe ← → phrase · ↑ ↓ category · Tap repeat · Long press list'}
            </span>
          </div>
        </div>

        {/* Mic indicator + exit pending warning */}
        <div className="flex items-center gap-2">
          {exitPending && (
            <span className="text-[10px] font-bold text-amber-300 animate-pulse bg-slate-800 px-2 py-1 rounded-lg">
              {isTl ? 'Pindutin ulit para lumabas' : 'Press again to exit'}
            </span>
          )}
          {micActive ? (
            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <Mic className="w-4 h-4" />
            </span>
          ) : (
            <span className="text-slate-600">
              <MicOff className="w-4 h-4" />
            </span>
          )}
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col items-center justify-between p-4 sm:p-6 text-center overflow-hidden">

        {/* Category nav row — visible on desktop only (PC users click, mobile users swipe) */}
        <div className="hidden sm:flex items-center justify-between w-full max-w-lg gap-2 mb-2">
          <button
            onClick={(e) => { e.stopPropagation(); goPrevCategory(); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs active:scale-95 transition-all cursor-pointer"
            aria-label={isTl ? 'Nakaraang kategorya' : 'Previous category'}
          >
            <span>↑</span>
            <span>{isTl ? 'Nakaraan' : 'Prev Cat'}</span>
          </button>

          {/* Category label — center */}
          <div className="flex flex-col items-center gap-0.5 flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {isTl ? 'Kategorya' : 'Category'} {categoryIndex + 1} / {BLIND_CATEGORIES.length}
            </span>
            <span className="text-sm font-black text-amber-300 truncate w-full text-center">
              {isTl ? currentCategory.nameTl : currentCategory.nameEn}
            </span>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); goNextCategory(); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs active:scale-95 transition-all cursor-pointer"
            aria-label={isTl ? 'Susunod na kategorya' : 'Next category'}
          >
            <span>{isTl ? 'Susunod' : 'Next Cat'}</span>
            <span>↓</span>
          </button>
        </div>

        {/* Category label — mobile only (no buttons, swipe to change) */}
        <div className="flex sm:hidden flex-col items-center gap-0.5 w-full mb-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {isTl ? 'Kategorya' : 'Category'} {categoryIndex + 1} / {BLIND_CATEGORIES.length}
          </span>
          <span className="text-sm font-black text-amber-300">
            {isTl ? currentCategory.nameTl : currentCategory.nameEn}
          </span>
          <span className="text-[10px] text-slate-600 font-medium mt-0.5">
            {isTl ? '↑↓ Swipe para magpalit ng kategorya' : '↑↓ Swipe to change category'}
          </span>
        </div>

        {/* Phrase counter */}
        <span className="text-sm font-bold text-slate-500">
          {phraseIndex + 1} / {currentItems.length}
        </span>

        {/* Current phrase — large, readable by sighted companion */}
        <p className="text-2xl sm:text-4xl font-black text-white leading-snug max-w-lg px-2 my-4">
          {currentPhrase?.text ?? ''}
        </p>

        {/* Phrase nav buttons — for sighted helper */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
          <button
            onClick={(e) => { e.stopPropagation(); goPrevPhrase(); }}
            className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs active:scale-95 transition-all cursor-pointer"
            aria-label={isTl ? 'Nakaraang parirala' : 'Previous phrase'}
          >
            <span className="text-xl">←</span>
            <span>{isTl ? 'Nakaraan' : 'Previous'}</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); speakPhrase(phraseIndex, false); }}
            className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-300 text-slate-950 font-black text-xs active:scale-95 transition-all cursor-pointer shadow-lg"
            aria-label={isTl ? 'Ulitin ang parirala' : 'Repeat phrase'}
          >
            <span className="text-xl">👆</span>
            <span>{isTl ? 'Ulitin' : 'Repeat'}</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); goNextPhrase(); }}
            className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs active:scale-95 transition-all cursor-pointer"
            aria-label={isTl ? 'Susunod na parirala' : 'Next phrase'}
          >
            <span className="text-xl">→</span>
            <span>{isTl ? 'Susunod' : 'Next'}</span>
          </button>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0 safe-bottom safe-x">
        {/* List all */}
        <button
          onClick={(e) => { e.stopPropagation(); listAllPhrases(); }}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-slate-700 hover:bg-slate-600 text-amber-300 font-bold text-xs active:scale-95 transition-all cursor-pointer shrink-0"
          aria-label={isTl ? 'Ilista ang lahat' : 'List all phrases'}
        >
          <span>📋</span>
          <span>{isTl ? 'Listahan' : 'List All'}</span>
        </button>

        {/* Speak — primary */}
        <button
          onClick={(e) => { e.stopPropagation(); speakPhrase(phraseIndex, false); }}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-md active:scale-95 transition-all cursor-pointer"
          aria-label={isTl ? 'Basahin ang mensahe' : 'Speak selected phrase'}
        >
          <Volume2 className="w-5 h-5" />
          <span>{isTl ? 'Basahin' : 'Speak'}</span>
        </button>

        {/* Guide */}
        <button
          onClick={(e) => { e.stopPropagation(); playVoiceGuide(); }}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-xs active:scale-95 transition-all cursor-pointer shrink-0"
          aria-label={isTl ? 'Gabay sa boses' : 'Voice guide'}
        >
          <span>🎧</span>
          <span>{isTl ? 'Gabay' : 'Guide'}</span>
        </button>
      </div>
    </div>
  );
};
