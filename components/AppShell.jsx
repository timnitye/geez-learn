"use client";

import Header from "./Header";
import BottomNav from "./BottomNav";
import { useGame } from "@/context/GameContext";

// Screens where we hide the bottom nav (focused gameplay)
const HIDE_NAV_SCREENS = ["family", "vowel", "timed", "heartap"];

export default function AppShell({ children }) {
  const { state } = useGame();
  const hideNav = HIDE_NAV_SCREENS.includes(state.screen);
  const showBack = state.screen !== "home";

  return (
    <div className="min-h-dvh flex flex-col">
      <Header showBack={showBack} />

      {/* Main content area with padding for fixed header/nav */}
      <main
        className={`
          flex-1 flex flex-col
          pt-[calc(3.5rem+env(safe-area-inset-top,0px))]
          ${hideNav ? "pb-4" : "pb-[calc(5rem+env(safe-area-inset-bottom,0px))]"}
        `}
      >
        <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-4">
          {children}
        </div>
      </main>

      {/* Bottom navigation - hidden during focused gameplay */}
      {!hideNav && <BottomNav />}
    </div>
  );
}
