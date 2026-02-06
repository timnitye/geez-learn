"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useGame } from "@/context/GameContext";
import { useSound } from "@/hooks/useSound";
import {
  CONSONANT_MAP,
  getChar,
  getTranslit,
  generateDistractors,
} from "@/data/geez";
import CharacterCard from "./CharacterCard";
import StatsBar from "./StatsBar";

const ROUND_TIME = 60; // seconds per timed session
const OPTIONS_COUNT = 4;

export default function TimedChallenge() {
  const { state, dispatch } = useGame();
  const sound = useSound();
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [phase, setPhase] = useState("ready"); // "ready" | "playing" | "done"
  const [question, setQuestion] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const timerRef = useRef(null);

  const pool = useMemo(
    () => state.unlockedIds.map((id) => CONSONANT_MAP.get(id)).filter(Boolean),
    [state.unlockedIds]
  );

  const nextQuestion = useCallback(() => {
    const consonant = pool[Math.floor(Math.random() * pool.length)];
    const targetOrder = Math.floor(Math.random() * 7);
    const distractors = generateDistractors(consonant, targetOrder, pool, OPTIONS_COUNT - 1);
    const options = [
      { consonant, orderIndex: targetOrder },
      ...distractors,
    ].sort(() => Math.random() - 0.5);
    setQuestion({ consonant, targetOrder, options });
    setRevealed(false);
  }, [pool]);

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setPhase("done");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase]);

  const handleStart = () => {
    setPhase("playing");
    setTimeLeft(ROUND_TIME);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    nextQuestion();
  };

  const handleSelect = useCallback(
    (opt) => {
      if (revealed || phase !== "playing") return;
      setRevealed(true);

      const isCorrect =
        opt.consonant.id === question.consonant.id &&
        opt.orderIndex === question.targetOrder;

      if (isCorrect) {
        sound.correct();
        const comboBonus = Math.min(combo, 5);
        const points = 10 + comboBonus * 2;
        setScore((s) => s + points);
        setCombo((c) => {
          const next = c + 1;
          setBestCombo((b) => Math.max(b, next));
          return next;
        });
        dispatch({ type: "ANSWER_CORRECT", payload: { consonantId: question.consonant.id } });
      } else {
        sound.wrong();
        setCombo(0);
        dispatch({ type: "ANSWER_WRONG", payload: { consonantId: question.consonant.id } });
      }

      setTimeout(() => nextQuestion(), isCorrect ? 400 : 800);
    },
    [revealed, phase, question, combo, sound, dispatch, nextQuestion]
  );

  const getOptionState = (opt) => {
    if (!revealed) return "idle";
    const isCorrectOpt =
      opt.consonant.id === question.consonant.id &&
      opt.orderIndex === question.targetOrder;
    if (isCorrectOpt) return "correct";
    return "disabled";
  };

  const handleHome = () => dispatch({ type: "NAVIGATE", payload: { screen: "home" } });

  // Ready screen
  if (phase === "ready") {
    return (
      <div className="flex flex-col gap-4 min-h-[80vh]">
        <StatsBar />
        <button onClick={handleHome} className="self-start text-sm text-slate-400 hover:text-white transition-colors touch-manipulation">
          ← Back
        </button>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-5 animate-fade-in">
            <div className="text-6xl">⚡</div>
            <h2 className="text-2xl font-bold text-white">Timed Challenge</h2>
            <p className="text-slate-400 text-center max-w-xs">
              Answer as many as you can in {ROUND_TIME} seconds.
              Build combos for bonus points!
            </p>
            <button
              onClick={handleStart}
              className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-2xl text-lg transition-all active:scale-95 touch-manipulation"
            >
              Go!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Done screen
  if (phase === "done") {
    return (
      <div className="flex flex-col gap-4 min-h-[80vh]">
        <StatsBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-5 animate-fade-in">
            <div className="text-6xl">{score >= 100 ? "🏆" : score >= 60 ? "🔥" : "💪"}</div>
            <h2 className="text-2xl font-bold text-white">Time&apos;s Up!</h2>
            <div className="text-5xl font-bold text-orange-400">{score}</div>
            <p className="text-slate-400">points</p>
            <p className="text-sm text-yellow-400">Best combo: {bestCombo}x</p>
            <div className="flex gap-3">
              <button onClick={handleStart} className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-2xl active:scale-95 touch-manipulation">
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

  // Playing
  if (!question) return null;

  const timerPct = (timeLeft / ROUND_TIME) * 100;
  const timerColor = timeLeft <= 10 ? "bg-red-500" : timeLeft <= 20 ? "bg-orange-500" : "bg-emerald-500";

  return (
    <div className="flex flex-col gap-4 min-h-[80vh]">
      {/* Timer bar */}
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${timerColor} rounded-full transition-all duration-1000 ease-linear`}
          style={{ width: `${timerPct}%` }}
        />
      </div>

      {/* Score + combo */}
      <div className="flex justify-between items-center px-1">
        <div className="text-white font-bold text-lg">{score} pts</div>
        <div className="text-sm font-medium">
          <span className={`${timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-slate-400"}`}>
            {timeLeft}s
          </span>
        </div>
        {combo >= 2 && (
          <div className="text-yellow-400 font-bold animate-pop">
            {combo}x combo!
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5" key={`${question.consonant.id}-${question.targetOrder}-${score}`}>
          {/* Prompt */}
          <div className="text-center animate-fade-in">
            <p className="text-slate-400 text-sm mb-1">Find</p>
            <div className="text-3xl font-bold text-white">
              &quot;{getTranslit(question.consonant, question.targetOrder)}&quot;
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {question.options.map((opt) => (
              <CharacterCard
                key={`${opt.consonant.id}-${opt.orderIndex}`}
                char={getChar(opt.consonant, opt.orderIndex)}
                size="xl"
                state={getOptionState(opt)}
                onClick={() => handleSelect(opt)}
                className="w-full"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
