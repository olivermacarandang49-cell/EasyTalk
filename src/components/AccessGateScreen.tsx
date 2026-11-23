import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EasyTalkLogo } from './ConditionAvatars';
import {
  speakText,
  playSuccessChime,
  playConditionTone,
  triggerHapticFeedback,
} from '../utils/audioUtils';
import { VoiceSettings } from '../types';
import { ChevronUp, EyeOff, Sparkles, Volume2, Hand } from 'lucide-react';

interface AccessGateScreenProps {
  onSelectBlindMode: () => void;
  onSelectStandardMode: () => void;
  voiceSettings: VoiceSettings;
}

export const AccessGateScreen: React.FC<AccessGateScreenProps> = ({
  onSelectBlindMode,
  onSelectStandardMode,
  voiceSettings,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const hasSpokenAnnouncement = useRef(false);
  const [gestureFeedback, setGestureFeedback] = useState<string | null>(null);

  // Auto-focus container & window for instant keyboard responsiveness in iframes
  useEffect(() => {
    try {
      window.focus();
      containerRef.current?.focus();
    } catch {
      // ignore
    }
  }, []);

  const handleBlindChoice = useCallback(() => {
    triggerHapticFeedback([60, 60, 120]);
    playConditionTone('blindness');
    const isTl = voiceSettings.language === 'tl';
    speakText(
      isTl ? 'Napili ang Blind Mode. Inihahanda ang audio touch pad.' : 'Blind Mode selected. Preparing your audio touch pad.',
      {
        rate: voiceSettings.rate,
        pitch: voiceSettings.pitch,
        language: voiceSettings.language,
        voiceGender: voiceSettings.voiceGender,
      }
    );
    onSelectBlindMode();
  }, [voiceSettings, onSelectBlindMode]);

  const handleStandardChoice = useCallback(() => {
    triggerHapticFeedback(50);
    playSuccessChime();
    const isTl = voiceSettings.language === 'tl';
    speakText(
      isTl ? 'Maligayang pagdating sa EasyTalk. Binubuksan ang communication board.' : 'Welcome to EasyTalk. Starting communication board.',
      {
        rate: voiceSettings.rate,
        pitch: voiceSettings.pitch,
        language: voiceSettings.language,
        voiceGender: voiceSettings.voiceGender,
      }
    );
    onSelectStandardMode();
  }, [voiceSettings, onSelectStandardMode]);

  // Voice announcement on entrance
  useEffect(() => {
    if (hasSpokenAnnouncement.current) return;
    hasSpokenAnnouncement.current = true;

    playSuccessChime();
    const timeout = setTimeout(() => {
      const isTl = voiceSettings.language === 'tl';
      const welcomeText = isTl
        ? 'Maligayang pagdating sa EasyTalk. Kung nasa computer ka: Pindutin ang SPACEBAR para sa Blind Mode, o pindutin ang ENTER para magpatuloy. Kung nasa mobile phone: Mag-swipe ng dalawang daliri kung ikaw ay bulag, o mag-swipe pataas kung hindi.'
        : 'Welcome to EasyTalk. If you are on a computer or keyboard: Press SPACEBAR for Blind Mode, or press ENTER for Standard Mode. On a mobile phone: Swipe with two fingers if you are blind, or swipe up if you are not.';

      speakText(welcomeText, {
        rate: voiceSettings.rate,
        pitch: voiceSettings.pitch,
        volume: voiceSettings.volume,
        voiceURI: voiceSettings.voiceURI,
        language: voiceSettings.language,
        voiceGender: voiceSettings.voiceGender,
      });
    }, 250);

    return () => clearTimeout(timeout);
  }, [voiceSettings]);

  // Keyboard navigation on this screen:
  // PC BLIND KEY: Spacebar (keyCode 32) or 'b' or '2'
  // PC STANDARD KEY: Enter (keyCode 13) or ArrowUp
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isSpace =
        e.keyCode === 32 ||
        e.code === 'Space' ||
        e.key === ' ' ||
        e.key === 'Space' ||
        e.key === 'Spacebar' ||
        e.key.toLowerCase() === 'b';

      const isEnter =
        e.keyCode === 13 ||
        e.code === 'Enter' ||
        e.code === 'NumpadEnter' ||
        e.key === 'Enter' ||
        e.key === 'ArrowUp';

      if (isSpace) {
        e.preventDefault();
        e.stopPropagation();
        setGestureFeedback('⌨️ Spacebar detected: Blind Mode!');
        handleBlindChoice();
      } else if (isEnter) {
        e.preventDefault();
        e.stopPropagation();
        setGestureFeedback('⌨️ Enter detected: Standard Mode!');
        handleStandardChoice();
      } else if (e.key.toLowerCase() === 'h' || e.key === '?') {
        e.preventDefault();
        speakText(
          'On PC: Press SPACEBAR for Blind Mode, or press ENTER for Standard Mode. On mobile phone: Swipe with two fingers for Blind, or swipe up if not.',
          { rate: voiceSettings.rate }
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [handleBlindChoice, handleStandardChoice, voiceSettings.rate]);

  // Touch handlers: Detect 2-finger touch OR Swipe Up
  const handleTouchStart = (e: React.TouchEvent) => {
    // Check if 2 fingers are touching the screen
    if (e.touches.length === 2) {
      setGestureFeedback('✌️ 2-Finger detected: Blind Mode!');
      handleBlindChoice();
      return;
    }

    if (e.touches.length === 1) {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // If 2 fingers touch during move
    if (e.touches.length >= 2) {
      setGestureFeedback('✌️ 2-Finger detected: Blind Mode!');
      handleBlindChoice();
      return;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // If 2 fingers were used in this interaction
    if (e.changedTouches.length >= 2) {
      setGestureFeedback('✌️ 2-Finger detected: Blind Mode!');
      handleBlindChoice();
      return;
    }

    if (touchStartY.current === null) return;

    if (e.changedTouches.length > 0) {
      const endY = e.changedTouches[0].clientY;
      const endX = e.changedTouches[0].clientX;
      const deltaY = endY - touchStartY.current;
      const deltaX = endX - (touchStartX.current ?? endX);

      // Detect Swipe Up (deltaY is negative and significant)
      if (deltaY < -50 && Math.abs(deltaY) > Math.abs(deltaX)) {
        setGestureFeedback('👆 Swiped Up: Starting App!');
        handleStandardChoice();
      }
    }

    touchStartY.current = null;
    touchStartX.current = null;
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome and Navigation Mode Selection"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 flex flex-col justify-between p-3.5 sm:p-8 bg-gradient-to-b from-[#EBF5FB] via-[#F4F9FD] to-[#DCEEFB] text-slate-800 select-none overflow-hidden touch-none outline-none focus:ring-4 focus:ring-sky-400/40"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-sky-200/40 blur-3xl -z-10 pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <EasyTalkLogo size={40} className="sm:hidden" />
          <EasyTalkLogo size={48} className="hidden sm:block" />
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-[#0F3E76] leading-none">
              EasyTalk for PWD
            </h1>
            <p className="text-[11px] sm:text-xs text-sky-700 font-semibold mt-0.5">
              Welcome · Choose Mode to Start
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            speakText(
              voiceSettings.language === 'tl'
                ? 'Mag-swipe ng dalawang daliri kung ikaw ay bulag. Mag-swipe pataas, o i-tap ang Start, kung hindi ka bulag.'
                : 'Swipe with two fingers if you are blind. Swipe up, or tap Start, if you are not blind.',
              { rate: voiceSettings.rate }
            )
          }
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-sky-300 text-xs font-bold text-[#0F3E76] shadow-xs hover:bg-sky-50 active:scale-95 transition-all"
          title="Repeat Spoken Instructions"
        >
          <Volume2 className="w-4 h-4 text-[#0284C7]" />
          <span>{voiceSettings.language === 'tl' ? 'Ulitin' : 'Repeat Audio'}</span>
        </button>
      </div>

      {/* Main Choice Cards Container */}
      <div className="max-w-xl w-full mx-auto flex flex-col gap-2.5 sm:gap-4 my-auto">
        {gestureFeedback && (
          <div className="p-2 sm:p-2.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black text-center animate-bounce">
            {gestureFeedback}
          </div>
        )}

        {/* Option 1: Blind Mode */}
        <div
          onClick={handleBlindChoice}
          role="button"
          tabIndex={0}
          className="group relative flex items-center justify-between p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-950 text-white border-2 sm:border-3 border-amber-400 shadow-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl sm:text-3xl shrink-0 group-hover:rotate-6 transition-transform">
              ✌️
            </div>

            <div className="text-left">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {voiceSettings.language === 'tl' ? 'Blind Audio Mode' : 'Blind Audio Mode'}
                </span>
                <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              </div>
              <h2 className="text-base sm:text-2xl font-black text-white leading-tight mt-0.5">
                {voiceSettings.language === 'tl'
                  ? 'Mag-swipe ng 2 daliri kung ikaw ay bulag'
                  : "Swipe 2 fingers if you're blind"}
              </h2>
              <p className="text-[11px] sm:text-sm text-slate-300 font-medium mt-0.5">
                📱 <strong>Mobile:</strong> {voiceSettings.language === 'tl' ? '2 daliri' : '2 fingers'} · 💻 <strong>PC:</strong> {voiceSettings.language === 'tl' ? 'Pindutin ang' : 'Press'} <strong>SPACEBAR</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center pl-2 sm:pl-3 shrink-0">
            <span className="text-[10px] sm:text-sm font-mono font-black text-slate-950 bg-amber-400 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl shadow-md border sm:border-2 border-amber-300 animate-pulse">
              [ SPACE ]
            </span>
            <span className="text-[9px] sm:text-[10px] text-amber-300 font-semibold mt-1 hidden sm:inline">
              {voiceSettings.language === 'tl' ? 'sa Keyboard' : 'on Keyboard'}
            </span>
          </div>
        </div>

        {/* Option 2: Standard Mode */}
        <div
          onClick={handleStandardChoice}
          role="button"
          tabIndex={0}
          className="group relative flex items-center justify-between p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white text-[#0F3E76] border-2 sm:border-3 border-sky-400 shadow-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-sky-500 text-white flex items-center justify-center font-black text-xl sm:text-3xl shrink-0 group-hover:-translate-y-1 transition-transform">
              <ChevronUp className="w-6 h-6 sm:w-8 sm:h-8 stroke-[3] animate-bounce" />
            </div>

            <div className="text-left">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs font-bold text-sky-600 uppercase tracking-wider">
                  {voiceSettings.language === 'tl' ? 'Standard Communication Mode' : 'Standard Communication Mode'}
                </span>
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-500" />
              </div>
              <h2 className="text-base sm:text-2xl font-black text-[#0F3E76] leading-tight mt-0.5">
                {voiceSettings.language === 'tl'
                  ? 'Swipe pataas kung hindi bulag'
                  : 'Swipe up then start if not blind'}
              </h2>
              <p className="text-[11px] sm:text-sm text-slate-600 font-medium mt-0.5">
                📱 <strong>Mobile:</strong> {voiceSettings.language === 'tl' ? 'Swipe pataas o i-tap dito' : 'Swipe up or tap here'} · 💻 <strong>PC:</strong> {voiceSettings.language === 'tl' ? 'Pindutin ang' : 'Press'} <strong>ENTER</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center pl-2 sm:pl-3 shrink-0">
            <span className="text-[10px] sm:text-sm font-mono text-sky-900 border sm:border-2 border-sky-400 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-black bg-sky-100 shadow-sm">
              [ ENTER ]
            </span>
            <span className="text-[9px] sm:text-[10px] text-sky-700 font-semibold mt-1 hidden sm:inline">
              {voiceSettings.language === 'tl' ? 'sa Keyboard' : 'on Keyboard'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="flex flex-col items-center justify-center text-center pb-1">
        <p className="text-[11px] sm:text-xs text-slate-600 font-semibold">
          {voiceSettings.language === 'tl' ? (
            <>💡 <strong>PC:</strong> <kbd className="px-1.5 py-0.5 bg-slate-800 text-amber-300 rounded font-mono text-[10px] sm:text-xs">SPACEBAR</kbd> (Bulag) o <kbd className="px-1.5 py-0.5 bg-sky-700 text-white rounded font-mono text-[10px] sm:text-xs">ENTER</kbd> (Simula). <strong>Mobile:</strong> Swipe 2 daliri, Swipe pataas, o i-tap ang card.</>
          ) : (
            <>💡 <strong>On PC:</strong> Press <kbd className="px-1.5 py-0.5 bg-slate-800 text-amber-300 rounded font-mono text-[10px] sm:text-xs">SPACEBAR</kbd> (Blind) or <kbd className="px-1.5 py-0.5 bg-sky-700 text-white rounded font-mono text-[10px] sm:text-xs">ENTER</kbd> (Start). <strong>On Mobile:</strong> Swipe 2 fingers, Swipe up, or tap any card.</>
          )}
        </p>
      </div>
    </div>
  );
};
