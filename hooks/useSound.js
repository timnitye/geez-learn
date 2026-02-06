"use client";

import { useRef, useCallback } from "react";

// Generates simple tones via Web Audio API — no audio files required.
export function useSound() {
  const ctxRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((freq, duration = 0.12, type = "sine", gain = 0.15) => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      vol.gain.value = gain;
      vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(vol);
      vol.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }, [getCtx]);

  const correct = useCallback(() => {
    playTone(523, 0.1);  // C5
    setTimeout(() => playTone(659, 0.15), 80);  // E5
  }, [playTone]);

  const wrong = useCallback(() => {
    playTone(200, 0.2, "triangle", 0.1);
  }, [playTone]);

  const streak = useCallback((count) => {
    // Rising pitch with streak length
    const freq = 523 + count * 40;
    playTone(freq, 0.08);
    setTimeout(() => playTone(freq + 120, 0.12), 60);
    setTimeout(() => playTone(freq + 240, 0.18), 120);
  }, [playTone]);

  const levelUp = useCallback(() => {
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, "sine", 0.12), i * 120);
    });
  }, [playTone]);

  return { correct, wrong, streak, levelUp };
}
