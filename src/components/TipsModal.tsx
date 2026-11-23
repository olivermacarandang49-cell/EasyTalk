import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Users,
  CheckCircle2,
  Volume2,
  VolumeX,
  Sparkles,
  Keyboard,
  Mic,
  Smartphone,
  AlertTriangle,
  Sliders,
  Globe,
  Compass,
} from 'lucide-react';
import { CONDITIONS_DATA, CONDITIONS_DATA_TL } from '../data/conditionsData';
import { DisabilityConditionId, AppLanguage } from '../types';
import { speakText } from '../utils/audioUtils';
import {
  BlindnessAvatar,
  DeafnessAvatar,
  MobilityAvatar,
  SpeechAvatar,
  AutismAvatar,
  CognitiveAvatar,
} from './ConditionAvatars';

interface TipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConditionId?: DisabilityConditionId;
  language?: AppLanguage;
}

type MainTab = 'etiquette' | 'website';

export const TipsModal: React.FC<TipsModalProps> = ({
  isOpen,
  onClose,
  initialConditionId = 'deafness',
  language = 'tl',
}) => {
  const [activeTab, setActiveTab] = useState<MainTab>('etiquette');
  const [selectedConditionId, setSelectedConditionId] = useState<DisabilityConditionId>(initialConditionId);
  const [modalLang, setModalLang] = useState<AppLanguage>(language);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    if (initialConditionId) {
      setSelectedConditionId(initialConditionId);
    }
  }, [initialConditionId]);

  useEffect(() => {
    if (language) {
      setModalLang(language);
    }
  }, [language]);

  // Stop speaking when modal closes
  useEffect(() => {
    if (!isOpen && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isTl = modalLang === 'tl';
  const conditionsSource = isTl ? CONDITIONS_DATA_TL : CONDITIONS_DATA;
  const currentCondition = conditionsSource[selectedConditionId] || conditionsSource.deafness;

  const conditionList: { id: DisabilityConditionId; label: string; icon: string }[] = isTl
    ? [
        { id: 'deafness', label: 'Bingi (Deaf)', icon: '🦻' },
        { id: 'mobility', label: 'Pagkilos (Mobility)', icon: '🧑‍🦽' },
        { id: 'speech', label: 'Pagsasalita (Speech)', icon: '💬' },
        { id: 'autism', label: 'Autism', icon: '🧩' },
        { id: 'cognitive', label: 'Pag-unawa (Cognitive)', icon: '🧠' },
        { id: 'blindness', label: 'Bulag (Blind)', icon: '🦯' },
      ]
    : [
        { id: 'deafness', label: 'Deaf', icon: '🦻' },
        { id: 'mobility', label: 'Mobility Impairment', icon: '🧑‍🦽' },
        { id: 'speech', label: 'Speech Impairment', icon: '💬' },
        { id: 'autism', label: 'Autism', icon: '🧩' },
        { id: 'cognitive', label: 'Cognitive Impairment', icon: '🧠' },
        { id: 'blindness', label: 'Blind', icon: '🦯' },
      ];

  const renderAvatar = (id: DisabilityConditionId) => {
    switch (id) {
      case 'blindness':
        return <BlindnessAvatar size={68} />;
      case 'deafness':
        return <DeafnessAvatar size={68} />;
      case 'mobility':
        return <MobilityAvatar size={68} />;
      case 'speech':
        return <SpeechAvatar size={68} />;
      case 'autism':
        return <AutismAvatar size={68} />;
      case 'cognitive':
        return <CognitiveAvatar size={68} />;
      default:
        return <DeafnessAvatar size={68} />;
    }
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    let textToSpeak = '';

    if (activeTab === 'etiquette') {
      const tipsJoined = currentCondition.etiquetteTips.join('. ');
      const waysJoined = currentCondition.communicationWays.join('. ');
      textToSpeak = isTl
        ? `Gabay sa pakikipag-usap sa ${currentCondition.name}. ${currentCondition.overview}. Mga mahahalagang alituntunin: ${tipsJoined}. Mga paraan ng komunikasyon: ${waysJoined}.`
        : `Communication etiquette for ${currentCondition.name}. ${currentCondition.overview}. Key guidelines: ${tipsJoined}. Ways they express themselves: ${waysJoined}.`;
    } else {
      textToSpeak = isTl
        ? 'Gabay sa paggamit ng EasyTalk. '
          + 'Sa main board, pindutin ang 1 hanggang 6 para sa mga parirala. Space o Enter para ulitin. Arrow keys para mag-navigate. '
          + 'Pindutin ang B para sa Blind Mode. H para sa voice guide. Backspace para bumalik sa gate. Escape para isara ang popup. '
          + 'Para sa Blind Mode: Pindutin ang 1 hanggang 6 para magsalita. 0 para magpalit ng kategorya. E para sa alarma. '
          + 'Maaari ring sabihin nang dalawang beses ang Saklolo para sa SOS, ugayin ang telepono ng tatlong beses, o mag-tap ng limang beses. '
          + 'Para sa Bingi: Gamitin ang Live Transcriber — pindutin ang Start Mic at magsalita ang kausap. Lilitaw ang salita sa screen. '
          + 'Para sa Emergency: Pindutin ang pulang SOS button, tapos pindutin ang 1 para sa 911 o 2 para sa Red Cross.'
        : 'EasyTalk user guide. '
          + 'On the main board, press 1 to 6 for phrases. Space or Enter to repeat. Arrow keys to navigate. '
          + 'Press B for Blind Mode. H for voice guide. Backspace to return to gate. Escape to close a dialog. '
          + 'In Blind Mode: press 1 to 6 to speak, 0 to switch category, E for emergency alarm. '
          + 'You can also say Emergency twice for voice SOS, shake your phone three times, or tap the screen five times quickly. '
          + 'For Deaf users: use the Live Transcriber. Click Start Mic and your companion speaks into the phone. Words appear on screen. '
          + 'For Emergency: tap the red SOS button, then press 1 for 911 or 2 for Red Cross 143.';
    }

    setIsSpeaking(true);
    speakText(textToSpeak, {
      language: modalLang,
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      onEnd: () => setIsSpeaking(false),
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isTl ? 'Gabay at Kagandahang-Asal sa Komunikasyon' : 'Communication Etiquette and Tips'}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl border-2 border-sky-300 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-100 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-[#0F3E76] shrink-0">
              <Users className="w-5 h-5 text-[#0F3E76]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-[#0F3E76] leading-tight truncate">
                {isTl ? 'Gabay at Kagandahang-Asal sa Komunikasyon' : 'Communication Etiquette & Platform Tips'}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                {isTl
                  ? 'Madaling gabay para sa tagapag-alaga, pamilya, at paggamit ng EasyTalk'
                  : 'Practical etiquette and accessibility navigation for caregivers & allies'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Read Aloud Button */}
            <button
              onClick={handleToggleSpeak}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${
                isSpeaking
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-sky-100 hover:bg-sky-200 text-[#0F3E76]'
              }`}
              title={isSpeaking ? (isTl ? 'Itigil ang boses' : 'Stop voice') : (isTl ? 'Pakinggan ang gabay' : 'Read tips aloud')}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">
                {isSpeaking ? (isTl ? 'Itigil' : 'Stop') : (isTl ? 'Pakinggan' : 'Read Aloud')}
              </span>
            </button>

            {/* Language Switcher Pill */}
            <div className="flex items-center bg-slate-100 rounded-full p-0.5 border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setModalLang('tl')}
                className={`px-2 py-1 rounded-full transition-all cursor-pointer ${
                  isTl ? 'bg-[#0F3E76] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Filipino / Tagalog"
              >
                🇵🇭 TL
              </button>
              <button
                onClick={() => setModalLang('en')}
                className={`px-2 py-1 rounded-full transition-all cursor-pointer ${
                  !isTl ? 'bg-[#0F3E76] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="English"
              >
                🇺🇸 EN
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2 Main Mode Tabs */}
        <div className="grid grid-cols-2 gap-2 mt-3 p-1 bg-sky-50 rounded-2xl border border-sky-200">
          <button
            onClick={() => setActiveTab('etiquette')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'etiquette'
                ? 'bg-[#0F3E76] text-white shadow-md'
                : 'text-[#0F3E76] hover:bg-sky-100'
            }`}
          >
            <Heart className="w-4 h-4 fill-current text-rose-400" />
            <span>{isTl ? 'Gabay sa Pakikitungo (Etiquette)' : 'PWD Etiquette & Care'}</span>
          </button>

          <button
            onClick={() => setActiveTab('website')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'website'
                ? 'bg-[#0F3E76] text-white shadow-md'
                : 'text-[#0F3E76] hover:bg-sky-100'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>{isTl ? 'Gabay sa Website (Shortcuts & Features)' : 'How to Use EasyTalk'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-3 flex-1 overflow-y-auto pr-1 space-y-4">
          {activeTab === 'etiquette' ? (
            <>
              {/* Condition Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {conditionList.map((cond) => {
                  const isSelected = selectedConditionId === cond.id;
                  return (
                    <button
                      key={cond.id}
                      onClick={() => setSelectedConditionId(cond.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#0F3E76] text-white border-[#0F3E76] shadow-sm'
                          : 'bg-white text-slate-700 hover:bg-sky-50 border-slate-200'
                      }`}
                    >
                      <span>{cond.icon}</span>
                      <span>{cond.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Condition Overview Hero */}
              <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-white rounded-2xl p-4 border border-sky-200 flex items-center gap-4">
                <div className="shrink-0 transition-transform hover:scale-105 duration-200">
                  {renderAvatar(currentCondition.id)}
                </div>
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0F3E76] text-white text-[11px] font-bold mb-1 shadow-2xs">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>{currentCondition.name}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#0F3E76] leading-snug">
                    {currentCondition.kicker}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {currentCondition.overview}
                  </p>
                </div>
              </div>

              {/* Key Etiquette Guidelines */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                <h4 className="text-xs font-black text-[#0F3E76] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {isTl
                      ? 'Mahahalagang Alituntunin at Kagandahang-Asal'
                      : 'Key Etiquette & Respectful Guidelines'}
                  </span>
                </h4>
                <div className="space-y-2">
                  {currentCondition.etiquetteTips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-sky-50/50 transition-colors"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed font-medium">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Communication Channels */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                <h4 className="text-xs font-black text-[#0F3E76] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-sky-600" />
                  <span>
                    {isTl
                      ? 'Mga Epektibong Paraan ng Pakikipag-ugnayan'
                      : 'Effective Communication Channels'}
                  </span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentCondition.communicationWays.map((way, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-100 text-xs font-semibold text-slate-800 flex items-start gap-2"
                    >
                      <span className="text-sky-600 font-bold shrink-0">•</span>
                      <span className="leading-snug">{way}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Golden Rule Callout */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center gap-3 text-xs sm:text-sm text-amber-950 shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 fill-current text-rose-500" />
                </div>
                <p className="font-semibold leading-relaxed">
                  {isTl
                    ? 'Gintong Paalala: Laging direktang kausapin ang tao nang nakaharap, bago ang kanilang kasama o caregiver. Irespeto ang kanilang kalayaan at kakayahan.'
                    : 'Golden Rule: Always speak directly to the person first facing them, not solely to their companion. Respect their autonomy and dignity.'}
                </p>
              </div>
            </>
          ) : (
            /* TAB 2: EasyTalk Platform & Accessibility Shortcuts Guide */
            <div className="space-y-4">

              {/* ── INTRO ── */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900 to-[#0F3E76] text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <h3 className="text-sm font-extrabold">
                    {isTl ? 'Gabay sa Paggamit ng EasyTalk' : 'EasyTalk User Guide'}
                  </h3>
                </div>
                <p className="text-xs text-blue-100 leading-relaxed">
                  {isTl
                    ? 'Dinisenyo para sa mabilis, ligtas, at naa-access na komunikasyon gamit ang keyboard, boses, touch screen, o kahit kamay lang.'
                    : 'Designed for fast, safe, accessible communication using keyboard shortcuts, voice, touch, or any input method.'}
                </p>
              </div>

              {/* ── SECTION 1: GENERAL KEYBOARD SHORTCUTS ── */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2 mb-2.5 text-[#0F3E76]">
                  <Keyboard className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-black uppercase tracking-wider">
                    {isTl ? 'Mga Shortcut sa Keyboard (Main Board)' : 'Main Board Keyboard Shortcuts'}
                  </h4>
                </div>
                <div className="space-y-1.5">
                  {[
                    { key: '1 – 6',         en: 'Select and speak phrase 1 to 6',          tl: 'Piliin at basahin ang parirala 1 hanggang 6' },
                    { key: 'Space / Enter', en: 'Repeat the currently selected phrase',     tl: 'Ulitin ang kasalukuyang napiling parirala' },
                    { key: '← → ↑ ↓',      en: 'Navigate between phrases',                tl: 'Mag-navigate sa pagitan ng mga parirala' },
                    { key: 'B',             en: 'Open / close Blind Touch Pad',             tl: 'Buksan o isara ang Blind Mode' },
                    { key: 'H',             en: 'Play audio help guide',                    tl: 'Pakinggan ang gabay sa boses' },
                    { key: 'Backspace',     en: 'Return to Mode Selection Gate',            tl: 'Bumalik sa Mode Selection Gate' },
                    { key: 'Esc',           en: 'Close any open dialog',                   tl: 'Isara ang bukas na popup' },
                  ].map(({ key, en, tl: tlText }) => (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      <span className="font-mono bg-slate-100 border border-slate-300 text-slate-800 font-bold px-2 py-0.5 rounded shrink-0 min-w-[80px] text-center">
                        {key}
                      </span>
                      <span className="text-slate-600">{isTl ? tlText : en}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── SECTION 2: BLIND MODE STEP-BY-STEP ── */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border-2 border-amber-400 text-white">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-lg">🦯</span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
                    {isTl ? 'Blind Mode — Hakbang-hakbang na Gabay' : 'Blind Mode — Step-by-Step Guide'}
                  </h4>
                </div>
                <div className="space-y-2 text-xs">
                  {(isTl ? [
                    { step: '1', label: 'Paano pumasok', desc: 'Pindutin ang B sa keyboard, o pumili ng Blind Mode sa Mode Gate screen.' },
                    { step: '2', label: 'Pakikinig ng welcome', desc: 'Maririnig mo agad ang maikling gabay. Pindutin ang H kahit kailan para marinig muli ang kumpletong gabay kasama ang kasalukuyang kategorya at parirala.' },
                    { step: '3', label: 'Pumili ng parirala', desc: 'Pindutin ang 1 hanggang 6. Maririnig mo ang parirala at magsasalita ito para sa iyo. Space o Enter para ulitin ang piniling parirala.' },
                    { step: '4', label: 'Mag-navigate', desc: 'Gamitin ang Arrow keys para lumipat sa pagitan ng mga parirala. Maririnig ang numero at teksto ng bawat isa.' },
                    { step: '5', label: 'Magpalit ng kategorya', desc: 'Pindutin ang 0 para lumipat sa susunod na kategorya. Tatlong kategorya: (1) Pangangailangan, (2) Paligid at Gabay, (3) Kasama.' },
                    { step: '6', label: 'Touch / Mobile', desc: 'Ang screen ay nahahati sa 6 na zona. I-hover o i-tap ang kahit saang parte ng screen para marinig ang parirala sa ganoong lugar. Swipe pataas/pababa para magpalit ng kategorya. Swipe pakaliwa/pakanan para mag-navigate.' },
                    { step: 'SOS', label: 'Emergency', desc: 'Pindutin ang E o 9 para sa alarma. O sabihin nang dalawang beses ang "Saklolo" o "Emergency." O ugayin ang telepono ng 3 beses. O mag-tap ng 5 beses kahit saan sa screen.' },
                    { step: '←', label: 'Lumabas', desc: 'Pindutin ang Backspace o Escape para lumabas sa Blind Mode.' },
                  ] : [
                    { step: '1', label: 'How to enter', desc: 'Press B on your keyboard, or choose Blind Mode on the Mode Gate screen.' },
                    { step: '2', label: 'Welcome audio', desc: 'A short guide plays automatically when you enter. Press H at any time to hear the full guide, including your current category and phrase.' },
                    { step: '3', label: 'Select a phrase', desc: 'Press 1 to 6. The phrase plays out loud immediately. Press Space or Enter to repeat the selected phrase.' },
                    { step: '4', label: 'Navigate phrases', desc: 'Use Arrow keys to move between phrases. Each one is announced with its number and full text.' },
                    { step: '5', label: 'Switch category', desc: 'Press 0 to move to the next category. Three categories: (1) Daily Needs, (2) Navigation & Surroundings, (3) Companion to Blind.' },
                    { step: '6', label: 'Touch / Mobile', desc: 'The screen is divided into 6 zones. Hover or tap anywhere to hear the phrase for that zone. Swipe up/down to switch category. Swipe left/right to navigate phrases.' },
                    { step: 'SOS', label: 'Emergency', desc: 'Press E or 9 for alarm. Or say "Emergency" twice. Or shake phone 3 times. Or tap screen 5 times quickly anywhere.' },
                    { step: '←', label: 'Exit', desc: 'Press Backspace or Escape to exit Blind Mode.' },
                  ]).map(({ step, label, desc }) => (
                    <div key={step} className="flex items-start gap-2.5">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5 ${
                        step === 'SOS' ? 'bg-red-600 text-white' : step === '←' ? 'bg-slate-700 text-amber-300' : 'bg-amber-400 text-slate-950'
                      }`}>
                        {step}
                      </span>
                      <div>
                        <span className="font-black text-amber-200 block">{label}</span>
                        <span className="text-slate-300 leading-relaxed">{desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── SECTION 3: OTHER FEATURES ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">

                {/* Live Transcriber */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Mic className="w-4 h-4 text-rose-600" />
                    <h4 className="text-xs font-black text-[#0F3E76] uppercase tracking-wider">
                      {isTl ? 'Live Transcriber (Para sa Bingi)' : 'Live Voice Transcriber'}
                    </h4>
                  </div>
                  <ol className="text-xs text-slate-600 space-y-1 list-none">
                    <li>1. {isTl ? 'Piliin ang Deaf condition.' : 'Select the Deaf condition.'}</li>
                    <li>2. {isTl ? 'Pindutin ang "Pakinggan ang Kausap."' : 'Click "Record & Transcribe."'}</li>
                    <li>3. {isTl ? 'Pindutin ang Start Mic — magsalita ang kausap.' : 'Click Start Mic — companion speaks.'}</li>
                    <li>4. {isTl ? 'Lilitaw ang salita sa malaking text sa screen.' : 'Words appear in large real-time text.'}</li>
                    <li>5. {isTl ? 'I-tap ang Quick Reply para sumagot nang may boses.' : 'Tap a Quick Reply to speak back.'}</li>
                  </ol>
                </div>

                {/* PWD vs Caregiver */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Users className="w-4 h-4 text-sky-600" />
                    <h4 className="text-xs font-black text-[#0F3E76] uppercase tracking-wider">
                      {isTl ? 'PWD vs Kasama (Role Toggle)' : 'PWD vs Companion Toggle'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isTl
                      ? 'Ang "PWD" mode ay para sa sariling pangangailangan ng may kapansanan. Ang "Normal" mode ay para sa kasama, pamilya, o doktor na nagtatanong sa kanya. Mababago sa itaas ng screen.'
                      : '"PWD" mode is for the person with disability to express their own needs. "Normal" mode is for a companion or caregiver speaking to them. Toggle at the top of the screen.'}
                  </p>
                </div>

                {/* Show Big */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-black text-[#0F3E76] uppercase tracking-wider">
                      {isTl ? 'Show Big — Full-Screen Flashcard' : 'Show Big — Full-Screen Flashcard'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isTl
                      ? 'Pumili ng mensahe, tapos pindutin ang "Palakihin." Lalabas ang mensahe sa buong screen sa napakalaking font — perpekto para ipakita sa tindero, drayber, o doktor nang hindi kailangang magsalita.'
                      : 'Select a message, then click "Show Big." The message fills the entire screen in giant text — ideal for showing cashiers, drivers, or doctors without speaking.'}
                  </p>
                </div>

                {/* Emergency SOS */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <h4 className="text-xs font-black text-[#0F3E76] uppercase tracking-wider">
                      {isTl ? 'Emergency SOS' : 'Emergency SOS'}
                    </h4>
                  </div>
                  <ol className="text-xs text-slate-600 space-y-1">
                    <li>1. {isTl ? 'Pindutin ang pulang SOS button sa header.' : 'Tap the red SOS button in the header.'}</li>
                    <li>2. {isTl ? 'Maririnig ang malakas na alarma.' : 'A loud alarm sounds immediately.'}</li>
                    <li>3. {isTl ? 'Pindutin ang 1 para tumawag ng 911, 2 para sa Red Cross.' : 'Press 1 to call 911, press 2 for Red Cross 143.'}</li>
                    <li>4. {isTl ? 'I-save ang pangalan at emergency contact sa loob ng modal.' : 'Save your name and emergency contact inside the modal.'}</li>
                    <li>5. {isTl ? 'Sabihin ang "I\'m okay" o pindutin ang Cancel para isara.' : 'Say "I\'m okay" or press Cancel to close.'}</li>
                  </ol>
                </div>

                {/* Settings */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs sm:col-span-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sliders className="w-4 h-4 text-purple-600" />
                    <h4 className="text-xs font-black text-[#0F3E76] uppercase tracking-wider">
                      {isTl ? 'Mga Setting ng Boses at Accessibility' : 'Voice & Accessibility Settings'}
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
                    <div>• {isTl ? 'Bilis ng pagsasalita (Rate)' : 'Speech rate / speed'}</div>
                    <div>• {isTl ? 'Tono ng boses (Pitch)' : 'Voice pitch'}</div>
                    <div>• {isTl ? 'Lalaki o Babae na boses' : 'Male or female voice'}</div>
                    <div>• {isTl ? 'Laki ng font (Normal/Malaki)' : 'Font size (Normal/Large)'}</div>
                    <div>• {isTl ? 'High Contrast mode' : 'High contrast mode'}</div>
                    <div>• {isTl ? 'Auto-scan para sa switch access' : 'Auto-scan for switch access'}</div>
                    <div>• {isTl ? 'Haptic / vibration feedback' : 'Haptic vibration feedback'}</div>
                    <div>• {isTl ? 'Automatic na pagsasalita sa pagpili' : 'Auto-speak on phrase select'}</div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-sky-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
            {isTl ? 'EasyTalk para sa pantay na komunikasyon 💙' : 'EasyTalk: Empowering Dignity & Inclusion 💙'}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#0F3E76] hover:bg-[#0A2D57] text-white font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer ml-auto active:scale-95"
          >
            {isTl ? 'Naintindihan ko' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
