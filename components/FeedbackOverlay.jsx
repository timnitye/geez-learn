"use client";

import { useEffect, useState } from "react";

// Floating feedback overlay — shows +XP, correct/wrong indicator.
// Auto-dismisses after a short delay.
export default function FeedbackOverlay({ type, xpGain = 0, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, type === "correct" ? 800 : 1200);
    return () => clearTimeout(timer);
  }, [type, onDone]);

  if (!visible) return null;

  if (type === "correct") {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="animate-float-up text-center">
          <div className="text-5xl mb-1">✓</div>
          {xpGain > 0 && (
            <div className="text-lg font-bold text-emerald-400">+{xpGain} XP</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
      <div className="animate-shake text-center">
        <div className="text-4xl text-red-400 opacity-80">✗</div>
      </div>
    </div>
  );
}
