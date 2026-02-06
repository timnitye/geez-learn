"use client";

import { useGame } from "@/context/GameContext";
import {
  CONSONANTS,
  getChar,
  getMasteryTier,
  TIER_COLORS,
} from "@/data/geez";
import StatsBar from "./StatsBar";

// Visual mastery map: grid of all 26 consonant families showing progress
export default function MasteryMap() {
  const { state, dispatch } = useGame();
  const handleHome = () => dispatch({ type: "NAVIGATE", payload: { screen: "home" } });

  // Stats
  const totalMastered = CONSONANTS.filter((c) => {
    const m = state.mastery[c.id];
    return m && getMasteryTier(m.correct, m.total) !== "none";
  }).length;

  return (
    <div className="flex flex-col gap-4 min-h-[80vh]">
      <StatsBar />
      <button onClick={handleHome} className="self-start text-sm text-slate-400 hover:text-white transition-colors touch-manipulation">
        ← Back
      </button>

      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-white">Mastery Map</h2>
        <p className="text-slate-400 text-sm">{totalMastered} / {CONSONANTS.length} families progressing</p>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {CONSONANTS.map((consonant) => {
          const m = state.mastery[consonant.id];
          const tier = m ? getMasteryTier(m.correct, m.total) : "none";
          const colors = TIER_COLORS[tier];
          const isUnlocked = state.unlockedIds.includes(consonant.id);
          const pct = m && m.total > 0 ? Math.round((m.correct / m.total) * 100) : 0;

          return (
            <button
              key={consonant.id}
              onClick={() => {
                if (isUnlocked) {
                  dispatch({ type: "NAVIGATE", payload: { screen: "family", consonantId: consonant.id } });
                }
              }}
              disabled={!isUnlocked}
              className={`
                relative flex flex-col items-center justify-center
                p-3 rounded-2xl border-2 transition-all
                touch-manipulation
                ${isUnlocked
                  ? `${colors.bg} ${colors.ring} border-current hover:scale-105 active:scale-95 cursor-pointer`
                  : "bg-slate-900/50 border-slate-800 opacity-40 cursor-not-allowed"
                }
              `}
            >
              <span className={`text-2xl font-bold ${isUnlocked ? "text-white" : "text-slate-600"}`}>
                {getChar(consonant, 0)}
              </span>
              <span className={`text-[10px] font-medium mt-0.5 ${isUnlocked ? colors.text : "text-slate-700"}`}>
                {consonant.latin}
              </span>

              {/* Mastery indicator */}
              {isUnlocked && m && m.total > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold bg-slate-900 border border-current">
                  {tier === "gold" ? "★" : tier === "silver" ? "◆" : tier === "bronze" ? "●" : `${pct}`}
                </div>
              )}

              {/* Lock icon */}
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-slate-700 text-lg">🔒</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4 text-xs text-slate-400">
        {["bronze", "silver", "gold"].map((tier) => (
          <div key={tier} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${TIER_COLORS[tier].bg} border ${TIER_COLORS[tier].ring}`} />
            <span className="capitalize">{tier}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
