"use client";

import { useGame } from "@/context/GameContext";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "🏠", activeIcon: "🏠" },
  { id: "play", label: "Play", icon: "🎮", activeIcon: "🎮", isAction: true },
  { id: "mastery", label: "Progress", icon: "📊", activeIcon: "📊" },
  { id: "settings", label: "Settings", icon: "⚙️", activeIcon: "⚙️" },
];

// Screens that should highlight "Play" in the nav
const PLAY_SCREENS = ["family", "vowel", "timed", "heartap", "picker_family"];

export default function BottomNav() {
  const { state, dispatch } = useGame();
  const currentScreen = state.screen;

  const getActiveId = () => {
    if (currentScreen === "home") return "home";
    if (currentScreen === "mastery") return "mastery";
    if (currentScreen === "settings") return "settings";
    if (PLAY_SCREENS.includes(currentScreen)) return "play";
    return "home";
  };

  const activeId = getActiveId();

  const handleNav = (id) => {
    if (id === "play") {
      // Play button goes to home where game modes are listed
      dispatch({ type: "NAVIGATE", payload: { screen: "home" } });
    } else {
      dispatch({ type: "NAVIGATE", payload: { screen: id } });
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-slate-700/50"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-lg mx-auto px-2 pb-safe">
        <div className="flex items-stretch justify-around h-16">
          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            const isPlayButton = item.isAction;

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`
                  flex flex-col items-center justify-center flex-1 px-2 py-2
                  transition-all touch-manipulation touch-target
                  ${isPlayButton
                    ? "relative -mt-5"
                    : isActive
                    ? "text-indigo-400"
                    : "text-slate-400 hover:text-slate-200 active:text-white"
                  }
                `}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                {isPlayButton ? (
                  // Raised play button
                  <div
                    className={`
                      w-14 h-14 rounded-full flex items-center justify-center
                      bg-gradient-to-br from-indigo-500 to-purple-600
                      shadow-lg shadow-indigo-500/30
                      transition-transform active:scale-95
                      ${isActive ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900" : ""}
                    `}
                  >
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                ) : (
                  <>
                    <span className={`text-xl mb-0.5 ${isActive ? "scale-110" : ""} transition-transform`}>
                      {isActive ? item.activeIcon : item.icon}
                    </span>
                    <span className={`text-[10px] font-medium ${isActive ? "text-indigo-400" : ""}`}>
                      {item.label}
                    </span>
                  </>
                )}

                {/* Active indicator dot */}
                {isActive && !isPlayButton && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
