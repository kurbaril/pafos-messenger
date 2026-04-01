/**
 * Sound effects utility for audio feedback
 * Uses Web Audio API for modern browsers
 */

let audioContext = null;
let isInitialized = false;

/**
 * Initialize Audio Context (must be called after user interaction)
 */
export const initAudio = () => {
  if (!audioContext && window.AudioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    isInitialized = true;
  }
  return audioContext;
};

/**
 * Check if sound is enabled in settings
 */
export const isSoundEnabled = () => {
  const settings = localStorage.getItem('pafos_settings');
  if (settings) {
    const parsed = JSON.parse(settings);
    return parsed.sound !== false;
  }
  return true;
};

/**
 * Set sound preference
 */
export const setSoundEnabled = (enabled) => {
  const settings = localStorage.getItem('pafos_settings');
  const parsed = settings ? JSON.parse(settings) : {};
  parsed.sound = enabled;
  localStorage.setItem('pafos_settings', JSON.stringify(parsed));
};

/**
 * Play a simple beep sound
 * @param {number} frequency - Frequency in Hz (default: 800)
 * @param {number} duration - Duration in seconds (default: 0.1)
 * @param {number} volume - Volume 0-1 (default: 0.3)
 */
export const playBeep = (frequency = 800, duration = 0.1, volume = 0.3) => {
  if (!isSoundEnabled()) return;
  
  const ctx = initAudio();
  if (!ctx) return;
  
  // Resume if suspended (browsers require user interaction)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  
  oscillator.frequency.value = frequency;
  gain.gain.value = volume;
  
  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
  oscillator.stop(ctx.currentTime + duration);
};

/**
 * Play sound for sent message
 */
export const playSendSound = () => {
  playBeep(1000, 0.05, 0.2);
};

/**
 * Play sound for received message
 */
export const playReceiveSound = () => {
  playBeep(1200, 0.1, 0.25);
};

/**
 * Play sound for notification
 */
export const playNotificationSound = () => {
  playBeep(1500, 0.15, 0.3);
  setTimeout(() => playBeep(1200, 0.15, 0.25), 100);
};

/**
 * Play sound for reaction
 */
export const playReactionSound = () => {
  playBeep(600, 0.05, 0.15);
};

/**
 * Play sound for error
 */
export const playErrorSound = () => {
  playBeep(400, 0.3, 0.25);
};

/**
 * Play sound for success
 */
export const playSuccessSound = () => {
  playBeep(1500, 0.1, 0.2);
  setTimeout(() => playBeep(1800, 0.1, 0.2), 50);
};

/**
 * Play sound for typing indicator (very short)
 */
export const playTypingSound = () => {
  playBeep(500, 0.02, 0.1);
};

/**
 * Play sound for new chat
 */
export const playNewChatSound = () => {
  playBeep(800, 0.15, 0.25);
  setTimeout(() => playBeep(1000, 0.15, 0.25), 80);
};

/**
 * Play sound for group creation
 */
export const playGroupCreateSound = () => {
  playBeep(600, 0.2, 0.25);
  setTimeout(() => playBeep(800, 0.2, 0.25), 100);
  setTimeout(() => playBeep(1000, 0.2, 0.25), 200);
};

/**
 * Resume audio context (call after user interaction)
 */
export const resumeAudio = () => {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
};

/**
 * Preload audio context (call on user first interaction)
 */
export const preloadAudio = () => {
  initAudio();
  if (audioContext) {
    // Create a silent buffer to unlock audio
    const buffer = audioContext.createBuffer(1, 1, 22050);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
  }
};