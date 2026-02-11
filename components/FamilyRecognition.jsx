"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useGame } from "@/context/GameContext";
import { useSound } from "@/hooks/useSound";
import { useAudio } from "@/hooks/useAudio";
import {
  CONSONANT_MAP,
  CONSONANTS,
  VOWEL_ORDERS,
  getChar,
  getTranslit,
  getFamily,
  generateDistractors,
  getAudioPath,
  getFamilyAudioPaths,
  getMasteryTier,
} from "@/data/geez";
import CharacterCard from "./CharacterCard";
import StatsBar from "./StatsBar";
import FeedbackOverlay from "./FeedbackOverlay";

const ROUNDS_PER_SESSION = 10;

// ── Intro Phase: "Meet the Family" ────────────────────────────────
function FamilyIntro({ consonant, onStart, audio }) {
  const family = useMemo(() => getFamily(consonant), [consonant]);

  // Preload all family audio when intro mounts
  useEffect(() => {
    const paths = getFamilyAudioPaths(consonant.id);
    audio.preloadMany(paths);
  }, [consonant.id, audio]);

  // Play audio for a character when tapped
  const handleCharTap = useCallback((orderIndex) => {
    audio.play(getAudioPath(consonant.id, orderIndex));
  }, [consonant.id, audio]);

  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-white">
        Meet the <span className="text-indigo-400">{getChar(consonant, 0)}</span> family
      </h2>
      <p className="text-slate-300 text-center">
        The consonant <span className="font-bold text-indigo-300">{consonant.latin}</span> ({consonant.name}) has 7 vowel forms
      </p>

      <div className="grid grid-cols-7 gap-2">
        {family.map((f) => (
          <div key={f.order} className="flex flex-col items-center gap-1">
            <CharacterCard
              char={f.char}
              transliteration={f.transliteration}
              size="md"
              state="glow"
              onClick={() => handleCharTap(f.order)}
              showTranslit
            />
            <span className="text-[10px] text-slate-500">{f.orderName}</span>
          </div>
        ))}
      </div>

      <p className="text-sm text-slate-400 text-center max-w-xs">
        Tap each character to hear its sound.
        Look for the pattern!
      </p>

      <button
        onClick={onStart}
        className="mt-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-lg transition-all active:scale-95 touch-manipulation"
      >
        Start Practice
      </button>
    </div>
  );
}

// ── Quiz Phase ─────────────────────────────────────────────────────
function QuizRound({
  consonant,
  targetOrder,
  options,
  onAnswer,
  onReplay,
  roundNum,
  totalRounds,
  autoPlayAudio,
}) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const sound = useSound();
  const hasPlayedRef = useRef(false);
  const targetChar = getChar(consonant, targetOrder);
  const targetTranslit = getTranslit(consonant, targetOrder);

  // Auto-play audio when question appears (after first round)
  useEffect(() => {
    if (!hasPlayedRef.current && autoPlayAudio) {
      hasPlayedRef.current = true;
      // Small delay ensures UI is ready
      const timer = setTimeout(() => {
        autoPlayAudio();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [autoPlayAudio]);

  const handleSelect = useCallback(
    (opt) => {
      if (revealed) return;
      setSelected(opt);
      setRevealed(true);

      const isCorrect =
        opt.consonant.id === consonant.id && opt.orderIndex === targetOrder;

      if (isCorrect) {
        sound.correct();
      } else {
        sound.wrong();
      }

      // Delay before advancing so feedback is visible
      setTimeout(() => onAnswer(isCorrect), isCorrect ? 600 : 1000);
    },
    [revealed, consonant, targetOrder, sound, onAnswer]
  );

  const getOptionState = (opt) => {
    if (!revealed) return "idle";
    const isThis =
      opt.consonant.id === selected?.consonant.id &&
      opt.orderIndex === selected?.orderIndex;
    const isCorrectOption =
      opt.consonant.id === consonant.id && opt.orderIndex === targetOrder;

    if (isCorrectOption) return "correct";
    if (isThis) return "wrong";
    return "disabled";
  };

  return (
    <div className="flex flex-col items-center gap-5 animate-fade-in">
      {/* Round indicator */}
      <div className="flex items-center gap-2">
        <div className="text-xs text-slate-500 font-medium">
          {roundNum}/{totalRounds}
        </div>
        <div className="flex gap-1">
          {Array.from({ length: totalRounds }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < roundNum ? "bg-indigo-500" : "bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Prompt */}
      <div className="text-center">
        <p className="text-slate-400 text-sm mb-2">Which character is</p>
        <div className="flex items-center justify-center gap-2">
          <div className="text-3xl font-bold text-white">
            &quot;{targetTranslit}&quot;
          </div>
          <button
            onClick={onReplay}
            className="w-10 h-10 flex items-center justify-center rounded-full
                     bg-slate-700 hover:bg-slate-600 active:scale-95
                     transition-all touch-manipulation"
            aria-label="Replay pronunciation"
            type="button"
          >
            <span className="text-lg">🔊</span>
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          ({consonant.latin} + {VOWEL_ORDERS[targetOrder].vowel} vowel)
        </p>
      </div>

      {/* Answer options — 2×2 grid for large tap targets */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {options.map((opt) => (
          <CharacterCard
            key={`${opt.consonant.id}-${opt.orderIndex}`}
            char={getChar(opt.consonant, opt.orderIndex)}
            transliteration={revealed ? getTranslit(opt.consonant, opt.orderIndex) : undefined}
            showTranslit={revealed}
            size="xl"
            state={getOptionState(opt)}
            onClick={() => handleSelect(opt)}
            className="w-full"
          />
        ))}
      </div>
    </div>
  );
}

// ── Results Phase ──────────────────────────────────────────────────
function SessionResults({ consonant, correct, total, onHome, onRetry }) {
  const pct = Math.round((correct / total) * 100);
  const tier = getMasteryTier(correct, total);
  const sound = useSound();

  useEffect(() => {
    if (pct >= 70) sound.levelUp();
  }, [pct, sound]);

  return (
    <div className="flex flex-col items-center gap-5 animate-fade-in">
      <div className="text-6xl">
        {pct >= 90 ? "🌟" : pct >= 70 ? "🎉" : pct >= 40 ? "💪" : "📚"}
      </div>

      <h2 className="text-2xl font-bold text-white">
        {pct >= 90 ? "Amazing!" : pct >= 70 ? "Great Job!" : pct >= 40 ? "Good Start!" : "Keep Practicing!"}
      </h2>

      <div className="text-center">
        <div className="text-4xl font-bold text-indigo-400">{pct}%</div>
        <p className="text-slate-400 text-sm mt-1">
          {correct} of {total} correct
        </p>
      </div>

      {/* Mastery tier */}
      <div className={`px-4 py-2 rounded-full border ${
        tier === "gold" ? "border-yellow-400 text-yellow-300" :
        tier === "silver" ? "border-slate-300 text-slate-200" :
        tier === "bronze" ? "border-amber-500 text-amber-300" :
        "border-slate-600 text-slate-400"
      }`}>
        {tier === "none" ? "Keep going!" : `${tier.charAt(0).toUpperCase() + tier.slice(1)} Mastery`}
      </div>

      <div className="flex gap-3 mt-2">
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all active:scale-95 touch-manipulation"
        >
          Try Again
        </button>
        <button
          onClick={onHome}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl transition-all active:scale-95 touch-manipulation"
        >
          Back
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────
export default function FamilyRecognition() {
  const { state, dispatch } = useGame();
  const consonant = CONSONANT_MAP.get(state.activeConsonantId);
  const [phase, setPhase] = useState("intro"); // "intro" | "quiz" | "results"
  const [roundIndex, setRoundIndex] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const audio = useAudio();

  // Build the pool of unlocked consonants for distractors
  const pool = useMemo(
    () => state.unlockedIds.map((id) => CONSONANT_MAP.get(id)).filter(Boolean),
    [state.unlockedIds]
  );

  // Pre-generate all rounds for the session
  const rounds = useMemo(() => {
    if (!consonant) return [];
    return Array.from({ length: ROUNDS_PER_SESSION }, () => {
      const targetOrder = Math.floor(Math.random() * 7);
      const distractors = generateDistractors(consonant, targetOrder, pool, 3);
      const options = [
        { consonant, orderIndex: targetOrder },
        ...distractors,
      ].sort(() => Math.random() - 0.5);
      return { targetOrder, options };
    });
  }, [consonant, pool]);

  if (!consonant) return null;

  // Start quiz and play first question's audio immediately (user gesture satisfies autoplay)
  const handleStartQuiz = () => {
    setPhase("quiz");
    if (rounds[0]) {
      audio.play(getAudioPath(consonant.id, rounds[0].targetOrder));
    }
  };

  // Replay current question's audio
  const handleReplay = useCallback(() => {
    if (rounds[roundIndex]) {
      audio.play(getAudioPath(consonant.id, rounds[roundIndex].targetOrder));
    }
  }, [audio, consonant.id, rounds, roundIndex]);

  // Auto-play callback for subsequent rounds
  const handleAutoPlay = useCallback(() => {
    if (rounds[roundIndex]) {
      audio.play(getAudioPath(consonant.id, rounds[roundIndex].targetOrder));
    }
  }, [audio, consonant.id, rounds, roundIndex]);

  const handleAnswer = (isCorrect) => {
    dispatch({
      type: isCorrect ? "ANSWER_CORRECT" : "ANSWER_WRONG",
      payload: { consonantId: consonant.id },
    });
    if (isCorrect) setSessionCorrect((c) => c + 1);

    if (roundIndex + 1 >= ROUNDS_PER_SESSION) {
      setPhase("results");
    } else {
      setRoundIndex((i) => i + 1);
    }
  };

  const handleRetry = () => {
    setPhase("intro");
    setRoundIndex(0);
    setSessionCorrect(0);
  };

  const handleHome = () => {
    dispatch({ type: "NAVIGATE", payload: { screen: "home" } });
  };

  return (
    <div className="flex flex-col gap-4 min-h-[80vh]">
      <StatsBar />

      {/* Back button */}
      <button
        onClick={handleHome}
        className="self-start text-sm text-slate-400 hover:text-white transition-colors touch-manipulation"
        aria-label="Back to home"
      >
        ← Back
      </button>

      <div className="flex-1 flex items-center justify-center relative">
        {phase === "intro" && (
          <FamilyIntro consonant={consonant} onStart={handleStartQuiz} audio={audio} />
        )}

        {phase === "quiz" && rounds[roundIndex] && (
          <QuizRound
            key={roundIndex}
            consonant={consonant}
            targetOrder={rounds[roundIndex].targetOrder}
            options={rounds[roundIndex].options}
            onAnswer={handleAnswer}
            onReplay={handleReplay}
            roundNum={roundIndex + 1}
            totalRounds={ROUNDS_PER_SESSION}
            autoPlayAudio={roundIndex > 0 ? handleAutoPlay : null}
          />
        )}

        {phase === "results" && (
          <SessionResults
            consonant={consonant}
            correct={sessionCorrect}
            total={ROUNDS_PER_SESSION}
            onHome={handleHome}
            onRetry={handleRetry}
          />
        )}
      </div>
    </div>
  );
}
