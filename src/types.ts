export type DisabilityConditionId = 
  | 'blindness' 
  | 'deafness' 
  | 'mobility' 
  | 'speech' 
  | 'autism' 
  | 'cognitive';

export type UserRoleMode = 'pwd' | 'companion';

export interface QuickMessage {
  id: string;
  text: string;
  iconName: 'assistance' | 'food' | 'water' | 'unwell' | 'home' | 'custom' | 'rest' | 'toilet' | 'yes' | 'no' | 'thankyou' | 'pain' | 'quiet' | 'listen' | 'navigation' | 'needs';
  category: 'core' | 'needs' | 'medical' | 'feelings' | 'navigation';
}

export interface DisabilityCondition {
  id: DisabilityConditionId;
  name: string;
  kicker: string;
  characterSpeech: string;
  badgeText: string;
  colorScheme: {
    primary: string;
    border: string;
    accent: string;
    lightBg: string;
    pillBg: string;
  };
  overview: string;
  communicationWays: string[];
  etiquetteTips: string[];
  specialPhrases: QuickMessage[];
}

export type AppLanguage = 'en' | 'tl';

export interface VoiceSettings {
  language: AppLanguage;
  voiceGender: 'female' | 'male';
  rate: number;
  pitch: number;
  volume: number;
  voiceURI: string;
  autoSpeakOnSelect: boolean;
  hapticFeedback: boolean;
  soundEffects: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
  highContrast: boolean;
  autoScanEnabled: boolean;
  autoScanInterval: number;
}
