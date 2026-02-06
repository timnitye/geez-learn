"use client";

import { useState, useCallback, useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { useSound } from "@/hooks/useSound";
import {
  CONSONANT_MAP,
  VOWEL_ORDERS,
  getChar,
  getTranslit,
} from "@/data/geez";
import CharacterCard from "./CharacterCard";
import StatsBar from "./StatsBar";

const ROUNDS_PER_SESSION = 10;

// Player sees a base consonant, selects the vowel modifier,
// and the resulting character animates into view.
export default function VowelModifier() {
  const { state, dispatch } = useGame();
  const sound = useSound();
  const [roundIndex, setRoundIndex] = useState(0);
  const [selectedVowel, setSelectedVowel] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [done, setDone] = useState(false);

  // Pick random consonants from unlocked set for each round
  const rounds = useMemo(() => {
    const unlocked = state.unlockedIds.map((id) => CONSONANT_MAP.get(id)).filter(Boolean);
    return Array.from({ length: ROUNDS_PER_SESSION }, () => {
      const consonant = unlocked[Math.floor(Math.random() * unlocked.length)];
      const targetOrder = Math.floor(Math.random() * 7);
      return { consonant, targetOrder };
    });
  }, [state.unlockedIds]);

  const current = rounds[roundIndex];
  if (!current) return null;

  const handleSelectVowel = (orderIndex) => {
    if (revealed) return;
    setSelectedVowel(orderIndex);
    setRevealed(true);

    const isCorrect = orderIndex === current.targetOrder;
    if (isCorrect) {
      sound.correct();
      setSessionCorrect((c) => c + 1);
      dispatch({ type: "ANSWER_CORRECT", payload: { consonantId: current.consonant.id } });
    } else {
      sound.wrong();
      dispatch({ type: "ANSWER_WRONG", payload: { consonantId: current.consonant.id } });
    }

    setTimeout(() => {
      if (roundIndex + 1 >= ROUNDS_PER_SESSION) {
        setDone(true);
      } else {
        setRoundIndex((i) => i + 1);
        setSelectedVowel(null);
        setRevealed(false);
      }
    }, isCorrect ? 700 : 1100);
  };

  const handleHome = () => dispatch({ type: "NAVIGATE", payload: { screen: "home" } });

  const handleRetry = () => {
    setRoundIndex(0);
    setSessionCorrect(0);
    setSelectedVowel(null);
    setRevealed(false);
    setDone(false);
  };

  if (done) {
    const pct = Math.round((sessionCorrect / ROUNDS_PER_SESSION) * 100);
    return (
      <div className="flex flex-col gap-4 min-h-[80vh]">
        <StatsBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-5 animate-fade-in">
            <div className="text-6xl">{pct >= 80 ? "🌟" : pct >= 50 ? "💪" : "📚"}</div>
            <h2 className="text-2xl font-bold text-white">
              {pct >= 80 ? "Excellent!" : pct >= 50 ? "Nice Work!" : "Keep Practicing!"}
            </h2>
            <div className="text-4xl font-bold text-purple-400">{pct}%</div>
            <p className="text-slate-400">{sessionCorrect}/{ROUNDS_PER_SESSION} correct</p>
            <div className="flex gap-3">
              <button onClick={handleRetry} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl active:scale-95 touch-manipulation">
                Again
              </button>
              <button onClick={handleHome} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl active:scale-95 touch-manipulation">
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const resultChar = revealed
    ? getChar(current.consonant, selectedVowel)
    : null;
  const correctChar = getChar(current.consonant, current.targetOrder);

  return (
    <div className="flex flex-col gap-4 min-h-[80vh]">
      <StatsBar />
      <button onClick={handleHome} className="self-start text-sm text-slate-400 hover:text-white transition-colors touch-manipulation">
        ← Back
      </button>

      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 animate-fade-in" key={roundIndex}>
          {/* Progress dots */}
          <div className="flex gap-1">
            {Array.from({ length: ROUNDS_PER_SESSION }, (_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i < roundIndex ? "bg-purple-500" : i === roundIndex ? "bg-purple-400 animate-pulse" : "bg-slate-700"}`} />
            ))}
          </div>

          {/* Base consonant display */}
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-2">Base consonant</p>
            <div className="text-6xl text-white font-bold mb-1">
              {getChar(current.consonant, 0)}
            </div>
            <p className="text-indigo-300 font-medium">{current.consonant.latin} ({current.consonant.name})</p>
          </div>

          {/* Target vowel prompt */}
          <div className="text-center">
            <p className="text-slate-300">
              Add the <span className="text-purple-400 font-bold text-lg">&quot;{VOWEL_ORDERS[current.targetOrder].vowel}&quot;</span> vowel
            </p>
            <p className="text-xs text-slate-500">
              to make &quot;{getTranslit(current.consonant, current.targetOrder)}&quot;
            </p>
          </div>

          {/* Vowel selector buttons */}
          <div className="grid grid-cols-7 gap-1.5">
            {VOWEL_ORDERS.map((v) => {
              let btnState = "idle";
              if (revealed) {
                if (v.index === current.targetOrder) btnState = "correct";
                else if (v.index === selectedVowel) btnState = "wrong";
                else btnState = "disabled";
              }
              return (
                <button
                  key={v.index}
                  onClick={() => handleSelectVowel(v.index)}
                  disabled={revealed}
                  className={`
                    w-11 h-11 rounded-xl text-sm font-bold transition-all
                    active:scale-90 touch-manipulation
                    ${btnState === "correct" ? "bg-emerald-600 text-white border-2 border-emerald-400" :
                      btnState === "wrong" ? "bg-red-600/60 text-white border-2 border-red-400" :
                      btnState === "disabled" ? "bg-slate-800/40 text-slate-600 border border-slate-700" :
                      "bg-slate-700 text-white border border-slate-500 hover:border-purple-400 hover:bg-slate-600"}
                  `}
                >
                  {v.vowel}
                </button>
              );
            })}
          </div>

          {/* Result character */}
          {revealed && (
            <div className="animate-pop text-center">
              <div className={`text-7xl font-bold ${selectedVowel === current.targetOrder ? "text-emerald-400" : "text-red-400"}`}>
                {resultChar}
              </div>
              {selectedVowel !== current.targetOrder && (
                <div className="mt-2">
                  <p className="text-sm text-slate-400">Correct answer:</p>
                  <div className="text-5xl text-emerald-400 font-bold">{correctChar}</div>
                  <p className="text-sm text-emerald-300">{getTranslit(current.consonant, current.targetOrder)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
