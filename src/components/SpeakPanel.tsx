import React, { useState } from 'react';
import { Volume2, Megaphone, Maximize2, RotateCcw, Square, Mic } from 'lucide-react';
import { speakText, stopSpeech, playTactileClick, playSuccessChime } from '../utils/audioUtils';
import { VoiceSettings } from '../types';

interface SpeakPanelProps {
  currentMessage: string;
  onClearMessage: () => void;
  onOpenFullScreen: () => void;
  onOpenListenTranscribe: () => void;
  voiceSettings: VoiceSettings;
  isAutoScanning?: boolean;
}

export const SpeakPanel: React.FC<SpeakPanelProps> = ({
  currentMessage,
  onClearMessage,
  onOpenFullScreen,
  onOpenListenTranscribe,
  voiceSettings,
  isAutoScanning = false,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (!currentMessage || currentMessage.trim() === '') {
      return;
    }
    
    if (voiceSettings.soundEffects) {
      playSuccessChime();
    }

    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }

    // Safety timeout: if onStart never fires within 2s (browser blocked/no voices),
    // reset the speaking state so the button doesn't get permanently stuck (Bug #13 fix)
    let startFired = false;
    const safetyTimer = setTimeout(() => {
      if (!startFired) setIsSpeaking(false);
    }, 2000);

    speakText(currentMessage, {
      rate: voiceSettings.rate,
      pitch: voiceSettings.pitch,
      volume: voiceSettings.volume,
      voiceURI: voiceSettings.voiceURI,
      language: voiceSettings.language,
      voiceGender: voiceSettings.voiceGender,
      onStart: () => {
        startFired = true;
        clearTimeout(safetyTimer);
        setIsSpeaking(true);
      },
      onEnd: () => {
        clearTimeout(safetyTimer);
        setIsSpeaking(false);
      },
    });
  };

  const isTl = voiceSettings.language === 'tl';

  const handleStop = () => {
    stopSpeech();
    setIsSpeaking(false);
  };

  return (
    <>
      {/* Mobile Compact Horizontal Speak Bar (md:hidden) */}
      <div className="flex md:hidden items-center gap-1.5 p-1.5 rounded-xl bg-gradient-to-r from-sky-100 to-sky-50 border border-sky-300 shadow-xs select-none">
        <div className="flex-1 min-w-0 bg-white rounded-lg px-2 py-1 border border-sky-200">
          <span className="text-[9px] font-bold text-sky-600 uppercase block leading-none">
            {isTl ? 'Napili:' : 'Selected:'}
          </span>
          <p className="text-xs font-black text-[#0F3E76] truncate">
            {currentMessage || (isTl ? 'Pumili ng mensahe' : 'Choose a message')}
          </p>
        </div>

        <button
          onClick={handleSpeak}
          disabled={!currentMessage}
          className={`px-3 py-1.5 rounded-lg font-extrabold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer ${
            !currentMessage
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : isSpeaking
              ? 'bg-amber-500 text-white ring-2 ring-amber-300 animate-pulse'
              : 'bg-[#0F3E76] text-white hover:bg-[#0A2D57] active:bg-[#071F3D] ring-1 ring-sky-300'
          }`}
          aria-label={isSpeaking ? 'Stop speaking' : 'Speak selected message'}
        >
          {isSpeaking ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{isTl ? 'Tigil' : 'Stop'}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-amber-300" />
              <span>{isTl ? 'Magsalita' : 'Speak'}</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenFullScreen}
          className="p-1.5 rounded-lg bg-white border border-sky-300 text-sky-800 shadow-xs cursor-pointer"
          title={isTl ? 'Palakihin ang Mensahe' : 'Fullscreen Flashcard'}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {currentMessage && (
          <button
            onClick={onClearMessage}
            className="p-1.5 rounded-lg bg-white border border-sky-300 text-slate-500 hover:text-red-600 shadow-xs cursor-pointer"
            title={isTl ? 'Burahin' : 'Clear'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Desktop Column matching reference (hidden md:flex) */}
      <div className="hidden md:flex flex-col justify-between h-full bg-gradient-to-b from-sky-50/50 to-white/90 p-4 rounded-2xl border border-sky-200/70 select-none">
        {/* Top: "Selected Message:" Header Pill matching screenshot */}
      <div>
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#0F3E76] text-white shadow-sm mb-1.5 sm:mb-3">
          <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-300" />
          <span className="text-[11px] sm:text-sm font-bold tracking-wide">
            {isTl ? 'Napiling Mensahe:' : 'Selected Message:'}
          </span>
        </div>

        {/* Selected Message Display Card matching screenshot */}
        <div className="relative group bg-sky-100/80 border-2 border-sky-300/80 rounded-xl sm:rounded-2xl p-2 sm:p-4 min-h-[44px] sm:min-h-[100px] flex items-center justify-center text-center shadow-inner transition-all">
          <p className="text-xs sm:text-lg font-bold text-[#0F3E76] leading-snug break-words">
            {currentMessage || (isTl ? 'Pumili ng mensahe o mag-type ng sarili.' : 'Please choose a message or type your own.')}
          </p>

          {/* Quick action overlay buttons */}
          {currentMessage && (
            <div className="absolute top-1 sm:top-2 right-1 sm:right-2 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onOpenFullScreen}
                className="p-1 sm:p-1.5 rounded-lg bg-white/90 hover:bg-white text-sky-800 shadow-xs cursor-pointer"
                title="View Fullscreen Flashcard"
                aria-label="View Fullscreen"
              >
                <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
              <button
                onClick={onClearMessage}
                className="p-1 sm:p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-600 hover:text-red-600 shadow-xs cursor-pointer"
                title="Clear Message"
                aria-label="Clear Message"
              >
                <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Middle/Bottom: Giant Speak Button with golden energetic rays matching screenshot */}
      <div className="relative pt-2 sm:pt-4 pb-0.5 sm:pb-1 flex flex-col items-center">
        {/* Yellow sound rays emitting around button matching screenshot */}
        <div className="relative w-full flex justify-center items-center">
          {/* Top-Right and Bottom-Right Energetic Accents */}
          <div className={`hidden sm:block absolute -right-1 sm:right-2 top-0 transition-opacity ${isSpeaking ? 'opacity-100 animate-bounce' : 'opacity-80'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 14L2 18" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
              <path d="M10 10L14 4" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
              <path d="M12 16L18 18" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <div className={`hidden sm:block absolute -left-1 sm:left-2 bottom-0 transition-opacity ${isSpeaking ? 'opacity-100 animate-pulse' : 'opacity-80'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 10L22 6" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
              <path d="M12 14L8 20" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          {/* Main Speak Pill Button */}
          <button
            onClick={handleSpeak}
            disabled={!currentMessage}
            className={`w-full max-w-[240px] flex items-center justify-center gap-2 sm:gap-3 py-2 sm:py-3 px-4 sm:px-6 rounded-full font-extrabold text-sm sm:text-lg shadow-md transition-all duration-200 cursor-pointer ${
              !currentMessage
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : isSpeaking
                ? 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white ring-4 ring-amber-300 animate-pulse'
                : 'bg-[#0F3E76] hover:bg-[#0A2D57] active:bg-[#071F3D] text-white hover:shadow-lg active:scale-95 ring-2 ring-sky-300'
            } ${isAutoScanning ? 'ring-4 ring-amber-400' : ''}`}
            aria-label={isSpeaking ? 'Speaking message aloud. Tap to stop.' : 'Speak selected message'}
          >
            {isSpeaking ? (
              <>
                <Square className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                <span>{isTl ? 'Tigil' : 'Stop'}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                <span>{isTl ? 'Magsalita' : 'Speak'}</span>
              </>
            )}
          </button>
        </div>

        {/* Auxiliary helper controls */}
        <div className="flex items-center justify-center gap-3 mt-1.5 sm:mt-3 w-full text-[11px] sm:text-xs font-semibold text-[#0F3E76]">
          <button
            onClick={onOpenFullScreen}
            className="flex items-center gap-1 hover:text-sky-700 hover:underline px-1.5 py-0.5 rounded transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{isTl ? 'Palakihin' : 'Show Big'}</span>
          </button>

          <span className="text-sky-300">|</span>

          <button
            onClick={onOpenListenTranscribe}
            className="flex items-center gap-1 hover:text-sky-700 hover:underline px-1.5 py-0.5 rounded transition-colors cursor-pointer"
            title="Speech-to-Text Live Transcribe for Deaf/Hard of Hearing"
          >
            <Mic className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
            <span>{isTl ? 'Makinig' : 'Listen Mode'}</span>
          </button>
        </div>
      </div>
    </div>
  </>
);
};
