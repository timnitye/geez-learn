"use client";

import { useGame } from "@/context/GameContext";
import { getLevel, getXpInLevel, XP_PER_LEVEL } from "@/data/geez";

// Screen titles for the header
const SCREEN_TITLES = {
  home: "ፊደል",
  family: "Family Explorer",
  vowel: "Vowel Builder",
  timed: "Speed Round",
  heartap: "Hear & Tap",
  mastery: "Progress",
  settings: "Settings",
  picker_family: "Choose Family",
};

export default function Header({ showBack = false, onBack }) {
  const { state, dispatch } = useGame();
  const level = getLevel(state.xp);
  const xpInLevel = getXpInLevel(state.xp);
  const pct = (xpInLevel / XP_PER_LEVEL) * 100;
  const title = SCREEN_TITLES[state.screen] || "ፊደል";
  const isHome = state.screen === "home";

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      dispatch({ type: "NAVIGATE", payload: { screen: "home" } });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-700/50">
      <div className="max-w-lg mx-auto px-4 pt-safe">
        <div className="flex items-center justify-between h-14 gap-3">
          {/* Left: Back button or logo */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {showBack && !isHome ? (
              <button
                onClick={handleBack}
                className="flex items-center justify-center w-10 h-10 -ml-2 rounded-xl
                         text-slate-400 hover:text-white hover:bg-slate-800/50
                         transition-colors touch-manipulation touch-target"
                aria-label="Go back"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            ) : null}

            <h1
              className={`font-bold truncate ${
                isHome ? "text-xl" : "text-base"
              } text-white`}
            >
              {title}
            </h1>
          </div>

          {/* Right: Stats (compact) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Level badge with XP ring */}
            <div className="relative">
              <div
                className="w-9 h-9 rounded-full bg-slate-800 border-2 border-slate-600
                          flex items-center justify-center text-sm font-bold text-white"
              >
                {level}
              </div>
              {/* XP progress ring */}
              <svg
                className="absolute inset-0 w-9 h-9 -rotate-90"
                viewBox="0 0 36 36"
                aria-hidden="true"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-indigo-500/30"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${pct} 100`}
                  strokeLinecap="round"
                  className="text-indigo-500 transition-all duration-500"
                />
              </svg>
            </div>

            {/* Streak */}
            <div
              className={`
                flex items-center gap-1 px-2 py-1 rounded-lg
                ${state.streak >= 5
                  ? "bg-orange-500/20 text-orange-400"
                  : state.streak >= 2
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-slate-800/50 text-slate-400"
                }
              `}
              aria-label={`Current streak: ${state.streak}`}
            >
              <span className="text-sm" role="img" aria-hidden="true">
                {state.streak >= 5 ? "🔥" : state.streak >= 2 ? "⚡" : "✦"}
              </span>
              <span className="text-xs font-bold tabular-nums">{state.streak}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
