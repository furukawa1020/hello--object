/**
 * useSound — Web Audio API による手続き的な効果音
 *
 * 依存なし。AudioContext をオンデマンド生成。
 */

let ctx = null;
const getCtx = () => {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
};

const tone = (frequency, duration, type = 'sine', volume = 0.2) => {
  try {
    const ac  = getCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ac.currentTime);
    gain.gain.setValueAtTime(volume, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  } catch (e) {
    /* AudioContext may be blocked by browser policy */
  }
};

const chord = (freqs, duration, type = 'sine', volume = 0.12) => {
  freqs.forEach(f => tone(f, duration, type, volume));
};

/** Public sound library */
export const sounds = {
  /** Generic click / select */
  select: () => tone(880, 0.08, 'square', 0.08),

  /** Successful execution */
  success: () => {
    tone(440, 0.1, 'sine', 0.15);
    setTimeout(() => tone(660, 0.15, 'sine', 0.12), 80);
  },

  /** Error / failure */
  error: () => {
    tone(180, 0.2, 'sawtooth', 0.15);
    setTimeout(() => tone(150, 0.3, 'sawtooth', 0.1), 100);
  },

  /** Door unlocked */
  unlock: () => {
    tone(320, 0.1, 'square', 0.1);
    setTimeout(() => tone(480, 0.2, 'sine', 0.12), 80);
    setTimeout(() => tone(640, 0.3, 'sine', 0.1), 180);
  },

  /** Door opened */
  doorOpen: () => {
    chord([220, 330, 440], 0.4, 'sine', 0.08);
    setTimeout(() => chord([330, 495, 660], 0.5, 'sine', 0.06), 300);
  },

  /** Chest opened */
  chestOpen: () => {
    tone(260, 0.1, 'triangle', 0.12);
    setTimeout(() => tone(390, 0.1, 'triangle', 0.1), 100);
    setTimeout(() => tone(520, 0.25, 'triangle', 0.1), 200);
  },

  /** Tome read */
  tomeRead: () => {
    tone(220, 0.3, 'sine', 0.08);
    setTimeout(() => tone(330, 0.4, 'sine', 0.06), 200);
    setTimeout(() => tone(440, 0.6, 'sine', 0.05), 400);
  },

  /** NPC talks */
  npcTalk: () => tone(600, 0.06, 'square', 0.06),

  /** Mirror reflects */
  mirror: () => {
    chord([528, 792, 1056], 0.5, 'sine', 0.05);
  },

  /** Pedestal activated */
  pedestal: () => {
    tone(110, 0.3, 'sawtooth', 0.15);
    setTimeout(() => chord([220, 330, 440, 550], 0.8, 'sine', 0.1), 250);
  },

  /** VICTORY — cursed door broken */
  victory: () => {
    const notes = [261.6, 329.6, 392, 523.2, 659.2, 784, 1046.5];
    notes.forEach((f, i) => {
      setTimeout(() => tone(f, 0.5, 'sine', 0.15), i * 120);
    });
    setTimeout(() => chord([261.6, 329.6, 392, 523.2], 2.0, 'sine', 0.12), notes.length * 120);
  },

  /** Reset world */
  reset: () => {
    tone(440, 0.1, 'sawtooth', 0.1);
    setTimeout(() => tone(330, 0.1, 'sawtooth', 0.08), 100);
    setTimeout(() => tone(220, 0.3, 'sawtooth', 0.08), 200);
  },
};

/** Map event names to sounds */
export const eventSound = (eventName) => {
  const map = {
    door_unlocked:      sounds.unlock,
    door_opened:        sounds.doorOpen,
    chest_unlocked:     sounds.unlock,
    chest_opened:       sounds.chestOpen,
    tome_opened:        sounds.tomeRead,
    npc_talked:         sounds.npcTalk,
    mirror_reflected:   sounds.mirror,
    pedestal_activated: sounds.pedestal,
  };
  const fn = map[eventName];
  if (fn) fn();
};
