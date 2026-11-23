import React, { useState } from 'react';
import { Volume2, X, BookmarkPlus, Check, Trash2 } from 'lucide-react';
import { speakText, playTactileClick, playSuccessChime } from '../utils/audioUtils';
import { VoiceSettings } from '../types';

interface CustomMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAndClose: (text: string) => void;
  savedPhrases: string[];
  onSavePhrase: (text: string) => void;
  onDeletePhrase: (index: number) => void;
  voiceSettings: VoiceSettings;
}

const COMMON_FRAGMENTS = [
  'Please',
  'Thank you',
  'Excuse me',
  'Yes',
  'No',
  'Help',
  'Where is',
  'I need',
  'I want',
  'I feel',
  'Water',
  'Food',
  'Bathroom',
  'Doctor',
  'Too loud',
  'Wait a moment',
];

export const CustomMessageModal: React.FC<CustomMessageModalProps> = ({
  isOpen,
  onClose,
  onSelectAndClose,
  savedPhrases,
  onSavePhrase,
  onDeletePhrase,
  voiceSettings,
}) => {
  const [inputText, setInputText] = useState('');
  const [justSaved, setJustSaved] = useState(false);

  if (!isOpen) return null;

  const handleAddFragment = (fragment: string) => {
    if (voiceSettings.soundEffects) playTactileClick();
    setInputText((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${fragment}` : fragment;
    });
  };

  const handleSpeakNow = () => {
    if (!inputText.trim()) return;
    if (voiceSettings.soundEffects) playTactileClick();
    speakText(inputText, {
      rate: voiceSettings.rate,
      pitch: voiceSettings.pitch,
      volume: voiceSettings.volume,
      voiceURI: voiceSettings.voiceURI,
      language: voiceSettings.language,
      voiceGender: voiceSettings.voiceGender,
    });
  };

  const handleSaveToPhrases = () => {
    if (!inputText.trim()) return;
    onSavePhrase(inputText.trim());
    if (voiceSettings.soundEffects) playSuccessChime();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  };

  const handleApplyToMainBoard = () => {
    if (!inputText.trim()) return;
    onSelectAndClose(inputText.trim());
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Custom Message Composer"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-sky-200 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">✍️</span>
            <h2 className="text-lg sm:text-xl font-bold text-[#0F3E76]">
              Type a Custom Message
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Area */}
        <div className="mt-4">
          <label htmlFor="custom-input" className="block text-xs font-bold text-slate-600 mb-1.5">
            What would you like to say?
          </label>
          <textarea
            id="custom-input"
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your words or select quick phrases below..."
            className="w-full text-base sm:text-lg p-3.5 rounded-2xl border-2 border-sky-300 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-200 outline-none text-slate-900 bg-sky-50/40 resize-none font-medium"
            autoFocus
          />
        </div>

        {/* Quick Word Chips */}
        <div className="mt-3">
          <span className="text-xs font-semibold text-slate-500">Quick Words:</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {COMMON_FRAGMENTS.map((word) => (
              <button
                key={word}
                onClick={() => handleAddFragment(word)}
                className="px-2.5 py-1 text-xs font-semibold bg-sky-100/80 hover:bg-sky-200 text-[#0F3E76] rounded-lg transition-colors cursor-pointer"
              >
                + {word}
              </button>
            ))}
          </div>
        </div>

        {/* Actions Row */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-sky-100">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeakNow}
              disabled={!inputText.trim()}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm shadow-sm transition-all ${
                inputText.trim()
                  ? 'bg-[#0F3E76] text-white hover:bg-[#0A2D57] active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>Speak</span>
            </button>

            <button
              onClick={handleSaveToPhrases}
              disabled={!inputText.trim()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full font-semibold text-xs border border-sky-300 text-sky-800 hover:bg-sky-50 transition-colors"
            >
              {justSaved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
              <span>{justSaved ? 'Saved!' : 'Save Phrase'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyToMainBoard}
              disabled={!inputText.trim()}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                inputText.trim()
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Set on Board
            </button>
          </div>
        </div>

        {/* Saved Phrases List */}
        {savedPhrases.length > 0 && (
          <div className="mt-5 pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-600">My Saved Phrases:</span>
            <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {savedPhrases.map((phrase, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 text-xs font-medium text-slate-800"
                >
                  <span
                    className="cursor-pointer truncate flex-1 pr-2 hover:text-sky-700 font-semibold"
                    onClick={() => {
                      setInputText(phrase);
                    }}
                  >
                    {phrase}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onSelectAndClose(phrase)}
                      className="px-2 py-0.5 rounded bg-sky-200 text-sky-900 font-bold hover:bg-sky-300"
                    >
                      Use
                    </button>
                    <button
                      onClick={() => onDeletePhrase(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
