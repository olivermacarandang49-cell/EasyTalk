import React, { useState } from 'react';
import { QuickMessage, DisabilityCondition, UserRoleMode, AppLanguage } from '../types';
import { MessageIcon } from './ConditionAvatars';
import {
  CORE_QUICK_MESSAGES,
  CORE_QUICK_MESSAGES_TL,
  COMPANION_CORE_MESSAGES,
  COMPANION_CORE_MESSAGES_TL,
  COMPANION_SPECIAL_PHRASES,
  COMPANION_SPECIAL_PHRASES_TL,
  EXTENDED_CATEGORY_PHRASES,
  EXTENDED_CATEGORY_PHRASES_TL,
} from '../data/conditionsData';
import { PlusCircle, Sparkles } from 'lucide-react';

interface MessageGridProps {
  currentMessage: string;
  onSelectMessage: (text: string, iconName?: string) => void;
  onOpenCustomModal: () => void;
  condition: DisabilityCondition;
  savedCustomPhrases: string[];
  activeScanIndex?: number;
  userRole?: UserRoleMode;
  language?: AppLanguage;
  onOpenListenTranscribe?: () => void;
}

type TabType = 'core' | 'specialized' | 'daily' | 'health' | 'emotions' | 'places';

export const MessageGrid: React.FC<MessageGridProps> = ({
  currentMessage,
  onSelectMessage,
  onOpenCustomModal,
  condition,
  savedCustomPhrases,
  activeScanIndex = -1,
  userRole = 'pwd',
  language = 'en',
  onOpenListenTranscribe,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('core');

  const handleCardClick = (msg: QuickMessage | { id: string; text: string; iconName: string }) => {
    if (msg.text === 'Custom Message' || msg.text === 'Sariling Mensahe') {
      onSelectMessage(msg.text, 'custom');
      onOpenCustomModal();
    } else {
      onSelectMessage(msg.text, msg.iconName);
    }
  };

  const isTl = language === 'tl';
  const coreList = isTl
    ? (userRole === 'companion' ? COMPANION_CORE_MESSAGES_TL : CORE_QUICK_MESSAGES_TL)
    : (userRole === 'companion' ? COMPANION_CORE_MESSAGES : CORE_QUICK_MESSAGES);

  const specializedList = isTl
    ? (userRole === 'companion' ? (COMPANION_SPECIAL_PHRASES_TL[condition.id] || []) : condition.specialPhrases)
    : (userRole === 'companion' ? (COMPANION_SPECIAL_PHRASES[condition.id] || []) : condition.specialPhrases);

  // Render Core Grid (matching screenshot or companion mode)
  const renderCoreGrid = () => (
    <div className="grid grid-cols-2 gap-1 sm:gap-3 h-full">
      {coreList.map((msg, index) => {
        const isSelected = currentMessage.trim().toLowerCase() === msg.text.trim().toLowerCase();
        const isScanned = activeScanIndex === index;

        return (
          <button
            key={msg.id}
            onClick={() => handleCardClick(msg)}
            aria-pressed={isSelected}
            className={`group flex items-center gap-1.5 sm:gap-3 p-1.5 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all duration-150 text-left cursor-pointer border-2 shadow-xs ${
              isSelected
                ? 'bg-sky-50 border-[#0284C7] ring-1 sm:ring-2 ring-sky-300'
                : 'bg-white border-sky-200/90 hover:border-sky-400 hover:bg-sky-50/40 active:scale-[0.98]'
            } ${isScanned ? 'ring-4 ring-amber-400 animate-pulse' : ''}`}
          >
            {/* Icon Container matching screenshot */}
            <div className="shrink-0 w-6 h-6 sm:w-11 sm:h-11 rounded-md sm:rounded-xl bg-sky-50 flex items-center justify-center p-0.5 sm:p-1.5 transition-transform group-hover:scale-105">
              <MessageIcon name={msg.iconName} className="w-4 h-4 sm:w-8 sm:h-8" />
            </div>

            {/* Label */}
            <span className="text-[11px] sm:text-base font-bold text-[#0F3E76] leading-tight line-clamp-2">
              {msg.text}
            </span>
          </button>
        );
      })}
    </div>
  );

  // Render Specialized Condition Phrases
  const renderSpecializedGrid = () => (
    <div className="grid grid-cols-2 gap-1 sm:gap-3 h-full">
      {specializedList.map((msg, index) => {
        const isSelected = currentMessage.trim().toLowerCase() === msg.text.trim().toLowerCase();
        const isScanned = activeScanIndex === index;

        return (
          <button
            key={msg.id}
            onClick={() => handleCardClick(msg)}
            aria-pressed={isSelected}
            className={`group flex items-center gap-1.5 sm:gap-3 p-1.5 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all duration-150 text-left cursor-pointer border-2 shadow-xs ${
              isSelected
                ? 'bg-sky-50 border-[#0284C7] ring-1 sm:ring-2 ring-sky-300'
                : 'bg-white border-sky-200/90 hover:border-sky-400 hover:bg-sky-50/40 active:scale-[0.98]'
            } ${isScanned ? 'ring-4 ring-amber-400 animate-pulse' : ''}`}
          >
            <div className="shrink-0 w-6 h-6 sm:w-10 sm:h-10 rounded-md sm:rounded-xl bg-sky-50 flex items-center justify-center p-0.5 sm:p-1.5">
              <MessageIcon name={msg.iconName} className="w-4 h-4 sm:w-7 sm:h-7" />
            </div>
            <span className="text-[11px] sm:text-sm font-bold text-[#0F3E76] leading-snug line-clamp-2">
              {msg.text}
            </span>
          </button>
        );
      })}
    </div>
  );

  // Render Extended Category Grid
  const renderCategoryGrid = (categoryKey: string) => {
    const categorySource = isTl ? EXTENDED_CATEGORY_PHRASES_TL : EXTENDED_CATEGORY_PHRASES;
    const category = categorySource[categoryKey];
    if (!category) return null;

    return (
      <div className="grid grid-cols-2 gap-1.5 sm:gap-3 h-full max-h-[260px] overflow-y-auto pr-1">
        {category.phrases.map((phraseText, idx) => {
          const isSelected = currentMessage.trim().toLowerCase() === phraseText.trim().toLowerCase();

          return (
            <button
              key={`${categoryKey}-${idx}`}
              onClick={() => onSelectMessage(phraseText)}
              aria-pressed={isSelected}
              className={`flex items-center gap-2 p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-150 text-left cursor-pointer border-2 shadow-xs ${
                isSelected
                  ? 'bg-sky-50 border-[#0284C7] ring-2 ring-sky-300'
                  : 'bg-white border-sky-200/90 hover:border-sky-400 hover:bg-sky-50/40 active:scale-[0.98]'
              }`}
            >
              <span className="text-base sm:text-xl shrink-0">{category.icon}</span>
              <span className="text-xs sm:text-sm font-bold text-[#0F3E76] leading-tight line-clamp-2">
                {phraseText}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col justify-between h-full select-none">
      {/* Category Tabs */}
      <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 sm:pb-2 mb-0.5 sm:mb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('core')}
          className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'core'
              ? 'bg-[#0F3E76] text-white shadow-xs'
              : 'bg-sky-100 text-sky-800 hover:bg-sky-200'
          }`}
        >
          {isTl
            ? (userRole === 'companion' ? 'Tagapag-alaga' : 'Pangunahin')
            : (userRole === 'companion' ? 'Caregiver Phrases' : 'Core Phrases')}
        </button>

        <button
          onClick={() => setActiveTab('specialized')}
          className={`flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'specialized'
              ? 'bg-[#0F3E76] text-white shadow-xs'
              : 'bg-sky-100 text-sky-800 hover:bg-sky-200'
          }`}
        >
          <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300" />
          <span>
            {isTl
              ? (userRole === 'companion' ? `Para sa ${condition.name}` : `${condition.name}`)
              : (userRole === 'companion' ? `Speaking to ${condition.name}` : `${condition.name} Phrases`)}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('daily')}
          className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'daily'
              ? 'bg-[#0F3E76] text-white shadow-xs'
              : 'bg-sky-100 text-sky-800 hover:bg-sky-200'
          }`}
        >
          {isTl ? 'Pang-araw-araw' : 'Daily Needs'}
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'health'
              ? 'bg-[#0F3E76] text-white shadow-xs'
              : 'bg-sky-100 text-sky-800 hover:bg-sky-200'
          }`}
        >
          {isTl ? 'Kalusugan' : 'Health & Pain'}
        </button>

        <button
          onClick={() => setActiveTab('emotions')}
          className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'emotions'
              ? 'bg-[#0F3E76] text-white shadow-xs'
              : 'bg-sky-100 text-sky-800 hover:bg-sky-200'
          }`}
        >
          {isTl ? 'Damdamin' : 'Feelings'}
        </button>

        <button
          onClick={() => setActiveTab('places')}
          className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'places'
              ? 'bg-[#0F3E76] text-white shadow-xs'
              : 'bg-sky-100 text-sky-800 hover:bg-sky-200'
          }`}
        >
          {isTl ? 'Lugar' : 'Places'}
        </button>

        {/* Custom Message Quick Button */}
        <button
          onClick={onOpenCustomModal}
          className="flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold text-sky-900 bg-sky-200 hover:bg-sky-300 whitespace-nowrap ml-auto"
          title={isTl ? 'Mag-type ng sariling mensahe' : 'Type or Compose Custom Message'}
        >
          <PlusCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>{isTl ? 'I-type' : 'Type'}</span>
        </button>
      </div>

      {/* Grid Content */}
      <div className="flex-1 py-1">
        {activeTab === 'core' && renderCoreGrid()}
        {activeTab === 'specialized' && renderSpecializedGrid()}
        {activeTab === 'daily' && renderCategoryGrid('daily')}
        {activeTab === 'health' && renderCategoryGrid('health')}
        {activeTab === 'emotions' && renderCategoryGrid('emotions')}
        {activeTab === 'places' && renderCategoryGrid('places')}
      </div>

      {/* Saved Custom Phrases Quick Strip if any exists */}
      {savedCustomPhrases.length > 0 && activeTab === 'core' && (
        <div className="mt-2 pt-2 border-t border-sky-100 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="font-semibold text-slate-500 shrink-0">
            {isTl ? 'Nai-save:' : 'Saved:'}
          </span>
          {savedCustomPhrases.slice(0, 4).map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => onSelectMessage(phrase)}
              className="px-2.5 py-1 bg-white hover:bg-sky-50 border border-sky-200 rounded-lg text-slate-700 font-medium whitespace-nowrap truncate max-w-[150px]"
            >
              {phrase}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
