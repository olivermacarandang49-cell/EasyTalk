import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ── iOS Audio Unlock ──────────────────────────────────────────────────────
// iOS Safari blocks AudioContext and speechSynthesis until a user gesture.
// We unlock both on the very first touch/click so all subsequent TTS works.
function unlockAudio() {
  // Unlock Web Audio API
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
      ctx.resume().catch(() => {});
    }
  } catch { /* ignore */ }

  // Warm up speechSynthesis
  try {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance('');
      u.volume = 0;
      window.speechSynthesis.speak(u);
      window.speechSynthesis.cancel();
    }
  } catch { /* ignore */ }

  // Only need to do this once
  document.removeEventListener('touchstart', unlockAudio, true);
  document.removeEventListener('click', unlockAudio, true);
}

document.addEventListener('touchstart', unlockAudio, { once: true, capture: true });
document.addEventListener('click', unlockAudio, { once: true, capture: true });
// ─────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById('root')!).render(<App />);
