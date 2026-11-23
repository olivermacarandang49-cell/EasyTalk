import React from 'react';
import { DisabilityConditionId, AppLanguage } from '../types';
import {
  DeafnessAvatar,
  MobilityAvatar,
  SpeechAvatar,
  AutismAvatar,
  CognitiveAvatar,
} from './ConditionAvatars';
import { MousePointerClick } from 'lucide-react';

interface ConditionSelectorProps {
  selectedCondition: DisabilityConditionId;
  onSelectCondition: (id: DisabilityConditionId) => void;
  activeScanIndex?: number;
  language?: AppLanguage;
}

interface ConditionItem {
  id: DisabilityConditionId;
  label: string;
  avatar: React.ReactNode;
}

export const ConditionSelector: React.FC<ConditionSelectorProps> = ({
  selectedCondition,
  onSelectCondition,
  activeScanIndex = -1,
  language = 'en',
}) => {
  const isTl = language === 'tl';
  const conditions: ConditionItem[] = [
    {
      id: 'deafness',
      label: isTl ? 'Bingi (Deaf)' : 'Deaf',
      avatar: <DeafnessAvatar size={92} className="mx-auto drop-shadow-sm" />,
    },
    {
      id: 'mobility',
      label: isTl ? 'Pagkilos (Mobility)' : 'Mobility Impairment',
      avatar: <MobilityAvatar size={92} className="mx-auto drop-shadow-sm" />,
    },
    {
      id: 'speech',
      label: isTl ? 'Pagsasalita (Speech)' : 'Speech Impairment',
      avatar: <SpeechAvatar size={92} className="mx-auto drop-shadow-sm" />,
    },
    {
      id: 'autism',
      label: 'Autism',
      avatar: <AutismAvatar size={92} className="mx-auto drop-shadow-sm" />,
    },
    {
      id: 'cognitive',
      label: isTl ? 'Pag-unawa (Cognitive)' : 'Cognitive Impairment',
      avatar: <CognitiveAvatar size={92} className="mx-auto drop-shadow-sm" />,
    },
  ];

  const renderMiniAvatar = (id: DisabilityConditionId) => {
    switch (id) {
      case 'deafness':
        return <DeafnessAvatar size={20} />;
      case 'mobility':
        return <MobilityAvatar size={20} />;
      case 'speech':
        return <SpeechAvatar size={20} />;
      case 'autism':
        return <AutismAvatar size={20} />;
      case 'cognitive':
        return <CognitiveAvatar size={20} />;
      default:
        return null;
    }
  };

  return (
    <section className="w-full select-none shrink-0" aria-label="Disability Condition Selection">
      {/* "Select a Condition:" Label Pill matching screenshot (Desktop) */}
      <div className="hidden sm:flex items-center gap-2 mb-2 sm:mb-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F3E76] text-white shadow-sm">
          <MousePointerClick className="w-4 h-4 text-sky-300" />
          <span className="text-xs sm:text-sm font-bold tracking-wide">
            {isTl ? 'Pumili ng Kondisyon:' : 'Select a Condition:'}
          </span>
        </div>
      </div>

      {/* Mobile Compact Horizontal Strip (Zero-scroll compact fit) */}
      <div className="flex sm:hidden items-center gap-1 overflow-x-auto scrollbar-none py-0.5 px-0.5">
        {conditions.map((item, index) => {
          const isSelected = selectedCondition === item.id;
          const isScanned = activeScanIndex === index;

          return (
            <button
              key={`mobile-${item.id}`}
              onClick={() => onSelectCondition(item.id)}
              className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#0F3E76] text-white shadow-xs ring-1 ring-sky-400'
                  : 'bg-white text-slate-700 border border-sky-200 hover:border-sky-400'
              } ${isScanned ? 'ring-2 ring-amber-400 animate-pulse' : ''}`}
            >
              <span className="w-4 h-4 flex items-center justify-center shrink-0">
                {renderMiniAvatar(item.id)}
              </span>
              <span className="whitespace-nowrap text-[10px] font-bold">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Desktop 5 Cards Container */}
      <div className="hidden sm:grid sm:grid-cols-5 gap-2 sm:gap-2.5 lg:gap-3.5 w-full">
        {conditions.map((item, index) => {
          const isSelected = selectedCondition === item.id;
          const isScanned = activeScanIndex === index;

          return (
            <button
              key={item.id}
              onClick={() => onSelectCondition(item.id)}
              aria-pressed={isSelected}
              className={`group relative flex flex-col items-center justify-between p-2 sm:p-2.5 lg:p-3 rounded-2xl sm:rounded-3xl min-w-0 w-full transition-all duration-200 cursor-pointer text-center bg-white/95 ${
                isSelected
                  ? 'border-[3px] border-[#0284C7] ring-4 ring-sky-300/60 shadow-md scale-[1.02]'
                  : 'border-2 border-sky-200/90 hover:border-sky-400 hover:shadow-sm active:scale-[0.98]'
              } ${isScanned ? 'ring-4 ring-amber-400 animate-pulse' : ''}`}
            >
              {/* Character Illustration */}
              <div className="w-full flex items-center justify-center pt-1 pb-2">
                <div className="transition-transform group-hover:scale-105 duration-200">
                  {item.avatar}
                </div>
              </div>

              {/* Bottom Condition Pill Label */}
              <div
                className={`w-full py-1.5 px-2 rounded-full text-xs font-bold transition-colors truncate ${
                  isSelected
                    ? 'bg-[#0F3E76] text-white shadow-sm'
                    : 'bg-[#1E3A8A] text-white group-hover:bg-[#0F3E76]'
                }`}
              >
                {item.label}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
