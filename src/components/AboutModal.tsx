import React from 'react';
import { EasyTalkLogo } from './ConditionAvatars';
import { AppLanguage } from '../types';
import {
  X,
  Heart,
  Volume2,
  Mic,
  ShieldCheck,
  Sparkles,
  Users,
  EyeOff,
  Ear,
  MessageSquare,
  AlertTriangle,
  Keyboard,
  CheckCircle2,
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: AppLanguage;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, language = 'en' }) => {
  if (!isOpen) return null;
  const isTl = language === 'tl';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs select-none animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border-2 sm:border-4 border-sky-300 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-sky-900 via-[#0F3E76] to-sky-800 text-white shrink-0">
          <div className="flex items-center gap-3">
            <EasyTalkLogo size={42} className="drop-shadow-sm shrink-0" />
            <div>
              <h2 id="about-dialog-title" className="text-lg sm:text-2xl font-black tracking-tight leading-none">
                {isTl ? 'Tungkol sa EasyTalk for PWD' : 'About EasyTalk for PWD'}
              </h2>
              <p className="text-xs sm:text-sm text-sky-200 font-semibold mt-1 flex items-center gap-1.5">
                <span>{isTl ? 'Dahil bawat tinig ay mahalaga.' : 'Because every voice matters.'}</span>
                <Heart className="w-3.5 h-3.5 text-rose-300 fill-current" />
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-sky-800/80 hover:bg-sky-700 text-sky-100 hover:text-white transition-colors cursor-pointer"
            aria-label="Close About Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {/* Mission & Purpose */}
          <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200">
            <h3 className="text-sm sm:text-base font-extrabold text-[#0F3E76] flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{isTl ? 'Ano ang EasyTalk?' : 'What is EasyTalk?'}</span>
            </h3>
            <p className="text-slate-700 font-medium">
              {isTl ? (
                <>
                  Ang <strong>EasyTalk for PWD</strong> ay isang <em>Augmentative and Alternative Communication (AAC)</em> platform. Ito ay tulay sa komunikasyon para sa mga taong may kapansanan (PWDs), pasyente sa ospital, non-verbal o hindi makapagsalita, at kanilang mga tagapag-alaga upang maipahayag ang kanilang pangangailangan nang mabilis, may dignidad, at walang hadlang.
                </>
              ) : (
                <>
                  <strong>EasyTalk for PWD</strong> is an <em>Augmentative and Alternative Communication (AAC)</em> support platform. It serves as an accessible bridge for Persons with Disabilities (PWDs), medical patients, non-verbal individuals, and caregivers to communicate everyday needs, feelings, and emergencies with dignity and speed.
                </>
              )}
            </p>
          </div>

          {/* Why Does This Exist? / Who Is It For? */}
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-[#0F3E76] flex items-center gap-2 mb-2.5">
              <Users className="w-4 h-4 text-sky-600" />
              <span>{isTl ? 'Para kanino ang EasyTalk?' : 'Who is EasyTalk for?'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Speech Impairment */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-sky-100 text-[#0F3E76] shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                    {isTl ? 'Kapansanan sa Pagsasalita' : 'Speech & Voice Loss'}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                    {isTl
                      ? 'Para sa mga survivor ng stroke, ALS, cerebral palsy, pasyenteng may tracheostomy, o mga non-verbal na hindi makapagsalita nang malakas.'
                      : 'For stroke survivors, ALS, cerebral palsy, tracheostomy patients, or non-verbal individuals who cannot speak aloud.'}
                  </p>
                </div>
              </div>

              {/* Deaf & Hard of Hearing */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-900 shrink-0 mt-0.5">
                  <Ear className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                    {isTl ? 'Bingi at Mahina ang Pandinig' : 'Deaf & Hard of Hearing'}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                    {isTl
                      ? 'Para sa pakikipag-usap sa mga doktor, tindero, drayber, at kapitbahay na hindi nakakaintindi ng sign language.'
                      : 'For communicating with doctors, cashiers, drivers, and neighbors who do not understand sign language.'}
                  </p>
                </div>
              </div>

              {/* Autism & Neurodivergent */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-900 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                    {isTl ? 'Autism at Sensory Overload' : 'Autism & Sensory Shutdown'}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                    {isTl
                      ? 'Visual phrase cards at simpleng pagpipilian sa panahon ng sensory overload, panic, o non-verbal na sandali.'
                      : 'Visual phrase cards and simplified choices during sensory overload, panic, or non-verbal episodes.'}
                  </p>
                </div>
              </div>

              {/* Blind Mode */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-900 shrink-0 mt-0.5">
                  <EyeOff className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                    {isTl ? 'Bulag (Audio Touch Pad)' : 'Blind (Audio Touch Pad)'}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                    {isTl
                      ? 'Audio-first mode: pindutin ang 1–6 para magsalita, 0 para magpalit ng kategorya, E para sa alarma, H para sa gabay. May shake-to-SOS, 5-tap SOS, voice command SOS, at explore-by-touch.'
                      : 'Audio-first mode: press 1–6 to speak phrases, 0 to switch category, E for emergency alarm, H for voice guide. Supports shake-to-SOS, 5-tap SOS, voice command SOS, and explore-by-touch spatial zones.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-[#0F3E76] flex items-center gap-2 mb-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isTl ? 'Mga Pangunahing Tampok' : 'Key Features'}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] sm:text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-sky-50 border border-sky-100">
                <Volume2 className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                <span>{isTl ? 'Text-to-Speech' : 'Text-to-Speech Engine'}</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-sky-50 border border-sky-100">
                <Mic className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{isTl ? 'Live Voice Transcriber' : 'Live Listen Transcribe'}</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-sky-50 border border-sky-100">
                <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{isTl ? 'Dalawang Role (PWD / Kasama)' : 'Two-Way (PWD / Normal)'}</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-sky-50 border border-sky-100">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>{isTl ? 'Emergency SOS Alarma' : 'Emergency SOS Alarm'}</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-sky-50 border border-sky-100">
                <Keyboard className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{isTl ? 'Keyboard 1–6 Shortcuts' : 'Keyboard 1–6 Shortcuts'}</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-sky-50 border border-sky-100">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{isTl ? '100% Pribado at Offline' : '100% Private & Offline'}</span>
              </div>
            </div>
          </div>

          {/* Privacy & Free Philosophy */}
          <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] sm:text-xs text-slate-600">
            <p>
              🔒 <strong>{isTl ? 'Garantiya sa Privacy:' : 'Privacy Guarantee:'}</strong>{' '}
              {isTl
                ? 'Ang EasyTalk ay ganap na tumatakbo sa loob ng iyong browser. Walang audio o datos ng pagsasalita ang nire-record, sinusubaybayan, o ipinapadala sa mga server. Libre ito para sa lahat — pamilya, ospital, at paaralan.'
                : 'EasyTalk runs completely inside your browser. No speech data or audio is recorded, tracked, or sent to remote servers. It is free for public use, hospitals, schools, and families.'}
            </p>
          </div>

          {/* Developer Credit */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0F3E76] text-white flex items-center justify-center font-black text-base shrink-0 shadow-sm">
              N
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {isTl ? 'Developer' : 'Developer'}
              </p>
              <p className="text-sm sm:text-base font-black text-[#0F3E76] leading-tight">
                Neveallyn Sandoval Litargo
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                BSIT – Computer Technology
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Southern Luzon State University – Gumaca Campus
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[10px] sm:text-xs text-slate-500 font-semibold">
            EasyTalk for PWD · v1.0 · Neveallyn Sandoval Litargo
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#0F3E76] hover:bg-[#0A2D57] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
          >
            {isTl ? 'Naintindihan ko!' : 'Got it, thanks!'}
          </button>
        </div>
      </div>
    </div>
  );
};
