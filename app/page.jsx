"use client";

import { useEffect } from "react";
import { GameProvider } from "@/context/GameContext";
import GameShell from "@/components/GameShell";

export default function Home() {
  // Register service worker for offline support
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js");
    }
  }, []);

  return (
    <GameProvider>
      <div className="max-w-lg mx-auto px-4 py-6">
        <GameShell />
      </div>
    </GameProvider>
  );
}
