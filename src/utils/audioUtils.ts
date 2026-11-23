/**
 * Audio synthesis & Web Speech API utilities for EasyTalk PWD Support
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Trigger subtle haptic vibration for tactile feedback
 */
export function triggerHapticFeedback(pattern: number | number[] = 40): void {
  try {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Ignore haptic errors
  }
}

/**
 * Play a gentle tactile click sound for accessible feedback
 */
export function playTactileClick(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.04);
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Ignore audio errors
  }
}

/**
 * Play a friendly positive confirmation chime
 */
export function playSuccessChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      
      gain.gain.setValueAtTime(0.15, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.2);
    });
  } catch {
    // Ignore audio errors
  }
}

/**
 * Play gentle ascending harp/xylophone arpeggio matching the 8 letters assembling
 */
export function playLetterAssemblySound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // 8 notes for E-a-s-y-T-a-l-k (C5 major scale upward cascade)
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.0, 987.77, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.085;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.28);
    });
  } catch {
    // Ignore audio errors
  }
}

/**
 * Play realistic water droplet / pouring bubble sound
 */
export function playWaterSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // First droplet
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(600, now);
    osc1.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // Second droplet
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(800, now + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(1800, now + 0.18);
    gain2.gain.setValueAtTime(0.15, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.22);
  } catch {
    // Ignore audio errors
  }
}

/**
 * Play dinner bell / food chime sound
 */
export function playFoodSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const fundamental = 1046.5; // C6
    const harmonic = 2093; // C7

    [fundamental, harmonic].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(idx === 0 ? 0.2 : 0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    });
  } catch {
    // Ignore
  }
}

/**
 * Play crisp assistance / concierge desk bell ding
 */
export function playAssistanceBell(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const freqs = [1760, 3520]; // A6 & A7 crisp ding
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(i === 0 ? 0.22 : 0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    });
  } catch {
    // Ignore
  }
}

/**
 * Play gentle heartbeat pulse for unwell / health check
 */
export function playUnwellSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Lub
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(110, now);
    osc1.frequency.exponentialRampToValueAtTime(65, now + 0.1);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // Dub
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(125, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(70, now + 0.27);
    gain2.gain.setValueAtTime(0.22, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.3);
  } catch {
    // Ignore
  }
}

/**
 * Play welcoming doorstep chime for "Home"
 */
export function playHomeChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [659.25, 523.25]; // E5 -> C5 (classic ding-dong door chime)
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = now + idx * 0.22;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.5);
    });
  } catch {
    // Ignore
  }
}

/**
 * Play cheerful pop for custom or generic message
 */
export function playBubblePop(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.05);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  } catch {
    // Ignore
  }
}

/**
 * Play condition selection musical tone
 */
export function playConditionTone(conditionId: string): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const freqs: Record<string, number[]> = {
      blindness: [440, 659.25], // A4 -> E5
      deafness: [523.25, 783.99], // C5 -> G5
      mobility: [392, 587.33], // G4 -> D5
      speech: [587.33, 880], // D5 -> A5
      autism: [493.88, 739.99], // B4 -> F#5
      cognitive: [523.25, 659.25, 783.99], // C5 -> E5 -> G5
    };

    const tones = freqs[conditionId] || [523.25, 659.25];
    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.08;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.22);
    });
  } catch {
    // Ignore
  }
}

/**
 * Route icon name to its specialized realistic sound effect
 */
export function playCardSound(iconName: string): void {
  switch (iconName) {
    case 'water':
      playWaterSound();
      break;
    case 'food':
      playFoodSound();
      break;
    case 'assistance':
      playAssistanceBell();
      break;
    case 'unwell':
    case 'pain':
      playUnwellSound();
      break;
    case 'home':
      playHomeChime();
      break;
    case 'custom':
      playBubblePop();
      break;
    default:
      playTactileClick();
      break;
  }
}

/**
 * Play an emergency alert sound
 */
export function playEmergencyAlert(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.linearRampToValueAtTime(440, now + 0.25);
    osc.frequency.linearRampToValueAtTime(880, now + 0.5);
    
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.6);
  } catch {
    // Ignore audio errors
  }
}

/**
 * Detect female voice indicators in voice name/ID
 */
export function isVoiceFemale(voice: SpeechSynthesisVoice): boolean {
  const name = voice.name.toLowerCase();
  // Known female voice names or indicators
  const femaleIndicators = [
    'female',
    'woman',
    'girl',
    'blessica', // Microsoft Filipino female
    'zira',
    'samantha',
    'karen',
    'victoria',
    'moira',
    'fiona',
    'tessa',
    'serena',
    'allison',
    'susan',
    'ava',
    'jenny',
    'aria',
    'catherine',
    'hazel',
    'joana',
    'eva',
    'yuri',
    'ayumi',
  ];

  // Exclude explicit male indicators
  const maleIndicators = ['male', 'guy', 'david', 'george', 'mark', 'angelo', 'richard', 'james', 'michael', 'paul'];
  if (maleIndicators.some(m => name.includes(m)) && !femaleIndicators.some(f => name.includes(f))) {
    return false;
  }

  return femaleIndicators.some(f => name.includes(f));
}

/**
 * Find the best matching voice given language and gender preference
 */
export function findBestVoice(
  language: 'en' | 'tl' = 'en',
  gender?: 'female' | 'male'
): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Language default rule: English -> Male, Tagalog -> Female
  const effectiveGender: 'female' | 'male' = gender ?? (language === 'tl' ? 'female' : 'male');

  if (language === 'tl') {
    // 1. Look for explicit Filipino / Tagalog voices (fil-PH, tl-PH, fil, tl)
    const tagalogVoices = voices.filter(v => {
      const l = v.lang.toLowerCase();
      return l.startsWith('fil') || l.startsWith('tl');
    });

    if (tagalogVoices.length > 0) {
      if (effectiveGender === 'female') {
        const femaleTl = tagalogVoices.find(v => isVoiceFemale(v));
        if (femaleTl) return femaleTl;
      } else {
        const maleTl = tagalogVoices.find(v => !isVoiceFemale(v));
        if (maleTl) return maleTl;
      }
      return tagalogVoices[0];
    }
  }

  // 2. Gender-matched voice (English or default fallback)
  if (effectiveGender === 'female') {
    const femaleVoice = voices.find(v => isVoiceFemale(v));
    if (femaleVoice) return femaleVoice;
    // Fallback: preferred clean english female voices
    const preferredNames = ['Google US English', 'Google UK English Female', 'Microsoft Zira', 'Samantha', 'Victoria', 'Karen'];
    const preferred = voices.find(v => preferredNames.some(p => v.name.includes(p)));
    if (preferred) return preferred;
  } else {
    // Male voice search: check for known male voice names first
    const maleNames = [
      'david',
      'george',
      'mark',
      'richard',
      'james',
      'michael',
      'paul',
      'guy',
      'daniel',
      'oliver',
      'alex',
      'fred',
      'angelo',
      'google uk english male',
      'google us english male',
      'microsoft david',
      'microsoft mark',
      'microsoft george',
    ];
    const namedMaleVoice = voices.find(v => 
      maleNames.some(m => v.name.toLowerCase().includes(m))
    );
    if (namedMaleVoice) return namedMaleVoice;

    const nonFemaleEnVoice = voices.find(v => !isVoiceFemale(v) && v.lang.toLowerCase().startsWith('en'));
    if (nonFemaleEnVoice) return nonFemaleEnVoice;

    const anyNonFemale = voices.find(v => !isVoiceFemale(v));
    if (anyNonFemale) return anyNonFemale;
  }

  return voices[0] || null;
}

// Global tracking for device speech synthesis to prevent acoustic feedback loops
// (i.e. microphone hearing the device's own speakers and executing phantom commands)
let ttsActiveUntil = 0;
let isSpeakingInternally = false;

/**
 * Returns true if the device's synthesized voice is currently speaking,
 * or has finished speaking within the last cooldown buffer (1500ms).
 * Strictly used to guard SpeechRecognition listeners from processing their own TTS speaker audio.
 */
export function isSystemSpeaking(): boolean {
  if (typeof window === 'undefined') return false;
  const hasSynthesis = typeof window.speechSynthesis !== 'undefined';
  const isBrowserSpeaking = hasSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending);
  return isSpeakingInternally || isBrowserSpeaking || Date.now() < ttsActiveUntil;
}

/**
 * Manually set or extend the speech cooldown buffer in milliseconds.
 */
export function setSpeechCooldown(durationMs: number = 1500): void {
  ttsActiveUntil = Math.max(ttsActiveUntil, Date.now() + durationMs);
}

/**
 * Speak text using Web Speech API with customizable options
 */
export function speakText(
  text: string, 
  options: { 
    rate?: number; 
    pitch?: number; 
    volume?: number; 
    voiceURI?: string; 
    language?: 'en' | 'tl';
    voiceGender?: 'female' | 'male';
    onStart?: () => void;
    onEnd?: () => void;
  } = {}
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    playSuccessChime();
    options.onEnd?.();
    return null;
  }

  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
  } catch {
    // ignore
  }

  // Mark TTS as starting (short pre-block so mic doesn't catch the first syllable)
  isSpeakingInternally = true;
  ttsActiveUntil = Date.now() + 300;

  const lang = options.language ?? 'en';
  // English mode is male, Tagalog mode is female
  const gender = options.voiceGender ?? (lang === 'tl' ? 'female' : 'male');

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'tl' ? 'fil-PH' : 'en-US';
  utterance.rate = options.rate ?? (gender === 'male' ? 0.95 : 0.98);
  
  // Female voice: slightly elevated pitch (1.16)
  // Male voice: deeper natural pitch (0.92)
  if (gender === 'female' && (options.pitch === undefined || options.pitch === 1.0)) {
    utterance.pitch = 1.16;
  } else if (gender === 'male' && (options.pitch === undefined || options.pitch === 1.0)) {
    utterance.pitch = 0.92;
  } else {
    utterance.pitch = options.pitch ?? 1.0;
  }
  utterance.volume = options.volume ?? 1.0;

  if (options.voiceURI) {
    try {
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(v => v.voiceURI === options.voiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    } catch {
      // fallback
    }
  } else {
    const bestVoice = findBestVoice(lang, gender);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }
  }

  utterance.onstart = () => {
    isSpeakingInternally = true;
    // Extend the block to cover actual speech duration
    ttsActiveUntil = Date.now() + 60000; // will be overridden by onend
    options.onStart?.();
  };

  utterance.onend = () => {
    isSpeakingInternally = false;
    // 1.2-second acoustic buffer so lingering speaker echo doesn't trigger the microphone
    ttsActiveUntil = Date.now() + 1200;
    options.onEnd?.();
  };

  utterance.onerror = (e) => {
    isSpeakingInternally = false;
    ttsActiveUntil = Date.now() + 400;
    console.warn('Speech synthesis error:', e);
    options.onEnd?.();
  };

  try {
    window.speechSynthesis.speak(utterance);
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch (err) {
    isSpeakingInternally = false;
    ttsActiveUntil = Date.now();
    console.warn('Speech synthesis speak error:', err);
  }

  return utterance;
}

/**
 * Stop any current speech
 */
export function stopSpeech(): void {
  isSpeakingInternally = false;
  ttsActiveUntil = Date.now() + 400;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
