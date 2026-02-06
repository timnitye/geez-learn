"use client";

import { useState } from "react";

// Displays a single Ge'ez character with optional transliteration.
// Handles tap feedback and different visual states.
export default function CharacterCard({
  char,
  transliteration,
  size = "lg",
  state = "idle",       // "idle" | "correct" | "wrong" | "disabled" | "glow"
  showTranslit = false,
  onClick,
  className = "",
}) {
  const [tapped, setTapped] = useState(false);

  const sizeClasses = {
    sm: "w-14 h-14 text-2xl",
    md: "w-18 h-18 text-3xl",
    lg: "w-22 h-22 text-4xl",
    xl: "w-28 h-28 text-5xl",
  };

  const stateClasses = {
    idle: "bg-slate-800/80 border-slate-600 hover:border-indigo-400 hover:bg-slate-700/80 active:scale-95",
    correct: "bg-emerald-600/40 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)] animate-pop",
    wrong: "bg-red-600/30 border-red-400 animate-shake",
    disabled: "bg-slate-800/40 border-slate-700 opacity-50 cursor-default",
    glow: "bg-indigo-600/30 border-indigo-400 shadow-[0_0_24px_rgba(129,140,248,0.5)]",
  };

  const handleClick = () => {
    if (state === "disabled" || !onClick) return;
    setTapped(true);
    onClick();
    setTimeout(() => setTapped(false), 200);
  };

  return (
    <button
      onClick={handleClick}
      disabled={state === "disabled"}
      className={`
        relative flex flex-col items-center justify-center
        ${sizeClasses[size]} rounded-2xl border-2
        font-bold transition-all duration-200
        select-none touch-manipulation
        ${stateClasses[state]}
        ${tapped ? "scale-90" : ""}
        ${onClick ? "cursor-pointer" : "cursor-default"}
        ${className}
      `}
      aria-label={transliteration || char}
    >
      <span className="text-white leading-none" style={{ fontFamily: "system-ui, sans-serif" }}>
        {char}
      </span>
      {showTranslit && transliteration && (
        <span className="text-[10px] text-slate-300 mt-0.5 font-medium">
          {transliteration}
        </span>
      )}
    </button>
  );
}
