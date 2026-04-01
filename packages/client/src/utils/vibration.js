/**
 * Vibration utility for mobile devices
 * Provides haptic feedback for various actions
 */

// Check if vibration is supported
const isVibrationSupported = () => {
  return 'vibrate' in window.navigator;
};

/**
 * Vibrate with a pattern
 * @param {number|array} pattern - Vibration pattern in milliseconds
 */
export const vibrate = (pattern = 50) => {
  if (!isVibrationSupported()) return;
  
  try {
    window.navigator.vibrate(pattern);
  } catch (error) {
    console.warn('Vibration failed:', error);
  }
};

/**
 * Short vibration for message send
 */
export const vibrateOnSend = () => {
  vibrate(20);
};

/**
 * Medium vibration for message receive
 */
export const vibrateOnReceive = () => {
  vibrate(50);
};

/**
 * Short vibration for reaction
 */
export const vibrateOnReaction = () => {
  vibrate(15);
};

/**
 * Double vibration for notification
 */
export const vibrateOnNotification = () => {
  vibrate([50, 100, 50]);
};

/**
 * Long vibration for error
 */
export const vibrateOnError = () => {
  vibrate([100, 50, 100, 50, 100]);
};

/**
 * Success vibration (short double)
 */
export const vibrateOnSuccess = () => {
  vibrate([30, 30, 30]);
};

/**
 * Typing start vibration (very short)
 */
export const vibrateOnTyping = () => {
  vibrate(10);
};

/**
 * Stop current vibration
 */
export const stopVibration = () => {
  if (!isVibrationSupported()) return;
  
  try {
    window.navigator.vibrate(0);
  } catch (error) {
    console.warn('Stop vibration failed:', error);
  }
};

/**
 * Check if vibration is enabled in settings
 * @returns {boolean}
 */
export const isVibrationEnabled = () => {
  const settings = localStorage.getItem('pafos_settings');
  if (settings) {
    const parsed = JSON.parse(settings);
    return parsed.vibration !== false;
  }
  return true; // Enabled by default
};

/**
 * Set vibration preference
 * @param {boolean} enabled
 */
export const setVibrationEnabled = (enabled) => {
  const settings = localStorage.getItem('pafos_settings');
  const parsed = settings ? JSON.parse(settings) : {};
  parsed.vibration = enabled;
  localStorage.setItem('pafos_settings', JSON.stringify(parsed));
};

/**
 * Safe vibrate that respects user preferences
 * @param {number|array} pattern
 */
export const safeVibrate = (pattern) => {
  if (isVibrationEnabled()) {
    vibrate(pattern);
  }
};