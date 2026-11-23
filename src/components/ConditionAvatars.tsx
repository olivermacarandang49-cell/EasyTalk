import React from 'react';

interface AvatarProps {
  className?: string;
  size?: number;
}

/**
 * Brand Logo: Speech Bubble with White Heart and gentle golden rays
 */
export const EasyTalkLogo: React.FC<{ size?: number; className?: string }> = ({ size = 64, className = '' }) => (
  <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Warm cheerful rays */}
      <path d="M18 18L10 10" stroke="#FBBF24" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M30 12L28 2" stroke="#FBBF24" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M12 30L2 28" stroke="#FBBF24" strokeWidth="4.5" strokeLinecap="round" />
      
      {/* Main speech bubble shadow */}
      <path
        d="M84 46C84 64.7777 68.7777 80 50 80C42.8422 80 36.1983 77.7813 30.6865 73.9934L16 78L20.8033 64.5369C17.7882 59.2084 16 52.8887 16 46C16 27.2223 31.2223 12 50 12C68.7777 12 84 27.2223 84 46Z"
        fill="#2563EB"
      />
      
      {/* Speech bubble highlight ring */}
      <path
        d="M80 46C80 62.5685 66.5685 76 50 76C43.5042 76 37.4957 73.9318 32.5513 70.4074L19.5 74L23.7719 61.9429C20.7601 57.2625 19 51.7828 19 46C19 29.4315 32.4315 16 50 16C67.5685 16 80 29.4315 80 46Z"
        fill="#3B82F6"
      />

      {/* Inner Heart */}
      <path
        d="M50 63C50 63 32 50.8 32 39.5C32 33.7 36.7 29 42.5 29C45.8 29 48.7 30.5 50 32.8C51.3 30.5 54.2 29 57.5 29C63.3 29 68 33.7 68 39.5C68 50.8 50 63 50 63Z"
        fill="white"
      />
    </svg>
  </div>
);

/**
 * 1. Blindness Avatar: Girl with dark sunglasses, lavender top, holding white cane with red tip
 */
export const BlindnessAvatar: React.FC<AvatarProps> = ({ className = '', size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g>
      {/* Background soft glow circle */}
      <circle cx="70" cy="70" r="62" fill="#E0F2FE" />
      
      {/* Hair back */}
      <path d="M42 42C38 65 30 100 46 120C48 122 52 110 50 85" fill="#3D2314" />
      <path d="M98 42C102 65 110 100 94 120C92 122 88 110 90 85" fill="#3D2314" />
      <path d="M40 50C40 30 52 20 70 20C88 20 100 30 100 50C100 68 96 82 96 82L44 82C44 82 40 68 40 50Z" fill="#4B2C1A" />
      
      {/* Neck */}
      <rect x="63" y="80" width="14" height="15" rx="3" fill="#F8C7A0" />
      
      {/* Lavender shirt */}
      <path d="M42 98C42 90 52 88 70 88C88 88 98 90 98 98L106 130C106 130 92 135 70 135C48 135 34 130 34 130L42 98Z" fill="#C084FC" />
      {/* Collar */}
      <path d="M60 88C64 94 76 94 80 88" stroke="white" strokeWidth="2.5" strokeLinecap="round" />

      {/* Face */}
      <path d="M48 50C48 38 56 30 70 30C84 30 92 38 92 50C92 68 83 78 70 78C57 78 48 68 48 50Z" fill="#FDD6B5" />
      
      {/* Bangs */}
      <path d="M45 44C52 38 64 42 70 46C76 42 88 38 95 44C91 32 82 25 70 25C58 25 49 32 45 44Z" fill="#3D2314" />
      
      {/* Cheerful blush */}
      <circle cx="56" cy="62" r="4" fill="#F87171" fillOpacity="0.4" />
      <circle cx="84" cy="62" r="4" fill="#F87171" fillOpacity="0.4" />
      
      {/* Smile */}
      <path d="M64 66C66 69 74 69 76 66" stroke="#994D2E" strokeWidth="2" strokeLinecap="round" />

      {/* Sunglasses */}
      <path d="M52 50H66C67.5 50 68 53 67.5 56C66.5 61 63 63 59 63C55 63 51 60 51 56C51 53 51.5 50 52 50Z" fill="#1E293B" />
      <path d="M74 50H88C89.5 50 90 53 89.5 56C88.5 61 85 63 81 63C77 63 73 60 73 56C73 53 73.5 50 74 50Z" fill="#1E293B" />
      <path d="M66 53H74" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
      {/* Sunglasses reflection */}
      <line x1="55" y1="53" x2="62" y2="60" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="77" y1="53" x2="84" y2="60" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />

      {/* Hand holding cane */}
      <circle cx="98" cy="104" r="6" fill="#FDD6B5" />
      {/* White cane with red tip */}
      <path d="M102 96L122 135" stroke="#CBD5E1" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M102 96L107 106" stroke="#EF4444" strokeWidth="4.5" strokeLinecap="round" />

      {/* Eye with slash indicator badge in top right */}
      <g transform="translate(100, 16)">
        <circle cx="16" cy="16" r="16" fill="white" stroke="#0284C7" strokeWidth="2.5" />
        <path d="M8 16C8 16 11 10 16 10C21 10 24 16 24 16C24 16 21 22 16 22C11 22 8 16 8 16Z" stroke="#0369A1" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="16" r="3" fill="#0369A1" />
        <line x1="9" y1="23" x2="23" y2="9" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </g>
  </svg>
);

/**
 * 2. Deafness Avatar: Boy with hearing aid and sound wave gesture
 */
export const DeafnessAvatar: React.FC<AvatarProps> = ({ className = '', size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g>
      <circle cx="70" cy="70" r="62" fill="#EFF6FF" />

      {/* Short brown hair back */}
      <path d="M46 38C46 22 60 16 74 16C88 16 98 24 98 42C98 56 94 62 94 62L44 62C44 62 46 50 46 38Z" fill="#362214" />
      
      {/* Neck */}
      <rect x="64" y="80" width="14" height="15" rx="3" fill="#F8C7A0" />

      {/* Blue shirt */}
      <path d="M40 98C40 90 52 88 71 88C90 88 102 90 102 98L108 132C108 132 94 136 71 136C48 136 34 132 34 132L40 98Z" fill="#3B82F6" />
      
      {/* Collar */}
      <path d="M62 88C66 94 76 94 80 88" stroke="white" strokeWidth="2.5" strokeLinecap="round" />

      {/* Face */}
      <path d="M50 48C50 36 58 28 71 28C84 28 92 36 92 48C92 66 84 78 71 78C58 78 50 66 50 48Z" fill="#FDD6B5" />

      {/* Boy Bangs */}
      <path d="M48 40C54 36 62 38 68 34C74 38 84 34 92 40C90 30 82 22 71 22C60 22 52 28 48 40Z" fill="#2E1B0F" />

      {/* Eyes */}
      <ellipse cx="61" cy="52" rx="3" ry="4" fill="#1E293B" />
      <ellipse cx="81" cy="52" rx="3" ry="4" fill="#1E293B" />
      <circle cx="62" cy="50.5" r="1" fill="white" />
      <circle cx="82" cy="50.5" r="1" fill="white" />
      
      {/* Eyebrows */}
      <path d="M57 45C59 44 64 44 66 46" stroke="#2E1B0F" strokeWidth="2" strokeLinecap="round" />
      <path d="M76 46C78 44 83 44 85 45" stroke="#2E1B0F" strokeWidth="2" strokeLinecap="round" />

      {/* Cheerful blush */}
      <circle cx="56" cy="62" r="4" fill="#F87171" fillOpacity="0.4" />
      <circle cx="86" cy="62" r="4" fill="#F87171" fillOpacity="0.4" />

      {/* Smile */}
      <path d="M65 65C67 69 75 69 77 65" stroke="#994D2E" strokeWidth="2" strokeLinecap="round" />

      {/* Hearing Aid on Left Ear */}
      <path d="M91 48C95 48 97 52 96 58C95 62 92 64 90 64" fill="#F8C7A0" stroke="#E2E8F0" strokeWidth="1.5" />
      <path d="M93 46C96 46 98 49 98 54C98 58 96 61 93 61" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
      <circle cx="94" cy="49" r="2.5" fill="#0284C7" />

      {/* Ear icon with red slash badge */}
      <g transform="translate(100, 16)">
        <circle cx="16" cy="16" r="16" fill="white" stroke="#2563EB" strokeWidth="2.5" />
        <path d="M13 11C16 11 19 13 19 16C19 19 17 20 16 22C15.5 22.8 14 24 14 24" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" />
        <circle cx="14" cy="20" r="1" fill="#1D4ED8" />
        <line x1="9" y1="23" x2="23" y2="9" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </g>
  </svg>
);

/**
 * 3. Mobility Impairment Avatar: Person in a wheelchair with green shirt
 */
export const MobilityAvatar: React.FC<AvatarProps> = ({ className = '', size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g>
      <circle cx="70" cy="70" r="62" fill="#F0F9FF" />

      {/* Wheelchair backrest and frame */}
      <path d="M48 68V95L65 95" stroke="#475569" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="45" y1="62" x2="45" y2="76" stroke="#334155" strokeWidth="4" strokeLinecap="round" />

      {/* Person body in wheelchair */}
      <circle cx="62" cy="42" r="13" fill="#FDD6B5" />
      {/* Hair */}
      <path d="M52 38C52 28 62 26 72 28C74 34 74 42 74 42C74 42 66 38 60 40C54 42 52 44 52 44Z" fill="#3D2314" />
      <ellipse cx="66" cy="42" rx="2" ry="2.5" fill="#1E293B" />
      <path d="M63 48C65 50 69 50 70 48" stroke="#994D2E" strokeWidth="1.5" strokeLinecap="round" />

      {/* Green shirt */}
      <path d="M52 56C52 56 60 54 70 56C73 58 75 66 75 74L56 74L52 56Z" fill="#10B981" />
      
      {/* Arm resting forward / thumbs up */}
      <path d="M60 62L74 68L80 64" stroke="#FDD6B5" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dark Pants & legs bent at knees */}
      <path d="M56 74L76 74L78 92" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      {/* Shoes on footrest */}
      <path d="M76 92H84" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
      <line x1="72" y1="96" x2="86" y2="96" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />

      {/* Large Wheelchair Main Wheel */}
      <circle cx="56" cy="95" r="23" stroke="#2563EB" strokeWidth="4.5" fill="#DBEAFE" fillOpacity="0.4" />
      <circle cx="56" cy="95" r="6" fill="#1D4ED8" />
      {/* Spokes */}
      <line x1="56" y1="72" x2="56" y2="118" stroke="#60A5FA" strokeWidth="2" />
      <line x1="33" y1="95" x2="79" y2="95" stroke="#60A5FA" strokeWidth="2" />
      <line x1="40" y1="79" x2="72" y2="111" stroke="#60A5FA" strokeWidth="2" />
      <line x1="40" y1="111" x2="72" y2="79" stroke="#60A5FA" strokeWidth="2" />

      {/* Front small caster wheel */}
      <circle cx="82" cy="112" r="6" stroke="#475569" strokeWidth="3" fill="#E2E8F0" />
      <line x1="78" y1="95" x2="82" y2="112" stroke="#475569" strokeWidth="3.5" />
    </g>
  </svg>
);

/**
 * 4. Speech Impairment Avatar: Girl with thoughtful chin gesture, yellow shirt, speech slash badge
 */
export const SpeechAvatar: React.FC<AvatarProps> = ({ className = '', size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g>
      <circle cx="70" cy="70" r="62" fill="#FEF9C3" fillOpacity="0.5" />

      {/* Dark brown bob hair back */}
      <path d="M42 45C38 65 36 90 44 96C46 98 52 96 50 80" fill="#2E1B0F" />
      <path d="M96 45C100 65 102 90 94 96C92 98 86 96 88 80" fill="#2E1B0F" />
      <path d="M40 50C40 28 54 18 70 18C86 18 100 28 100 50C100 68 96 82 96 82L44 82C44 82 40 68 40 50Z" fill="#3B2213" />

      {/* Neck */}
      <rect x="63" y="80" width="14" height="15" rx="3" fill="#F8C7A0" />

      {/* Warm Yellow Shirt */}
      <path d="M42 98C42 90 52 88 70 88C88 88 98 90 98 98L106 130C106 130 92 135 70 135C48 135 34 130 34 130L42 98Z" fill="#FBBF24" />
      <path d="M60 88C64 94 76 94 80 88" stroke="white" strokeWidth="2.5" strokeLinecap="round" />

      {/* Face */}
      <path d="M48 50C48 38 56 30 70 30C84 30 92 38 92 50C92 68 83 78 70 78C57 78 48 68 48 50Z" fill="#FDD6B5" />

      {/* Bangs */}
      <path d="M46 44C52 38 64 42 70 44C76 42 88 38 94 44C91 32 82 25 70 25C58 25 49 32 46 44Z" fill="#2E1B0F" />

      {/* Eyes with thoughtful look */}
      <ellipse cx="60" cy="53" rx="3" ry="3.5" fill="#1E293B" />
      <ellipse cx="80" cy="53" rx="3" ry="3.5" fill="#1E293B" />
      <circle cx="61" cy="51.5" r="1" fill="white" />
      <circle cx="81" cy="51.5" r="1" fill="white" />

      {/* Cheerful blush */}
      <circle cx="55" cy="62" r="4" fill="#F87171" fillOpacity="0.4" />
      <circle cx="85" cy="62" r="4" fill="#F87171" fillOpacity="0.4" />

      {/* Gentle mouth */}
      <path d="M66 67H74" stroke="#994D2E" strokeWidth="2" strokeLinecap="round" />

      {/* Hand gently raised towards chin */}
      <path d="M78 88C78 88 76 78 72 74C70 72 68 73 66 74" stroke="#F8C7A0" strokeWidth="5.5" strokeLinecap="round" />
      <circle cx="68" cy="74" r="3.5" fill="#FDD6B5" />

      {/* Speech bubble with red slash badge */}
      <g transform="translate(100, 16)">
        <circle cx="16" cy="16" r="16" fill="white" stroke="#D97706" strokeWidth="2.5" />
        <path d="M10 14C10 11.5 12.5 10 16 10C19.5 10 22 11.5 22 14C22 16.5 19.5 18 16 18C15 18 14 18.2 13 19.5L12 18C10.8 17.5 10 16 10 14Z" stroke="#B45309" strokeWidth="1.8" fill="#FEF3C7" />
        <line x1="9" y1="23" x2="23" y2="9" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </g>
  </svg>
);

/**
 * 5. Autism Avatar: Silhouette with colorful jigsaw puzzle piece in mind
 */
export const AutismAvatar: React.FC<AvatarProps> = ({ className = '', size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g>
      <circle cx="70" cy="70" r="62" fill="#E0F2FE" />

      {/* Thoughtful Profile Head Silhouette */}
      <path
        d="M45 130V105C45 95 50 86 60 84C62 82 62 76 60 74C56 70 54 62 55 52C56 36 68 24 85 25C100 26 110 37 110 52C110 60 106 68 100 73C100 78 103 82 108 85C118 90 120 100 120 110V130H45Z"
        fill="#0284C7"
      />

      {/* Brain chamber glow */}
      <circle cx="85" cy="50" r="22" fill="#0369A1" />

      {/* Jigsaw Puzzle Piece Motif */}
      <g transform="translate(73, 38)">
        <path
          d="M6 6H14C14 8 16 9.5 18 9.5C20 9.5 22 8 22 6H30V14C28 14 26.5 16 26.5 18C26.5 20 28 22 30 22V30H22C22 28 20 26.5 18 26.5C16 26.5 14 28 14 30H6V22C8 22 9.5 20 9.5 18C9.5 16 8 14 6 14V6Z"
          fill="#34D399"
          stroke="#059669"
          strokeWidth="2"
        />
        <circle cx="18" cy="18" r="3" fill="#FBBF24" />
      </g>

      {/* Neural sparkle points */}
      <circle cx="68" cy="40" r="2" fill="#F8FAFC" />
      <circle cx="102" cy="44" r="2.5" fill="#F8FAFC" />
      <circle cx="74" cy="64" r="2" fill="#F8FAFC" />
      <circle cx="96" cy="62" r="1.5" fill="#F8FAFC" />
    </g>
  </svg>
);

/**
 * 6. Cognitive Impairment Avatar: Elderly woman with round glasses, warm yellow cardigan, and brain sparkle icon
 */
export const CognitiveAvatar: React.FC<AvatarProps> = ({ className = '', size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g>
      <circle cx="70" cy="70" r="62" fill="#FAF5FF" />

      {/* Silver/gray hair bun on top */}
      <circle cx="70" cy="20" r="11" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />
      {/* Hair main */}
      <path d="M42 48C40 28 54 22 70 22C86 22 100 28 98 48C98 64 96 74 96 74L44 74C44 74 42 64 42 48Z" fill="#E2E8F0" />
      <path d="M46 44C52 36 62 40 70 42C78 40 88 36 94 44" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

      {/* Neck */}
      <rect x="63" y="78" width="14" height="15" rx="3" fill="#F8C7A0" />

      {/* Warm Yellow Cardigan */}
      <path d="M42 96C42 88 52 86 70 86C88 86 98 88 98 96L104 130C104 130 90 134 70 134C50 134 36 130 36 130L42 96Z" fill="#F59E0B" />
      {/* Inner blouse */}
      <path d="M64 86L70 98L76 86" stroke="#FEF3C7" strokeWidth="4" strokeLinecap="round" />

      {/* Face */}
      <path d="M48 48C48 36 56 28 70 28C84 28 92 36 92 48C92 66 83 76 70 76C57 76 48 66 48 48Z" fill="#FDD6B5" />

      {/* Round Glasses */}
      <circle cx="60" cy="50" r="8" stroke="#78350F" strokeWidth="2.5" fill="none" />
      <circle cx="80" cy="50" r="8" stroke="#78350F" strokeWidth="2.5" fill="none" />
      <line x1="68" y1="50" x2="72" y2="50" stroke="#78350F" strokeWidth="2.5" />

      {/* Warm gentle eyes inside glasses */}
      <path d="M57 49C59 47 62 47 64 49" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
      <path d="M77 49C79 47 82 47 84 49" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />

      {/* Cheerful blush */}
      <circle cx="56" cy="62" r="4" fill="#F87171" fillOpacity="0.4" />
      <circle cx="84" cy="62" r="4" fill="#F87171" fillOpacity="0.4" />

      {/* Gentle smile */}
      <path d="M65 65C67 69 73 69 75 65" stroke="#994D2E" strokeWidth="2" strokeLinecap="round" />

      {/* Brain illustration icon badge */}
      <g transform="translate(98, 14)">
        <circle cx="16" cy="16" r="16" fill="white" stroke="#A855F7" strokeWidth="2.5" />
        {/* Cute brain contour */}
        <path
          d="M12 18C10 18 8 16 8 14C8 12 10 10.5 12 11C12.5 9 14.5 8 16 8C17.5 8 19.5 9 20 11C22 10.5 24 12 24 14C24 16 22 18 20 18C19 20 17.5 22 16 22C14.5 22 13 20 12 18Z"
          fill="#F3E8FF"
          stroke="#9333EA"
          strokeWidth="1.8"
        />
        {/* Brain sulci / lobes */}
        <path d="M16 8V22" stroke="#9333EA" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M12 14C14 13 15 15 16 15" stroke="#9333EA" strokeWidth="1" strokeLinecap="round" />
        <path d="M20 14C18 13 17 15 16 15" stroke="#9333EA" strokeWidth="1" strokeLinecap="round" />
      </g>
    </g>
  </svg>
);

/**
 * Header Diversity Banner Group: 4 smiling inclusive characters
 */
export const HeaderCharactersGroup: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative flex items-end -space-x-4 select-none ${className}`}>
    <div className="transform hover:scale-105 transition-transform" title="Blind Support">
      <BlindnessAvatar size={80} />
    </div>
    <div className="transform hover:scale-105 transition-transform" title="Deaf Support">
      <DeafnessAvatar size={80} />
    </div>
    <div className="transform hover:scale-105 transition-transform" title="Mobility Impairment Support">
      <MobilityAvatar size={84} />
    </div>
    <div className="transform hover:scale-105 transition-transform" title="Speech & Cognitive Support">
      <SpeechAvatar size={80} />
    </div>
  </div>
);

/**
 * Message Icons matching the screenshot
 */
export const MessageIcon: React.FC<{ name: string; className?: string }> = ({ name, className = 'w-7 h-7' }) => {
  switch (name) {
    case 'assistance':
      // Blue Speaker with sound arcs
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 12H11L18 6V26L11 20H7C5.89543 20 5 19.1046 5 18V14C5 12.8954 5.89543 12 7 12Z" fill="#1D4ED8" stroke="#1E40AF" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M22 11C23.5 12.5 24.5 14.5 24.5 16C24.5 17.5 23.5 19.5 22 21" stroke="#1D4ED8" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M25 8C27.5 10.5 29 13.5 29 16C29 18.5 27.5 21.5 25 24" stroke="#1D4ED8" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'food':
      // Fork and Knife
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 5V13C9 14.5 10 16 12 16V27" stroke="#1D4ED8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 5V13" stroke="#1D4ED8" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M15 5V13C15 14.5 14 16 12 16" stroke="#1D4ED8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M23 5V27M23 5C20.5 5 19 7.5 19 12V16H23" stroke="#1D4ED8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'water':
      // Glass with refreshing water
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 6H24L21.5 26C21.3 27.2 20.2 28 19 28H13C11.8 28 10.7 27.2 10.5 26L8 6Z" stroke="#0284C7" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M9.5 14C11.5 13 14 15 16 14C18 13 20.5 15 22.5 14L21.5 25H10.5L9.5 14Z" fill="#38BDF8" fillOpacity="0.8" />
        </svg>
      );
    case 'unwell':
      // Bold Red Medical Cross
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4H20V12H28V20H20V28H12V20H4V12H12V4Z" fill="#EF4444" stroke="#DC2626" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case 'home':
      // Blue House
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 14L16 4L28 14V26C28 27.1 27.1 28 26 28H6C4.9 28 4 27.1 4 26V14Z" fill="#1E3A8A" stroke="#172554" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M13 28V18H19V28" fill="#DBEAFE" />
        </svg>
      );
    case 'custom':
      // Blue Speech Bubble with 3 Dots
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 16C5 9.9 9.9 5 16 5C22.1 5 27 9.9 27 16C27 22.1 22.1 27 16 27C13.5 27 11.2 26.2 9.3 24.8L4 26L5.5 21C5.2 19.4 5 17.7 5 16Z" fill="#1D4ED8" stroke="#1E40AF" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="11" cy="16" r="1.8" fill="white" />
          <circle cx="16" cy="16" r="1.8" fill="white" />
          <circle cx="21" cy="16" r="1.8" fill="white" />
        </svg>
      );
    case 'yes':
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
          ✓
        </div>
      );
    case 'no':
      return (
        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg">
          ✕
        </div>
      );
    case 'toilet':
      return (
        <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-base">
          🚻
        </div>
      );
    case 'pain':
      return (
        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-base">
          ⚡
        </div>
      );
    case 'quiet':
      return (
        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-base">
          🤫
        </div>
      );
    case 'thankyou':
      return (
        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-base">
          🙏
        </div>
      );
    case 'navigation':
      return (
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base">
          🧭
        </div>
      );
    case 'needs':
      return (
        <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-base">
          ✨
        </div>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
          <path d="M16 10V18M16 22H16.02" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
  }
};
