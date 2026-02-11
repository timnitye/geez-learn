"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { useAudio } from "@/hooks/useAudio";
import { useSound } from "@/hooks/useSound";
import {
  CONSONANT_MAP,
  getChar,
  getAudioPath,
  getRoman,
  getFamilyAudioPaths,
  generateDistractors,
} from "@/data/geez";
import CharacterCard from "./CharacterCard";

const ROUNDS_PER_SESSION = 10;

export default function HearTap() {
  const { state, dispatch, shouldShowRoman } = useGame();
  const audio = useAudio();
  const sound = useSound();
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  // Build pool of unlocked consonants
  const pool = useMemo(
    () => state.unlockedIds.map((id) => CONSONANT_MAP.get(id)).filter(Boolean),
    [state.unlockedIds]
  );

  // Pre-generate all rounds
  const rounds = useMemo(() => {
    return Array.from({ length: ROUNDS_PER_SESSION }, () => {
      const consonant = pool[Math.floor(Math.random() * pool.length)];
      const targetOrder = Math.floor(Math.random() * 7);
      const distractors = generateDistractors(consonant, targetOrder, pool, 3);
      const options = [
        { consonant, orderIndex: targetOrder },
        ...distractors,
      ].sort(() => Math.random() - 0.5);
      return { consonant, targetOrder, options };
    });
  }, [pool]);

  const current = rounds[roundIndex];

  // Preload audio for current and next rounds
  useEffect(() => {
    if (!current) return;
    const paths = [
      getAudioPath(current.consonant, current.targetOrder),
      ...current.options.map((o) => getAudioPath(o.consonant, o.orderIndex)),
    ];
    // Also preload next round if exists
    if (rounds[roundIndex + 1]) {
      const next = rounds[roundIndex + 1];
      paths.push(getAudioPath(next.consonant, next.targetOrder));
    }
    audio.preloadMany(paths).then(() => setAudioReady(true));
  }, [roundIndex, current, rounds, audio]);

  // Auto-play audio when round starts
  useEffect(() => {
    if (!current || !audioReady || revealed) return;
    const timer = setTimeout(() => {
      audio.play(getAudioPath(current.consonant, current.targetOrder));
    }, 300);
    return () => clearTimeout(timer);
  }, [roundIndex, audioReady, current, audio, revealed]);

  const handleReplay = useCallback(() => {
    if (current) {
      audio.play(getAudioPath(current.consonant, current.targetOrder));
    }
  }, [current, audio]);

  const handleSelect = useCallback(
    (opt) => {
      if (revealed) return;
      setSelected(opt);
      setRevealed(true);

      const isCorrect =
        opt.consonant.id === current.consonant.id &&
        opt.orderIndex === current.targetOrder;

      if (isCorrect) {
        sound.correct();
        setSessionCorrect((c) => c + 1);
        dispatch({ type: "ANSWER_CORRECT", payload: { consonantId: current.consonant.id } });
      } else {
        sound.wrong();
        dispatch({ type: "ANSWER_WRONG", payload: { consonantId: current.consonant.id } });
        // Play correct pronunciation after wrong answer
        setTimeout(() => {
          audio.play(getAudioPath(current.consonant, current.targetOrder));
        }, 500);
      }

      setTimeout(() => {
        if (roundIndex + 1 >= ROUNDS_PER_SESSION) {
          setDone(true);
        } else {
          setRoundIndex((i) => i + 1);
          setSelected(null);
          setRevealed(false);
          setAudioReady(false);
        }
      }, isCorrect ? 700 : 1500);
    },
    [revealed, current, roundIndex, sound, audio, dispatch]
  );

  const getOptionState = (opt) => {
    if (!revealed) return "idle";
    const isCorrectOpt =
      opt.consonant.id === current.consonant.id &&
      opt.orderIndex === current.targetOrder;
    const isSelected =
      opt.consonant.id === selected?.consonant.id &&
      opt.orderIndex === selected?.orderIndex;

    if (isCorrectOpt) return "correct";
    if (isSelected) return "wrong";
    return "disabled";
  };

  const handleHome = () => dispatch({ type: "NAVIGATE", payload: { screen: "home" } });

  const handleRetry = () => {
    setRoundIndex(0);
    setSessionCorrect(0);
    setSelected(null);
    setRevealed(false);
    setDone(false);
    setAudioReady(false);
  };

  // Done screen
  if (done) {
    const pct = Math.round((sessionCorrect / ROUNDS_PER_SESSION) * 100);
    return (
      <div className="flex flex-col flex-1">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-5 animate-fade-in">
            <div className="text-7xl">{pct >= 80 ? "👂" : pct >= 50 ? "💪" : "📚"}</div>
            <h2 className="text-2xl font-bold text-white">
              {pct >= 80 ? "Great Listening!" : pct >= 50 ? "Getting There!" : "Keep Practicing!"}
            </h2>
            <div className="text-5xl font-bold text-teal-400 tabular-nums">{pct}%</div>
            <p className="text-slate-400">{sessionCorrect}/{ROUNDS_PER_SESSION} correct</p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleRetry}
                className="game-btn px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-500
                         text-white font-bold rounded-2xl active:scale-95 touch-manipulation
                         shadow-lg shadow-teal-600/30"
              >
                Play Again
              </button>
              <button
                onClick={handleHome}
                className="game-btn px-8 py-4 bg-slate-700 hover:bg-slate-600
                         text-white font-bold rounded-2xl active:scale-95 touch-manipulation"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const showRoman = shouldShowRoman(current.consonant.id);

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 flex items-center justify-center py-4">
        <div className="flex flex-col items-center gap-6 animate-fade-in w-full" key={roundIndex}>
          {/* Progress bar */}
          <div className="w-full max-w-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-500 font-medium tabular-nums">
                {roundIndex + 1} of {ROUNDS_PER_SESSION}
              </span>
              <div className="flex gap-1.5">
                {Array.from({ length: ROUNDS_PER_SESSION }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i < roundIndex ? "bg-teal-500" : i === roundIndex ? "bg-teal-400 animate-pulse" : "bg-slate-700"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-300"
                style={{ width: `${((roundIndex + 1) / ROUNDS_PER_SESSION) * 100}%` }}
              />
            </div>
          </div>

          {/* Audio prompt - large central button */}
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-4">Listen and tap the matching character</p>
            <button
              onClick={handleReplay}
              disabled={!audioReady}
              className="game-btn w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-teal-600
                       hover:from-teal-400 hover:to-teal-500
                       active:scale-95 transition-all flex items-center justify-center text-5xl
                       shadow-xl shadow-teal-600/40 touch-manipulation
                       disabled:opacity-50 disabled:cursor-wait
                       animate-pulse-ring"
              aria-label="Play audio again"
            >
              🔊
            </button>
            <p className="text-xs text-slate-500 mt-3">Tap to replay</p>
          </div>

          {/* Answer options - 2x2 grid */}
          <div
            className="grid grid-cols-2 gap-4 w-full max-w-xs"
            role="group"
            aria-label="Answer options"
          >
            {current.options.map((opt) => (
              <CharacterCard
                key={`${opt.consonant.id}-${opt.orderIndex}`}
                char={getChar(opt.consonant, opt.orderIndex)}
                romanization={getRoman(opt.consonant, opt.orderIndex)}
                audioPath={getAudioPath(opt.consonant, opt.orderIndex)}
                showRoman={revealed && showRoman}
                size="xl"
                state={getOptionState(opt)}
                playAudioOnTap={false}
                onClick={() => handleSelect(opt)}
                className="w-full aspect-square"
              />
            ))}
          </div>

          {/* Feedback */}
          {revealed && (
            <div
              className="text-center animate-fade-in bg-slate-800/30 rounded-xl px-4 py-3"
              role="status"
              aria-live="polite"
            >
              <p className="text-sm text-slate-400">
                Correct: <span className="font-bold text-teal-400 text-lg">
                  {getChar(current.consonant, current.targetOrder)}
                </span>
                {showRoman && (
                  <span className="text-slate-300 ml-2">
                    ({getRoman(current.consonant, current.targetOrder)})
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
