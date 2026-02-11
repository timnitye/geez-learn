"use client";

import { useGame } from "@/context/GameContext";

export default function Settings() {
  const { state, dispatch } = useGame();

  const setSetting = (key, value) => {
    dispatch({ type: "SET_SETTING", payload: { key, value } });
  };

  return (
    <div className="flex flex-col gap-5 flex-1">

      {/* Romanization Setting */}
      <section className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-4">
        <h2 className="text-white font-semibold mb-1">Romanization</h2>
        <p className="text-sm text-slate-400 mb-4">
          Show Latin transliterations below characters
        </p>
        <div className="flex flex-col gap-2" role="radiogroup" aria-label="Romanization display preference">
          {[
            { value: "always", label: "Always show", desc: "Display for all characters" },
            { value: "early", label: "Show until mastered", desc: "Hide after gold mastery" },
            { value: "never", label: "Never show", desc: "Learn shapes without scaffolding" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSetting("showRomanization", opt.value)}
              role="radio"
              aria-checked={state.settings.showRomanization === opt.value}
              className={`
                game-btn flex items-center justify-between p-4 rounded-xl border transition-all
                touch-manipulation touch-target
                ${state.settings.showRomanization === opt.value
                  ? "bg-indigo-600/30 border-indigo-500"
                  : "bg-slate-900/30 border-slate-700 hover:border-slate-600 active:bg-slate-800/50"
                }
              `}
            >
              <div className="text-left">
                <div className="text-white font-medium">{opt.label}</div>
                <div className="text-xs text-slate-400">{opt.desc}</div>
              </div>
              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                ${state.settings.showRomanization === opt.value
                  ? "border-indigo-400 bg-indigo-500"
                  : "border-slate-600"
                }
              `}>
                {state.settings.showRomanization === opt.value && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Audio Setting */}
      <section className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold">Sound Effects</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Audio feedback for correct/wrong answers
            </p>
          </div>
          <button
            onClick={() => setSetting("audioEnabled", !state.settings.audioEnabled)}
            role="switch"
            aria-checked={state.settings.audioEnabled}
            aria-label="Toggle sound effects"
            className={`
              relative w-14 h-8 rounded-full transition-colors touch-manipulation
              ${state.settings.audioEnabled ? "bg-emerald-500" : "bg-slate-600"}
            `}
          >
            <div className={`
              absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all
              ${state.settings.audioEnabled ? "left-7" : "left-1"}
            `} />
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-4">
        <h2 className="text-white font-semibold mb-2">About ፊደል</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Learn the Geʽez alphabet used in Tigrinya, Amharic, and other Ethiopian and Eritrean languages.
          The alphabet has <span className="text-white font-medium">26 consonants</span>, each with <span className="text-white font-medium">7 vowel forms</span> — 182 characters total!
        </p>
        <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-500 flex items-center gap-2">
          <span className="text-base">💾</span>
          Progress is saved locally on your device
        </div>
      </section>

      {/* Reset Progress - pushed to bottom */}
      <div className="mt-auto pt-4">
        <button
          onClick={() => {
            if (confirm("Reset all progress? This cannot be undone.")) {
              localStorage.removeItem("geez-learn-progress");
              window.location.reload();
            }
          }}
          className="game-btn w-full p-4 rounded-xl border border-red-900/50 bg-red-900/20
                   text-red-400 hover:bg-red-900/30 active:bg-red-900/40
                   transition-all touch-manipulation touch-target"
        >
          Reset All Progress
        </button>
      </div>
    </div>
  );
}
