import React from 'react';
import { EasyTalkLogo, HeaderCharactersGroup } from './ConditionAvatars';
import { UserRoleMode, AppLanguage } from '../types';
import { Home, Settings2, AlertTriangle, HelpCircle, Volume2, Maximize2, Users, User, ArrowLeft, Info, Globe, ExternalLink } from 'lucide-react';

interface HeaderProps {
  onHomeClick: () => void;
  onOpenSettings: () => void;
  onOpenTips: () => void;
  onOpenAbout: () => void;
  onEmergencySOS: () => void;
  onToggleFullscreen: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  userRole: UserRoleMode;
  onToggleUserRole: (role: UserRoleMode) => void;
  currentLanguage: AppLanguage;
  onToggleLanguage: (lang: AppLanguage) => void;
  onBackToGate?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onHomeClick,
  onOpenSettings,
  onOpenTips,
  onOpenAbout,
  onEmergencySOS,
  onToggleFullscreen,
  soundEnabled,
  onToggleSound,
  userRole,
  onToggleUserRole,
  currentLanguage,
  onToggleLanguage,
  onBackToGate,
}) => {
  return (
    <header className="relative w-full bg-gradient-to-b from-sky-100/90 via-sky-50/70 to-transparent py-1 sm:pt-3 sm:pb-2 px-2 sm:px-6 md:px-8 border-b border-sky-200/60 select-none shrink-0">
      {/* Mobile Single Row (sm:hidden) */}
      <div className="flex sm:hidden items-center justify-between gap-1 w-full overflow-x-auto scrollbar-none safe-x">
        {/* Brand */}
        <div 
          onClick={onHomeClick}
          className="flex items-center gap-1 cursor-pointer shrink-0"
          role="button"
          tabIndex={0}
          aria-label="EasyTalk Home"
        >
          <EasyTalkLogo size={24} className="drop-shadow-xs" />
          <div className="flex flex-col leading-none">
            <span className="text-[11px] font-black text-[#0F3E76]">EasyTalk</span>
            <span className="text-[7.5px] font-bold text-[#0284C7]">for PWD</span>
          </div>
        </div>

        {/* Language Pill Mobile */}
        <div className="flex items-center p-0.5 bg-white/95 rounded-full border border-sky-300 shadow-2xs shrink-0">
          <button
            onClick={() => onToggleLanguage('en')}
            className={`px-2 py-1.5 rounded-full text-[9px] font-bold transition-all cursor-pointer min-h-[36px] ${
              currentLanguage === 'en'
                ? 'bg-[#0F3E76] text-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="English (Male Voice / Boses Lalaki)"
          >
            👨 EN
          </button>
          <button
            onClick={() => onToggleLanguage('tl')}
            className={`px-2 py-1.5 rounded-full text-[9px] font-bold transition-all cursor-pointer flex items-center gap-0.5 min-h-[36px] ${
              currentLanguage === 'tl'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-rose-700'
            }`}
            title="Tagalog (Female Voice / Boses Babae)"
          >
            <span>👩 TL</span>
          </button>
        </div>

        {/* Role Toggle Pill Mobile */}
        <div className="flex items-center p-0.5 bg-white/90 rounded-full border border-sky-300 shrink-0">
          <button
            onClick={() => onToggleUserRole('pwd')}
            className={`px-2 py-1.5 rounded-full text-[9px] font-bold transition-all cursor-pointer min-h-[36px] ${
              userRole === 'pwd'
                ? 'bg-[#0F3E76] text-white shadow-xs'
                : 'text-slate-600'
            }`}
          >
            PWD
          </button>
          <button
            onClick={() => onToggleUserRole('companion')}
            className={`px-2 py-1.5 rounded-full text-[9px] font-bold transition-all cursor-pointer min-h-[36px] ${
              userRole === 'companion'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600'
            }`}
          >
            {currentLanguage === 'tl' ? 'Kasama' : 'Companion'}
          </button>
        </div>

        {/* Quick Action Icons — larger touch targets */}
        <div className="flex items-center gap-0.5 shrink-0">
          {onBackToGate && (
            <button
              onClick={onBackToGate}
              className="flex items-center gap-0.5 px-2 py-2 rounded-full bg-white text-[#0F3E76] font-bold text-[10px] border border-sky-400 shadow-xs cursor-pointer active:scale-95 min-h-[36px]"
              title="Back to Mode Gate"
            >
              <ArrowLeft className="w-3 h-3 text-[#0284C7]" />
              <span>Back</span>
            </button>
          )}

          <button
            onClick={onEmergencySOS}
            className="flex items-center gap-1 px-2 py-2 rounded-full bg-red-600 text-white font-bold text-[10px] shadow-xs active:scale-95 cursor-pointer min-h-[36px]"
            title="Emergency SOS"
          >
            <AlertTriangle className="w-3 h-3 text-amber-200 animate-pulse" />
            <span>SOS</span>
          </button>

          <button
            onClick={onToggleSound}
            className={`p-2 rounded-full cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center ${
              soundEnabled ? 'bg-sky-100 text-[#0F3E76]' : 'bg-slate-200 text-slate-500'
            }`}
            title="Toggle Sound"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full bg-sky-100 text-[#0F3E76] cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAbout}
            className="p-2 rounded-full bg-sky-100 text-[#0F3E76] cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="About EasyTalk"
            aria-label="About EasyTalk"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Responsive Row (sm and up) */}
      <div className="hidden sm:flex max-w-7xl mx-auto flex-wrap items-center justify-between gap-y-2 gap-x-2.5 w-full">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div 
            onClick={onHomeClick}
            className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
            role="button"
            tabIndex={0}
            aria-label="EasyTalk Home"
          >
            <EasyTalkLogo size={40} className="drop-shadow-sm" />
          </div>

          <div className="flex items-baseline gap-2">
            <div className="flex flex-col">
              <span className="text-xl lg:text-2xl font-extrabold tracking-tight text-[#0F3E76] leading-none">
                EasyTalk
              </span>
              <span className="text-xs font-bold text-[#0284C7] tracking-wider mt-0.5">
                for PWD
              </span>
            </div>

            <span className="hidden 2xl:inline-block text-xl text-sky-400 font-light select-none">
              |
            </span>

            <span className="hidden 2xl:inline-block text-sm font-semibold italic text-[#1E3A8A] tracking-normal">
              Because every voice matters.
            </span>
          </div>
        </div>

        {/* Center: Language Switcher & Two-Way Communicator Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Compact Language Switcher Pill */}
          <div className="flex items-center p-0.5 bg-white/95 rounded-full border border-sky-300 shadow-xs">
            <button
              onClick={() => onToggleLanguage('en')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                currentLanguage === 'en'
                  ? 'bg-[#0F3E76] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0F3E76]'
              }`}
              title="English Mode (Male Voice / Boses Lalaki)"
            >
              <span>👨 EN</span>
            </button>
            <button
              onClick={() => onToggleLanguage('tl')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                currentLanguage === 'tl'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
              title="Tagalog Mode (Female Voice / Boses Babae)"
            >
              <span>👩 Tagalog</span>
            </button>
          </div>

          {/* Two-Way Communicator Toggle */}
          <div className="flex items-center p-0.5 bg-white/90 rounded-full border border-sky-300 shadow-xs">
            <button
              onClick={() => onToggleUserRole('pwd')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                userRole === 'pwd'
                  ? 'bg-[#0F3E76] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0F3E76]'
              }`}
              title={currentLanguage === 'tl' ? 'Taong may kapansanan (PWD)' : 'I am a Person with Disability (speaking my needs)'}
            >
              <User className="w-3.5 h-3.5" />
              <span>PWD</span>
            </button>
            <button
              onClick={() => onToggleUserRole('companion')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                userRole === 'companion'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
              title={currentLanguage === 'tl' ? 'Kasama / Normal na kumakausap sa PWD' : 'I am a companion, doctor, family, or cashier speaking TO a PWD'}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{currentLanguage === 'tl' ? 'Kasama' : 'Companion'}</span>
            </button>
          </div>
        </div>

        {/* Right: Quick Assistive Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onBackToGate && (
            <button
              onClick={onBackToGate}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white hover:bg-sky-50 active:bg-sky-100 text-[#0F3E76] font-bold text-xs border border-sky-400 shadow-xs transition-all cursor-pointer"
              title="Back to Mode Selection"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>Back</span>
            </button>
          )}

          <button
            onClick={onEmergencySOS}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            title="Emergency SOS Alert"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
            <span>SOS</span>
          </button>

          <button
            onClick={onHomeClick}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#0F3E76] hover:bg-[#0A2D57] active:bg-[#071F3D] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <button
            onClick={onToggleSound}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              soundEnabled 
                ? 'bg-sky-100 text-[#0F3E76] hover:bg-sky-200' 
                : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
            }`}
            title="Toggle Sound"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleFullscreen}
            className="p-1.5 rounded-full bg-sky-100 text-[#0F3E76] hover:bg-sky-200 transition-colors cursor-pointer"
            title="Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenTips}
            className="p-1.5 rounded-full bg-sky-100 text-[#0F3E76] hover:bg-sky-200 transition-colors cursor-pointer"
            title="Tips"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-full bg-sky-100 text-[#0F3E76] hover:bg-sky-200 transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenAbout}
            className="p-1.5 rounded-full bg-sky-100 text-[#0F3E76] hover:bg-sky-200 transition-colors cursor-pointer"
            title="About EasyTalk"
            aria-label="About EasyTalk"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => window.open(window.location.href, '_blank')}
            className="p-1.5 rounded-full bg-sky-100 text-[#0F3E76] hover:bg-sky-200 transition-colors cursor-pointer"
            title="Open in Chrome / Browser"
            aria-label="Open in Chrome / Browser"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
