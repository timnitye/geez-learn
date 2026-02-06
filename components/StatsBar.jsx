"use client";

import { useGame } from "@/context/GameContext";
import { getLevel, getXpInLevel, XP_PER_LEVEL } from "@/data/geez";

// Persistent stats bar showing XP, level, and streak
export default function StatsBar() {
  const { state } = useGame();
  const level = getLevel(state.xp);
  const xpInLevel = getXpInLevel(state.xp);
  const pct = (xpInLevel / XP_PER_LEVEL) * 100;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-700/50">
      {/* Level badge */}
      <div className="flex items-center gap-1.5">
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
          {level}
        </div>
        {/* XP progress ring around level */}
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-medium leading-none">LVL</span>
          <span className="text-xs text-indigo-300 font-bold leading-none">{state.xp} XP</span>
        </div>
      </div>

      {/* XP bar */}
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Streak */}
      <div className="flex items-center gap-1">
        <span className="text-lg" role="img" aria-label="streak">
          {state.streak >= 5 ? "🔥" : state.streak >= 2 ? "⚡" : "✦"}
        </span>
        <span className={`text-sm font-bold ${state.streak >= 5 ? "text-orange-400" : state.streak >= 2 ? "text-yellow-400" : "text-slate-400"}`}>
          {state.streak}
        </span>
      </div>
    </div>
  );
}
