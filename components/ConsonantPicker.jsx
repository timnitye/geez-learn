"use client";

import { useGame } from "@/context/GameContext";
import { CONSONANT_MAP, getChar, getMasteryTier, TIER_COLORS } from "@/data/geez";
import StatsBar from "./StatsBar";

// Lets the player choose which consonant family to practice.
// Only shows unlocked families.
export default function ConsonantPicker({ targetScreen = "family" }) {
  const { state, dispatch } = useGame();

  const handleHome = () => dispatch({ type: "NAVIGATE", payload: { screen: "home" } });
  const handleSelect = (id) => dispatch({ type: "NAVIGATE", payload: { screen: targetScreen, consonantId: id } });

  return (
    <div className="flex flex-col gap-4 min-h-[80vh]">
      <StatsBar />
      <button onClick={handleHome} className="self-start text-sm text-slate-400 hover:text-white transition-colors touch-manipulation">
        ← Back
      </button>

      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-white">Choose a Family</h2>
        <p className="text-sm text-slate-400">Pick a consonant to practice</p>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
        {state.unlockedIds.map((id) => {
          const c = CONSONANT_MAP.get(id);
          if (!c) return null;
          const m = state.mastery[id];
          const tier = m ? getMasteryTier(m.correct, m.total) : "none";
          const colors = TIER_COLORS[tier];

          return (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              className={`
                flex flex-col items-center justify-center
                p-4 rounded-2xl border-2 transition-all
                ${colors.bg} ${colors.ring} border-current
                hover:scale-105 active:scale-95 touch-manipulation
              `}
            >
              <span className="text-3xl font-bold text-white">{getChar(c, 0)}</span>
              <span className={`text-xs font-medium mt-1 ${colors.text}`}>{c.latin}</span>
              {tier !== "none" && (
                <span className={`text-[9px] mt-0.5 ${colors.text} capitalize`}>{tier}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
