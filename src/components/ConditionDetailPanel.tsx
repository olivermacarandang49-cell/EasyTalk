import React from 'react';
import { DisabilityCondition, UserRoleMode, AppLanguage } from '../types';
import {
  BlindnessAvatar,
  DeafnessAvatar,
  MobilityAvatar,
  SpeechAvatar,
  AutismAvatar,
  CognitiveAvatar,
} from './ConditionAvatars';
import { EyeOff, EarOff, Accessibility, MessageSquareOff, Brain, Sparkles, Heart, Mic } from 'lucide-react';

interface ConditionDetailPanelProps {
  condition: DisabilityCondition;
  onOpenTips: () => void;
  userRole?: UserRoleMode;
  language?: AppLanguage;
  onOpenListenTranscribe?: () => void;
}

export const ConditionDetailPanel: React.FC<ConditionDetailPanelProps> = ({
  condition,
  onOpenTips,
  userRole = 'pwd',
  language = 'en',
  onOpenListenTranscribe,
}) => {
  const renderConditionIcon = () => {
    switch (condition.id) {
      case 'blindness':
        return <EyeOff className="w-5 h-5 text-white" />;
      case 'deafness':
        return <EarOff className="w-5 h-5 text-white" />;
      case 'mobility':
        return <Accessibility className="w-5 h-5 text-white" />;
      case 'speech':
        return <MessageSquareOff className="w-5 h-5 text-white" />;
      case 'autism':
        return <Brain className="w-5 h-5 text-white" />;
      case 'cognitive':
        return <Sparkles className="w-5 h-5 text-white" />;
      default:
        return <Heart className="w-5 h-5 text-white" />;
    }
  };

  const renderCharacterIllustration = () => {
    switch (condition.id) {
      case 'blindness':
        return <BlindnessAvatar size={76} />;
      case 'deafness':
        return <DeafnessAvatar size={76} />;
      case 'mobility':
        return <MobilityAvatar size={76} />;
      case 'speech':
        return <SpeechAvatar size={76} />;
      case 'autism':
        return <AutismAvatar size={76} />;
      case 'cognitive':
        return <CognitiveAvatar size={76} />;
      default:
        return <DeafnessAvatar size={76} />;
    }
  };

  const renderMiniIllustration = () => {
    switch (condition.id) {
      case 'blindness':
        return <BlindnessAvatar size={26} />;
      case 'deafness':
        return <DeafnessAvatar size={26} />;
      case 'mobility':
        return <MobilityAvatar size={26} />;
      case 'speech':
        return <SpeechAvatar size={26} />;
      case 'autism':
        return <AutismAvatar size={26} />;
      case 'cognitive':
        return <CognitiveAvatar size={26} />;
      default:
        return <BlindnessAvatar size={26} />;
    }
  };

  return (
    <>
      {/* Mobile Compact Bar (Zero-scroll ultra-slim layout) */}
      <div className="flex md:hidden items-center justify-between gap-1.5 py-1 px-2 rounded-xl bg-gradient-to-r from-sky-50 to-white border border-sky-200/80 shadow-xs select-none">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0F3E76] text-white text-[10px] font-bold shadow-xs">
            {renderConditionIcon()}
            <span>{condition.name}</span>
          </div>
          <div className="shrink-0">
            {renderMiniIllustration()}
          </div>
        </div>

        <div className="flex-1 min-w-0 bg-white border border-sky-300 rounded-lg px-2 py-0.5 text-center shadow-xs">
          <p className="text-[10px] font-bold text-[#0F3E76] leading-tight truncate">
            {userRole === 'companion' ? 'Speak clearly!' : condition.characterSpeech}
          </p>
        </div>

        {condition.id === 'deafness' && onOpenListenTranscribe && (
          <button
            onClick={onOpenListenTranscribe}
            className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black shadow-xs cursor-pointer active:scale-95 animate-pulse"
            title="Live Voice Recorder (Makinig sa Kausap)"
          >
            <Mic className="w-3 h-3" />
            <span>{language === 'tl' ? 'Pakinggan' : 'Listen'}</span>
          </button>
        )}



        <button
          onClick={onOpenTips}
          className="shrink-0 p-1 rounded-md bg-sky-100 text-sky-800 text-[10px] font-bold"
          title="Tips"
        >
          💡
        </button>
      </div>

      {/* Desktop Full Column matching original design */}
      <div className="hidden md:flex flex-col justify-between h-full bg-gradient-to-b from-sky-50/50 to-white/90 p-3 sm:p-4 rounded-2xl border border-sky-200/70 select-none overflow-hidden w-full">
        <div>
          {/* Condition Header Pill matching screenshot */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F3E76] text-white shadow-sm mb-2.5">
            {renderConditionIcon()}
            <span className="text-sm font-bold tracking-wide">
              {condition.name}
            </span>
          </div>

          {/* Subtitle matching mode */}
          <p className="text-xs sm:text-sm font-medium text-slate-700 leading-snug mb-3">
            {userRole === 'companion'
              ? `Ways you can communicate with ${condition.id === 'blindness' ? 'a blind' : condition.id === 'deafness' ? 'a deaf' : `a ${condition.name}`} person:`
              : condition.overview}
          </p>
        </div>

        {/* Character with speech bubble (never overflows container) */}
        <div className="relative flex items-center justify-start gap-2 pt-1 pb-1 w-full max-w-full">
          {/* Character Avatar */}
          <div className="shrink-0 transition-transform hover:scale-105 duration-200">
            {renderCharacterIllustration()}
          </div>

          {/* Speech Bubble with flex-1 min-w-0 to fit within boundaries */}
          <div className="relative flex-1 min-w-0 bg-white border-2 border-sky-300 rounded-2xl px-2.5 py-2 shadow-xs">
            {/* Bubble tail pointing left towards character */}
            <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-sky-300 border-b-[6px] border-b-transparent" />
            <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-r-[7px] border-r-white border-b-[5px] border-b-transparent" />
            
            <p className="text-[11px] sm:text-xs font-bold text-[#0F3E76] leading-snug text-center break-words">
              {userRole === 'companion' ? 'Speak clearly and give us time to respond!' : condition.characterSpeech}
            </p>
            <div className="flex justify-center mt-1 text-[#0284C7]">
              <Heart className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>
        </div>

        {/* Voice Recording Feature for Deaf */}
        {condition.id === 'deafness' && onOpenListenTranscribe && (
          <div className="my-2 p-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-md border-2 border-blue-400">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                {language === 'tl' ? 'Live Transcriber ng Kausap' : 'Live Voice Transcriber'}
              </span>
            </div>
            <button
              onClick={onOpenListenTranscribe}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white text-[#0F3E76] hover:bg-sky-50 font-black text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>{language === 'tl' ? 'Pakinggan ang Kausap' : 'Record & Transcribe'}</span>
            </button>
            <p className="text-[9.5px] text-blue-100 font-medium text-center mt-1 leading-tight">
              {language === 'tl' ? 'Kusang lalabas ang salita habang nagsasalita siya' : 'Real-time captions appear as they speak'}
            </p>
          </div>
        )}

        {/* Bottom helper tip button */}
        <div className="pt-2">
          <button
            onClick={onOpenTips}
            className="w-full text-left text-[11px] font-semibold text-sky-700 hover:text-sky-900 bg-sky-100/70 hover:bg-sky-100 px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
          >
            <span>{language === 'tl' ? '💡 Kagandahang-asal at gabay sa komunikasyon' : '💡 Etiquette & communication tips'}</span>
            <span className="text-xs font-bold">→</span>
          </button>
        </div>
      </div>
    </>
  );
};
