import React, { useState } from 'react';
import { Volume2, X, Sun, Moon, ZoomIn, ZoomOut } from 'lucide-react';
import { speakText, playTactileClick } from '../utils/audioUtils';
import { VoiceSettings } from '../types';

interface FullScreenMessageModalProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  voiceSettings: VoiceSettings;
}

export const FullScreenMessageModal: React.FC<FullScreenMessageModalProps> = ({
  message,
  isOpen,
  onClose,
  voiceSettings,
}) => {
  const [highContrastDark, setHighContrastDark] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');

  const fontSizeClass = {
    normal: 'text-4xl sm:text-6xl md:text-7xl',
    large: 'text-5xl sm:text-7xl md:text-8xl',
    xlarge: 'text-6xl sm:text-8xl md:text-9xl',
  }[fontSize];

  if (!isOpen) return null;

  const handleSpeak = () => {
    if (voiceSettings.soundEffects) {
      playTactileClick();
    }
    speakText(message, {
      rate: voiceSettings.rate,
      pitch: voiceSettings.pitch,
      volume: voiceSettings.volume,
      voiceURI: voiceSettings.voiceURI,
      language: voiceSettings.language,
      voiceGender: voiceSettings.voiceGender,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Full Screen Message Display"
      className={`fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-12 transition-colors duration-200 ${
        highContrastDark ? 'bg-black text-amber-300' : 'bg-white text-[#0F3E76]'
      }`}
    >
      {/* Top Bar with actions */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold uppercase tracking-wider opacity-75">
          EasyTalk · Screen Display
        </span>

        <div className="flex items-center gap-3">
          {/* Font size controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFontSize('normal')}
              className={`p-2.5 rounded-full transition-colors ${
                fontSize === 'normal'
                  ? highContrastDark ? 'bg-zinc-700 text-amber-300' : 'bg-sky-200 text-[#0F3E76]'
                  : highContrastDark ? 'bg-zinc-900 text-zinc-400 hover:bg-zinc-700' : 'bg-sky-50 text-slate-500 hover:bg-sky-100'
              }`}
              title="Normal font size"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFontSize(fontSize === 'normal' ? 'large' : fontSize === 'large' ? 'xlarge' : 'normal')}
              className={`p-2.5 rounded-full transition-colors ${
                highContrastDark ? 'bg-zinc-800 text-amber-300 hover:bg-zinc-700' : 'bg-sky-100 text-[#0F3E76] hover:bg-sky-200'
              }`}
              title="Increase font size"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setHighContrastDark(!highContrastDark)}
            className={`p-3 rounded-full transition-colors ${
              highContrastDark ? 'bg-zinc-800 text-amber-300' : 'bg-sky-100 text-[#0F3E76]'
            }`}
            title="Toggle Contrast Theme"
          >
            {highContrastDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>

          <button
            onClick={onClose}
            className={`p-3 rounded-full transition-colors ${
              highContrastDark ? 'bg-zinc-800 text-white' : 'bg-sky-100 text-[#0F3E76]'
            }`}
            title="Close Full Screen (Esc)"
          >
            <X className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Main Massive Message Text */}
      <div className="flex-1 flex items-center justify-center text-center my-6">
        <h1 className={`${fontSizeClass} font-black tracking-tight max-w-5xl leading-tight transition-all duration-200`}>
          {message || 'No message selected'}
        </h1>
      </div>

      {/* Bottom Bar: Speak CTA */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleSpeak}
          className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-xl sm:text-2xl shadow-lg transition-transform active:scale-95 ${
            highContrastDark
              ? 'bg-amber-400 text-black hover:bg-amber-300'
              : 'bg-[#0F3E76] text-white hover:bg-[#0A2D57]'
          }`}
        >
          <Volume2 className="w-8 h-8" />
          <span>Speak Aloud</span>
        </button>

        <button
          onClick={onClose}
          className={`px-6 py-4 rounded-full font-semibold text-lg transition-colors ${
            highContrastDark
              ? 'bg-zinc-800 text-white hover:bg-zinc-700'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Done
        </button>
      </div>
    </div>
  );
};
