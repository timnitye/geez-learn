"use client";

import { useGame } from "@/context/GameContext";
import HomeScreen from "./HomeScreen";
import FamilyRecognition from "./FamilyRecognition";
import VowelModifier from "./VowelModifier";
import TimedChallenge from "./TimedChallenge";
import MasteryMap from "./MasteryMap";
import ConsonantPicker from "./ConsonantPicker";

// Top-level router: renders the correct screen based on game state.
// No client-side router needed — state.screen drives everything.
export default function GameShell() {
  const { state } = useGame();

  switch (state.screen) {
    case "home":
      return <HomeScreen />;
    case "family":
      return <FamilyRecognition />;
    case "vowel":
      return <VowelModifier />;
    case "timed":
      return <TimedChallenge />;
    case "mastery":
      return <MasteryMap />;
    case "picker_family":
      return <ConsonantPicker targetScreen="family" />;
    default:
      return <HomeScreen />;
  }
}
