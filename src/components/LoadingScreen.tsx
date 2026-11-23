import React, { useEffect, useState } from 'react';
import { EasyTalkLogo } from './ConditionAvatars';
import { Heart, Sparkles } from 'lucide-react';
import { playLetterAssemblySound } from '../utils/audioUtils';

interface LoadingScreenProps {
  onComplete: () => void;
  onSkipWithMode?: (mode: 'blind' | 'standard') => void;
}

const EASY_LETTERS = ['E', 'a', 's', 'y'];
const TALK_LETTERS = ['T', 'a', 'l', 'k'];
const PWD_TOKENS = ['f', 'o', 'r', '\u00A0', 'P', 'W', 'D'];
const SUPPORT_TOKENS = 'communication support'.split('');

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, onSkipWithMode }) => {
  // Step tracker for staggered assembly
  const [showLogo, setShowLogo] = useState(false);
  const [revealedEasyCount, setRevealedEasyCount] = useState(0);
  const [revealedTalkCount, setRevealedTalkCount] = useState(0);
  const [revealedPwdCount, setRevealedPwdCount] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [isAssembled, setIsAssembled] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Enable instantaneous skip via Spacebar or Enter
    const handleKeyDown = (e: KeyboardEvent) => {
      const isSpace =
        e.keyCode === 32 ||
        e.code === 'Space' ||
        e.key === ' ' ||
        e.key === 'Spacebar';

      const isEnter =
        e.keyCode === 13 ||
        e.code === 'Enter' ||
        e.code === 'NumpadEnter' ||
        e.key === 'Enter';

      if (isSpace) {
        e.preventDefault();
        if (onSkipWithMode) {
          onSkipWithMode('blind');
        } else {
          onComplete();
        }
      } else if (isEnter) {
        e.preventDefault();
        if (onSkipWithMode) {
          onSkipWithMode('standard');
        } else {
          onComplete();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    // 1. Reveal logo
    const t0 = setTimeout(() => {
      setShowLogo(true);
      try {
        playLetterAssemblySound();
      } catch {
        // audio fallback
      }
    }, 100);

    // 2. Assemble "Easy" (letters 1 to 4)
    const easyTimers = EASY_LETTERS.map((_, i) =>
      setTimeout(() => {
        setRevealedEasyCount((prev) => Math.max(prev, i + 1));
      }, 250 + i * 90)
    );

    // 3. Assemble "Talk" (letters 5 to 8)
    const talkTimers = TALK_LETTERS.map((_, i) =>
      setTimeout(() => {
        setRevealedTalkCount((prev) => Math.max(prev, i + 1));
      }, 620 + i * 90)
    );

    // 4. Assemble "for PWD"
    const pwdTimers = PWD_TOKENS.map((_, i) =>
      setTimeout(() => {
        setRevealedPwdCount((prev) => Math.max(prev, i + 1));
      }, 1020 + i * 65)
    );

    // 5. Reveal subtitle & pill
    const tSub = setTimeout(() => {
      setShowSubtitles(true);
    }, 1500);

    // 6. Reveal tagline with heart
    const tTag = setTimeout(() => {
      setShowTagline(true);
      setIsAssembled(true);
    }, 1750);

    // 7. Graceful exit — keep tDone ref in scope so cleanup can clear it (Bug #16 fix)
    let tDone: ReturnType<typeof setTimeout> | null = null;
    const tExit = setTimeout(() => {
      setIsExiting(true);
      tDone = setTimeout(() => {
        onComplete();
      }, 500);
    }, 2850);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      clearTimeout(t0);
      easyTimers.forEach(clearTimeout);
      talkTimers.forEach(clearTimeout);
      pwdTimers.forEach(clearTimeout);
      clearTimeout(tSub);
      clearTimeout(tTag);
      clearTimeout(tExit);
      if (tDone !== null) clearTimeout(tDone);
    };
  }, [onComplete, onSkipWithMode]);

  return (
    <div
      role="status"
      aria-label="EasyTalk for PWD Loading Screen"
      className={`fixed inset-0 z-50 flex items-center justify-center p-6 bg-gradient-to-b from-[#EBF5FB] via-[#F4F9FD] to-[#E3EFFB] overflow-hidden select-none transition-all duration-500 ${
        isExiting ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Soft ambient atmospheric glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-sky-200/50 blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col items-center text-center max-w-xl w-full">
        {/* Animated Brand Logo */}
        <div
          className={`mb-5 transform transition-all duration-700 ease-out ${
            showLogo
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-50 -translate-y-8'
          }`}
        >
          <div className="relative">
            <EasyTalkLogo size={105} />
            {isAssembled && (
              <Sparkles className="w-6 h-6 text-amber-400 absolute -top-2 -right-2 animate-bounce" />
            )}
          </div>
        </div>

        {/* Assembling Title: "EasyTalk" */}
        <div className="flex items-center justify-center text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none mb-2">
          {/* Word: Easy */}
          <div className="flex items-center text-[#0F3E76]">
            {EASY_LETTERS.map((letter, idx) => {
              const isVisible = idx < revealedEasyCount;
              return (
                <span
                  key={`easy-${idx}`}
                  style={{ transitionDelay: `${idx * 40}ms` }}
                  className={`inline-block transform transition-all duration-400 ease-out ${
                    isVisible
                      ? 'opacity-100 translate-y-0 scale-100 rotate-0 blur-none'
                      : 'opacity-0 translate-y-10 scale-50 -rotate-12 blur-[2px]'
                  }`}
                >
                  {letter}
                </span>
              );
            })}
          </div>

          {/* Word: Talk */}
          <div className="flex items-center text-[#0284C7] ml-0.5 sm:ml-1">
            {TALK_LETTERS.map((letter, idx) => {
              const isVisible = idx < revealedTalkCount;
              return (
                <span
                  key={`talk-${idx}`}
                  style={{ transitionDelay: `${idx * 40}ms` }}
                  className={`inline-block transform transition-all duration-400 ease-out ${
                    isVisible
                      ? 'opacity-100 translate-y-0 scale-100 rotate-0 blur-none'
                      : 'opacity-0 translate-y-10 scale-50 rotate-12 blur-[2px]'
                  }`}
                >
                  {letter}
                </span>
              );
            })}
          </div>
        </div>

        {/* Assembling Sub-Word: "for PWD" */}
        <div className="flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-extrabold tracking-widest uppercase mb-3 text-[#0F3E76]/90 min-h-[36px]">
          {PWD_TOKENS.map((char, idx) => {
            const isVisible = idx < revealedPwdCount;
            const isPwdPart = idx >= 4;
            return (
              <span
                key={`pwd-${idx}`}
                className={`inline-block transform transition-all duration-300 ease-out ${
                  isPwdPart ? 'text-[#0284C7] font-black' : 'text-slate-600'
                } ${
                  isVisible
                    ? 'opacity-100 translate-y-0 scale-100 blur-none'
                    : 'opacity-0 translate-y-6 scale-75 blur-[1px]'
                }`}
              >
                {char}
              </span>
            );
          })}
        </div>

        {/* Communication Support Pill */}
        <div
          className={`transform transition-all duration-500 ease-out ${
            showSubtitles
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-90 translate-y-4'
          }`}
        >
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-sky-100/90 border border-sky-300/80 text-[#0F3E76] text-xs sm:text-sm font-bold tracking-wide shadow-xs">
            <span>Communication Support</span>
          </div>
        </div>

        {/* Tagline Reveal */}
        <p
          className={`mt-4 text-base sm:text-lg font-semibold italic text-[#1E3A8A] flex items-center justify-center gap-2 transform transition-all duration-500 ease-out ${
            showTagline
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          <span>Because every voice matters.</span>
          <Heart className="w-4 h-4 text-rose-500 fill-current animate-pulse inline" />
        </p>
      </div>
    </div>
  );
};
