import React, { useEffect, useState } from 'react';
import { X, Volume2, Sliders, Eye, RotateCw } from 'lucide-react';
import { VoiceSettings } from '../types';
import {
  speakText,
  playTactileClick,
  playAssistanceBell,
  playWaterSound,
  playFoodSound,
  playUnwellSound,
  playHomeChime,
  playEmergencyAlert,
} from '../utils/audioUtils';
import { DEFAULT_SPEED_DIAL_EN, DEFAULT_SPEED_DIAL_TL } from './BlindTouchPadModal';

interface AccessibilitySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onUpdateSettings: (newSettings: Partial<VoiceSettings>) => void;
  onReplayLoading?: () => void;
  onReopenGate?: () => void;
}

export const AccessibilitySettingsModal: React.FC<AccessibilitySettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onReplayLoading,
  onReopenGate,
}) => {
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // ── SPEED DIAL STATE ───────────────────────────────────────────────────────
  const [speedDial, setSpeedDial] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('easytalk_blind_speeddial');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === 3) return parsed;
      }
    } catch { /* ignore */ }
    return settings.language === 'tl' ? [...DEFAULT_SPEED_DIAL_TL] : [...DEFAULT_SPEED_DIAL_EN];
  });
  const [speedDialSaved, setSpeedDialSaved] = useState(false);

  const handleSpeedDialChange = (idx: number, value: string) => {
    setSpeedDial((prev) => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
  };

  const handleSaveSpeedDial = () => {
    try {
      localStorage.setItem('easytalk_blind_speeddial', JSON.stringify(speedDial));
      setSpeedDialSaved(true);
      setTimeout(() => setSpeedDialSaved(false), 2000);
    } catch { /* ignore */ }
  };

  const handleResetSpeedDial = () => {
    const defaults = settings.language === 'tl' ? [...DEFAULT_SPEED_DIAL_TL] : [...DEFAULT_SPEED_DIAL_EN];
    setSpeedDial(defaults);
    try {
      localStorage.setItem('easytalk_blind_speeddial', JSON.stringify(defaults));
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  if (!isOpen) return null;

  const handleTestVoice = () => {
    if (settings.soundEffects) playTactileClick();
    const testMessage = settings.language === 'tl'
      ? 'Kumusta! Ito ang EasyTalk, pantulong na boses ng babae para sa komunikasyon.'
      : 'Hello! This is EasyTalk, communication support for persons with disabilities.';

    speakText(testMessage, {
      rate: settings.rate,
      pitch: settings.pitch,
      volume: settings.volume,
      voiceURI: settings.voiceURI,
      language: settings.language,
      voiceGender: settings.voiceGender,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Accessibility and Voice Settings"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-sky-200 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#0F3E76]" />
            <h2 className="text-xl font-bold text-[#0F3E76]">
              {settings.language === 'tl' ? 'Mga Setting ng Boses at Accessibility' : 'Accessibility & Voice Settings'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-5">
          {/* Language Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              🌐 Wika / App Language
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ language: 'en', voiceGender: 'male', pitch: 0.92 })}
                className={`py-2 px-3 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                  settings.language === 'en'
                    ? 'border-[#0F3E76] bg-sky-50 text-[#0F3E76]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>English (Boses Lalaki)</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ language: 'tl', voiceGender: 'female', pitch: 1.16 })}
                className={`py-2 px-3 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                  settings.language === 'tl'
                    ? 'border-rose-600 bg-rose-50 text-rose-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>🇵🇭 Tagalog (Boses Babae)</span>
              </button>
            </div>
          </div>

          {/* Voice Gender Preference (Default Female) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              🗣️ Uri ng Boses / Voice Gender
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ voiceGender: 'female', pitch: 1.15 })}
                className={`py-2 px-3 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  settings.voiceGender === 'female'
                    ? 'border-[#0F3E76] bg-sky-50 text-[#0F3E76]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>👩 Babae (Female Voice)</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ voiceGender: 'male', pitch: 0.95 })}
                className={`py-2 px-3 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  settings.voiceGender === 'male'
                    ? 'border-[#0F3E76] bg-sky-50 text-[#0F3E76]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>👨 Lalaki (Male Voice)</span>
              </button>
            </div>
          </div>

          {/* Voice Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Boses ng Device / Speech Engine Voice
            </label>
            <select
              value={settings.voiceURI}
              onChange={(e) => onUpdateSettings({ voiceURI: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-sky-200 bg-sky-50/50 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
            >
              <option value="">Awtomatikong Boses ng Babae (Auto-detect Female)</option>
              {availableVoices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speed Rate Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
              <span>Speech Speed Rate</span>
              <span className="text-[#0284C7] font-extrabold">{settings.rate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.6"
              step="0.05"
              value={settings.rate}
              onChange={(e) => onUpdateSettings({ rate: parseFloat(e.target.value) })}
              className="w-full accent-[#0F3E76] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Slower (0.5x)</span>
              <span>Normal (1.0x)</span>
              <span>Faster (1.6x)</span>
            </div>
          </div>

          {/* Voice Pitch Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
              <span>Voice Pitch</span>
              <span className="text-[#0284C7] font-extrabold">{settings.pitch.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.4"
              step="0.1"
              value={settings.pitch}
              onChange={(e) => onUpdateSettings({ pitch: parseFloat(e.target.value) })}
              className="w-full accent-[#0F3E76] cursor-pointer"
            />
          </div>

          {/* Test Voice Button */}
          <div className="flex justify-end">
            <button
              onClick={handleTestVoice}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-100 hover:bg-sky-200 text-[#0F3E76] text-xs font-bold transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>Test Voice Speech</span>
            </button>
          </div>

          <hr className="border-sky-100" />

          {/* Sound Effects Preview Gallery */}
          <div>
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              🎵 Test Sound Effects (Audio Cues)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={playAssistanceBell}
                className="flex items-center gap-1.5 p-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-xs font-semibold text-[#0F3E76] transition-transform active:scale-95"
              >
                <span>🔔</span>
                <span>Assistance Bell</span>
              </button>
              <button
                type="button"
                onClick={playWaterSound}
                className="flex items-center gap-1.5 p-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-xs font-semibold text-[#0F3E76] transition-transform active:scale-95"
              >
                <span>💧</span>
                <span>Water Drops</span>
              </button>
              <button
                type="button"
                onClick={playFoodSound}
                className="flex items-center gap-1.5 p-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-xs font-semibold text-[#0F3E76] transition-transform active:scale-95"
              >
                <span>🍽️</span>
                <span>Food Chime</span>
              </button>
              <button
                type="button"
                onClick={playUnwellSound}
                className="flex items-center gap-1.5 p-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-xs font-semibold text-[#0F3E76] transition-transform active:scale-95"
              >
                <span>💓</span>
                <span>Heartbeat Pulse</span>
              </button>
              <button
                type="button"
                onClick={playHomeChime}
                className="flex items-center gap-1.5 p-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-xs font-semibold text-[#0F3E76] transition-transform active:scale-95"
              >
                <span>🏡</span>
                <span>Home Door Chime</span>
              </button>
              <button
                type="button"
                onClick={playEmergencyAlert}
                className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold text-rose-700 transition-transform active:scale-95"
              >
                <span>🚨</span>
                <span>Emergency Alarm</span>
              </button>
            </div>
          </div>

          <hr className="border-sky-100" />

          {/* Visual & Motor Accessibility */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Eye className="w-4 h-4 text-[#0284C7]" />
              <span>Visual & Motor Accessibility</span>
            </div>

            {/* Font Size Selector */}
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700">Display Text Size</span>
              <div className="flex gap-1.5">
                {(['normal', 'large', 'xlarge'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => onUpdateSettings({ fontSize: size })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                      settings.fontSize === size
                        ? 'bg-[#0F3E76] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {size === 'xlarge' ? 'Extra' : size}
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast Mode */}
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700">High Contrast Mode</span>
              <button
                onClick={() => onUpdateSettings({ highContrast: !settings.highContrast })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.highContrast ? 'bg-[#0F3E76]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Sound Feedback Toggle */}
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700">Tactile Sound Effects</span>
              <button
                onClick={() => onUpdateSettings({ soundEffects: !settings.soundEffects })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.soundEffects ? 'bg-[#0F3E76]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.soundEffects ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Auto-Scan (Switch Access Mode) */}
            <div className="flex items-center justify-between text-sm pt-1">
              <div>
                <span className="font-semibold text-slate-700 block">Switch Auto-Scan Mode</span>
                <span className="text-[11px] text-slate-500">Cycles choices for single-switch users</span>
              </div>
              <button
                onClick={() => onUpdateSettings({ autoScanEnabled: !settings.autoScanEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoScanEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoScanEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.autoScanEnabled && (
              <div className="pt-2">
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Cycle Interval</span>
                  <span className="font-bold text-emerald-700">{settings.autoScanInterval}s</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="5"
                  step="0.5"
                  value={settings.autoScanInterval}
                  onChange={(e) => onUpdateSettings({ autoScanInterval: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* ── BLIND MODE SPEED DIAL ── */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <span>🦯</span>
            <span>Blind Mode Speed Dial (Keys 7 · 8 · 9)</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {settings.language === 'tl'
              ? 'Itong tatlong parirala ay agad na maabot sa Blind Mode gamit ang key 7, 8, o 9 sa keyboard, o sa pamamagitan ng pagpunta sa kategorya 4.'
              : 'These 3 phrases are instantly accessible in Blind Mode via keyboard keys 7, 8, and 9, or by navigating to category 4.'}
          </p>
          <div className="space-y-2">
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center shrink-0">
                  {idx + 7}
                </span>
                <input
                  type="text"
                  value={speedDial[idx] ?? ''}
                  onChange={(e) => handleSpeedDialChange(idx, e.target.value)}
                  placeholder={
                    settings.language === 'tl'
                      ? DEFAULT_SPEED_DIAL_TL[idx]
                      : DEFAULT_SPEED_DIAL_EN[idx]
                  }
                  className="flex-1 px-3 py-2 rounded-xl border border-sky-200 bg-sky-50/50 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-400"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSaveSpeedDial}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                speedDialSaved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
              }`}
            >
              <span>{speedDialSaved ? '✓ Saved!' : '💾 Save Phrases'}</span>
            </button>
            <button
              onClick={handleResetSpeedDial}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
            >
              <RotateCw className="w-3 h-3" />
              <span>Reset to Default</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-sky-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {onReplayLoading && (
              <button
                onClick={() => {
                  onClose();
                  onReplayLoading();
                }}
                className="text-xs font-semibold text-sky-700 hover:text-sky-900 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>🎬 Replay Intro Screen</span>
              </button>
            )}
            {onReopenGate && (
              <button
                onClick={() => {
                  onClose();
                  onReopenGate();
                }}
                className="text-xs font-semibold text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>🚪 Mode Gate (Swipe 2 Finger)</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#0F3E76] hover:bg-[#0A2D57] text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
