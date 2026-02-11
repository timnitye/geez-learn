"use client";

import { useRef, useCallback, useEffect } from "react";

// AudioManager: handles preloading, caching, and non-overlapping playback.
// Only one sound plays at a time to prevent audio collision.
// Note: We preload audio to warm the browser cache, but create fresh Audio
// elements for each playback to avoid reuse bugs.

const preloadedPaths = new Set(); // Track which paths have been preloaded
let currentAudio = null;          // Track currently playing audio

export function useAudio() {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Stop audio on unmount to prevent orphaned playback
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
      }
    };
  }, []);

  // Preload a single audio file (warms browser cache)
  const preload = useCallback((path) => {
    if (preloadedPaths.has(path)) return Promise.resolve();
    return new Promise((resolve) => {
      const audio = new Audio(path);
      audio.preload = "auto";
      audio.addEventListener("canplaythrough", () => {
        preloadedPaths.add(path);
        resolve();
      }, { once: true });
      audio.addEventListener("error", () => {
        // Silently fail — audio might not exist yet
        resolve();
      }, { once: true });
      audio.load();
    });
  }, []);

  // Preload multiple audio files (e.g., a whole consonant family)
  const preloadMany = useCallback((paths) => {
    return Promise.all(paths.map(preload));
  }, [preload]);

  // Play audio — stops any currently playing audio first (no overlap)
  // Creates a fresh Audio element each time for reliable playback
  const play = useCallback((path) => {
    return new Promise((resolve) => {
      // Stop current audio if playing
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
      }

      // Always create a fresh Audio element for reliable playback
      const audio = new Audio(path);
      currentAudio = audio;

      const cleanup = () => {
        if (currentAudio === audio) currentAudio = null;
        resolve();
      };

      audio.addEventListener("ended", cleanup, { once: true });
      audio.addEventListener("error", cleanup, { once: true });

      audio.play().catch(() => {
        // Autoplay might be blocked — resolve anyway
        cleanup();
      });
    });
  }, []);

  // Stop any currently playing audio
  const stop = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  }, []);

  // Check if a path has been preloaded
  const isCached = useCallback((path) => {
    return preloadedPaths.has(path);
  }, []);

  return { play, stop, preload, preloadMany, isCached };
}

// Standalone preloader for use outside React (e.g., service worker)
export async function preloadAudioFiles(paths) {
  const promises = paths.map((path) => {
    if (preloadedPaths.has(path)) return Promise.resolve();
    return new Promise((resolve) => {
      const audio = new Audio(path);
      audio.preload = "auto";
      audio.addEventListener("canplaythrough", () => {
        preloadedPaths.add(path);
        resolve();
      }, { once: true });
      audio.addEventListener("error", resolve, { once: true });
      audio.load();
    });
  });
  await Promise.all(promises);
}
