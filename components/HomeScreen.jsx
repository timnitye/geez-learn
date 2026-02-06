"use client";

import { useGame } from "@/context/GameContext";
import {
  CONSONANTS,
  CONSONANT_MAP,
  getChar,
  getLevel,
  getMasteryTier,
  TIER_COLORS,
} from "@/data/geez";
import StatsBar from "./StatsBar";

// Game mode cards shown on home screen
const GAME_MODES = [
  {
    id: "family",
    title: "Family Explorer",
    desc: "Learn consonant families and their vowel forms",
    emoji: "📖",
    color: "from-indigo-600 to-indigo-800",
    border: "border-indigo-500/50",
    needsConsonant: true,
  },
  {
    id: "vowel",
    title: "Vowel Builder",
    desc: "Combine consonants with vowel modifiers",
    emoji: "🔧",
    color: "from-purple-600 to-purple-800",
    border: "border-purple-500/50",
    needsConsonant: false,
  },
  {
    id: "timed",
    title: "Speed Round",
    desc: "Race the clock — combos and speed bonuses",
    emoji: "⚡",
    color: "from-orange-600 to-orange-800",
    border: "border-orange-500/50",
    needsConsonant: false,
  },
];

export default function HomeScreen() {
  const { state, dispatch } = useGame();
  const level = getLevel(state.xp);

  const navigate = (screen, consonantId = null) => {
    dispatch({ type: "NAVIGATE", payload: { screen, consonantId } });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-1">ፊደል</h1>
        <p className="text-sm text-slate-400">Learn the Geʽez Alphabet</p>
      </div>

      <StatsBar />

      {/* Game modes */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Play</h2>
        {GAME_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => {
              if (mode.needsConsonant) {
                // Go to consonant picker, then into the game
                navigate("picker_" + mode.id);
              } else {
                navigate(mode.id);
              }
            }}
            className={`
              flex items-center gap-4 p-4 rounded-2xl
              bg-gradient-to-r ${mode.color}
              border ${mode.border}
              text-left transition-all
              hover:scale-[1.02] active:scale-[0.98]
              touch-manipulation
            `}
          >
            <span className="text-3xl">{mode.emoji}</span>
            <div>
              <div className="text-white font-bold">{mode.title}</div>
              <div className="text-sm text-white/70">{mode.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Consonant families grid — quick access to family explorer */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Families</h2>
          <button
            onClick={() => navigate("mastery")}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium touch-manipulation"
          >
            View Map →
          </button>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
          {state.unlockedIds.map((id) => {
            const c = CONSONANT_MAP.get(id);
            if (!c) return null;
            const m = state.mastery[id];
            const tier = m ? getMasteryTier(m.correct, m.total) : "none";
            const colors = TIER_COLORS[tier];

            return (
              <button
                key={id}
                onClick={() => navigate("family", id)}
                className={`
                  flex flex-col items-center p-2 rounded-xl
                  ${colors.bg} border ${colors.ring}
                  transition-all hover:scale-105 active:scale-95
                  touch-manipulation
                `}
              >
                <span className="text-xl font-bold text-white">{getChar(c, 0)}</span>
                <span className={`text-[9px] ${colors.text} font-medium`}>{c.latin}</span>
              </button>
            );
          })}

          {/* Locked indicator */}
          {state.unlockedIds.length < CONSONANTS.length && (
            <div className="flex items-center justify-center p-2 rounded-xl bg-slate-900/30 border border-slate-800 opacity-50">
              <span className="text-sm text-slate-600">+{CONSONANTS.length - state.unlockedIds.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="text-lg font-bold text-white">{level}</div>
          <div className="text-[10px] text-slate-500 uppercase">Level</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="text-lg font-bold text-white">{state.bestStreak}</div>
          <div className="text-[10px] text-slate-500 uppercase">Best Streak</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="text-lg font-bold text-white">{state.unlockedIds.length}/{CONSONANTS.length}</div>
          <div className="text-[10px] text-slate-500 uppercase">Unlocked</div>
        </div>
      </div>
    </div>
  );
}
