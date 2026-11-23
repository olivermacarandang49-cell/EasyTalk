import React from 'react';
import { Heart, Info } from 'lucide-react';
import { AppLanguage } from '../types';

interface FooterProps {
  onOpenAbout?: () => void;
  language?: AppLanguage;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAbout, language = 'en' }) => {
  const isTl = language === 'tl';

  return (
    <footer className="w-full mt-1 sm:mt-6 select-none shrink-0">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#0F3E76] text-white rounded-xl sm:rounded-full px-3 sm:px-5 py-1.5 sm:py-3 shadow-sm flex items-center justify-between gap-1.5 text-[10px] sm:text-sm font-semibold">
          {/* Left: Branding */}
          <div className="flex items-center gap-1.5">
            <span>EasyTalk for PWD</span>
            <span className="text-sky-300 hidden sm:inline">|</span>
            <span className="hidden sm:inline">
              {isTl ? 'Pantulong sa Komunikasyon' : 'Communication Support App'}
            </span>
            <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-300 fill-current ml-0.5" />
          </div>

          {/* Right: Developer + About + Tagline */}
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline text-sky-300 text-[10px] font-medium">
              {isTl ? 'Ginawa ni' : 'by'} Neveallyn S. Litargo
            </span>

            {onOpenAbout && (
              <button
                onClick={onOpenAbout}
                className="flex items-center gap-1 text-sky-200 hover:text-white underline-offset-2 hover:underline cursor-pointer transition-colors"
                title="About EasyTalk"
              >
                <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>About</span>
              </button>
            )}

            <div className="text-sky-100 font-medium italic tracking-wide text-right text-[10px] sm:text-xs hidden sm:block">
              {isTl ? 'Dahil bawat tinig ay mahalaga.' : 'Because every voice matters.'}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
