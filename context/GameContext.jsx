"use client";

import { createContext, useContext, useReducer, useEffect } from "react";
import {
  CONSONANTS,
  INITIAL_UNLOCK_COUNT,
  XP_PER_LEVEL,
  getMasteryTier,
} from "@/data/geez";

// ── Initial State ──────────────────────────────────────────────────
const STORAGE_KEY = "geez-learn-progress";

function getInitialState() {
  return {
    xp: 0,
    streak: 0,
    bestStreak: 0,
    // Per-consonant mastery: { [consonantId]: { correct, total } }
    mastery: {},
    // IDs of unlocked consonant families
    unlockedIds: CONSONANTS.slice(0, INITIAL_UNLOCK_COUNT).map((c) => c.id),
    // Current screen: "home" | "family" | "vowel" | "timed" | "mastery"
    screen: "home",
    // Which consonant family is selected for a game
    activeConsonantId: null,
  };
}

// ── Reducer ────────────────────────────────────────────────────────
function gameReducer(state, action) {
  switch (action.type) {
    case "ANSWER_CORRECT": {
      const { consonantId } = action.payload;
      const prev = state.mastery[consonantId] || { correct: 0, total: 0 };
      const newMastery = {
        ...state.mastery,
        [consonantId]: { correct: prev.correct + 1, total: prev.total + 1 },
      };
      const newStreak = state.streak + 1;

      // Streak bonus: +2 per streak beyond 1, capped at +10
      const streakBonus = Math.min((newStreak - 1) * 2, 10);
      const xpGain = 10 + streakBonus;

      return {
        ...state,
        xp: state.xp + xpGain,
        streak: newStreak,
        bestStreak: Math.max(newStreak, state.bestStreak),
        mastery: newMastery,
      };
    }

    case "ANSWER_WRONG": {
      const { consonantId } = action.payload;
      const prev = state.mastery[consonantId] || { correct: 0, total: 0 };
      return {
        ...state,
        streak: 0,
        mastery: {
          ...state.mastery,
          [consonantId]: { correct: prev.correct, total: prev.total + 1 },
        },
      };
    }

    case "UNLOCK_NEXT": {
      // Unlock the next consonant family if available
      const currentCount = state.unlockedIds.length;
      if (currentCount >= CONSONANTS.length) return state;
      const nextId = CONSONANTS[currentCount].id;
      return {
        ...state,
        unlockedIds: [...state.unlockedIds, nextId],
      };
    }

    case "NAVIGATE":
      return {
        ...state,
        screen: action.payload.screen,
        activeConsonantId: action.payload.consonantId ?? state.activeConsonantId,
      };

    case "HYDRATE":
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────
const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, null, getInitialState);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: "HYDRATE", payload: parsed });
      }
    } catch {}
  }, []);

  // Persist to localStorage on change (skip screen/activeConsonantId)
  useEffect(() => {
    try {
      const { screen, activeConsonantId, ...persist } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
    } catch {}
  }, [state]);

  // Check if a new family should be unlocked after mastery update
  useEffect(() => {
    const lastUnlockedId = state.unlockedIds[state.unlockedIds.length - 1];
    if (!lastUnlockedId) return;
    const m = state.mastery[lastUnlockedId];
    if (!m) return;
    const tier = getMasteryTier(m.correct, m.total);
    // Unlock next family once latest family reaches bronze
    if (tier !== "none" && state.unlockedIds.length < CONSONANTS.length) {
      dispatch({ type: "UNLOCK_NEXT" });
    }
  }, [state.mastery, state.unlockedIds]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
