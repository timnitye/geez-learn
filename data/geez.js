// ===================================================================
// Ge'ez (Ethiopic) Alphabet Data
// An abugida: 26 base consonants × 7 vowel orders = 182 characters.
// Characters are generated from Unicode codepoints — each consonant
// row starts at a base codepoint and the 7 vowel forms are sequential.
// ===================================================================

export const VOWEL_ORDERS = [
  { index: 0, name: "Geʽez", vowel: "ä", label: "1st" },
  { index: 1, name: "Kaʽib", vowel: "u", label: "2nd" },
  { index: 2, name: "Salis", vowel: "i", label: "3rd" },
  { index: 3, name: "Rabiʽ", vowel: "a", label: "4th" },
  { index: 4, name: "Hamis", vowel: "e", label: "5th" },
  { index: 5, name: "Sadis", vowel: "ə", label: "6th" },
  { index: 6, name: "Sabiʽ", vowel: "o", label: "7th" },
];

export const CONSONANTS = [
  { id: "h",   name: "hoy",    base: 0x1200, latin: "h" },
  { id: "l",   name: "lawe",   base: 0x1208, latin: "l" },
  { id: "hh",  name: "ḥawt",   base: 0x1210, latin: "ḥ" },
  { id: "m",   name: "may",    base: 0x1218, latin: "m" },
  { id: "sz",  name: "śawt",   base: 0x1220, latin: "ś" },
  { id: "r",   name: "rəʾs",   base: 0x1228, latin: "r" },
  { id: "s",   name: "sat",    base: 0x1230, latin: "s" },
  { id: "q",   name: "qaf",    base: 0x1240, latin: "q" },
  { id: "b",   name: "bet",    base: 0x1260, latin: "b" },
  { id: "t",   name: "taw",    base: 0x1270, latin: "t" },
  { id: "x",   name: "ḫarm",   base: 0x1280, latin: "ḫ" },
  { id: "n",   name: "nahas",  base: 0x1290, latin: "n" },
  { id: "alef",name: "ʾalf",   base: 0x12A0, latin: "ʾ" },
  { id: "k",   name: "kaf",    base: 0x12A8, latin: "k" },
  { id: "w",   name: "wawe",   base: 0x12C8, latin: "w" },
  { id: "ayin",name: "ʿayn",   base: 0x12D0, latin: "ʿ" },
  { id: "z",   name: "zay",    base: 0x12D8, latin: "z" },
  { id: "y",   name: "yaman",  base: 0x12E8, latin: "y" },
  { id: "d",   name: "dənt",   base: 0x12F0, latin: "d" },
  { id: "g",   name: "gaml",   base: 0x1308, latin: "g" },
  { id: "tt",  name: "ṭayt",   base: 0x1320, latin: "ṭ" },
  { id: "pp",  name: "ṗayt",   base: 0x1330, latin: "ṗ" },
  { id: "ts",  name: "ṣadäy",  base: 0x1338, latin: "ṣ" },
  { id: "tss", name: "ṣ́appa",  base: 0x1340, latin: "ṣ́" },
  { id: "f",   name: "af",     base: 0x1348, latin: "f" },
  { id: "p",   name: "psa",    base: 0x1350, latin: "p" },
];

// Precompute: map consonant id → consonant object for O(1) lookup
export const CONSONANT_MAP = new Map(CONSONANTS.map((c) => [c.id, c]));

// Generate the Ethiopic character for a consonant + vowel order index (0-6)
export function getChar(consonant, orderIndex) {
  return String.fromCodePoint(consonant.base + orderIndex);
}

// Generate all 7 forms for a consonant
export function getFamily(consonant) {
  return VOWEL_ORDERS.map((v) => ({
    char: getChar(consonant, v.index),
    vowel: v.vowel,
    order: v.index,
    transliteration: consonant.latin + v.vowel,
    orderName: v.name,
  }));
}

// Generate transliteration string (e.g., "hä", "hu", "hi")
export function getTranslit(consonant, orderIndex) {
  return consonant.latin + VOWEL_ORDERS[orderIndex].vowel;
}

// Total characters in the alphabet
export const TOTAL_CHARACTERS = CONSONANTS.length * VOWEL_ORDERS.length;

// XP thresholds for levels
export const XP_PER_LEVEL = 100;
export function getLevel(xp) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}
export function getXpInLevel(xp) {
  return xp % XP_PER_LEVEL;
}

// Mastery tiers based on accuracy percentage
export function getMasteryTier(correct, total) {
  if (total < 3) return "none";
  const pct = correct / total;
  if (pct >= 0.9) return "gold";
  if (pct >= 0.7) return "silver";
  if (pct >= 0.4) return "bronze";
  return "none";
}

export const TIER_COLORS = {
  none: { bg: "bg-slate-700", text: "text-slate-400", ring: "ring-slate-600" },
  bronze: { bg: "bg-amber-900/60", text: "text-amber-300", ring: "ring-amber-600" },
  silver: { bg: "bg-slate-400/30", text: "text-slate-200", ring: "ring-slate-300" },
  gold: { bg: "bg-yellow-500/30", text: "text-yellow-300", ring: "ring-yellow-400" },
};

// How many consonant families are initially unlocked
export const INITIAL_UNLOCK_COUNT = 4;

// ── Audio ────────────────────────────────────────────────────────
// Generate audio file path for a character
// vowelIndex is 0-6 (from VOWEL_ORDERS), but audio files use 1-7 naming
export function getAudioPath(familyId, vowelIndex) {
  return `/audio/geez/geez_${familyId}_${vowelIndex + 1}.mp3`;
}

// Generate all 7 audio paths for a consonant family (for preloading)
export function getFamilyAudioPaths(familyId) {
  return VOWEL_ORDERS.map((v) => getAudioPath(familyId, v.index));
}

// Generate distractor options for quiz questions.
// Returns an array of { consonant, orderIndex } excluding the correct answer.
export function generateDistractors(correctConsonant, correctOrder, pool, count = 3) {
  const distractors = [];
  const used = new Set([`${correctConsonant.id}-${correctOrder}`]);

  // Strategy: mix same-consonant-different-vowel and different-consonant-same-vowel
  const strategies = [
    // Same consonant, different vowel (tests vowel recognition)
    () => {
      const order = Math.floor(Math.random() * 7);
      const key = `${correctConsonant.id}-${order}`;
      if (!used.has(key)) {
        used.add(key);
        return { consonant: correctConsonant, orderIndex: order };
      }
      return null;
    },
    // Different consonant, same vowel (tests consonant recognition)
    () => {
      const c = pool[Math.floor(Math.random() * pool.length)];
      const key = `${c.id}-${correctOrder}`;
      if (!used.has(key)) {
        used.add(key);
        return { consonant: c, orderIndex: correctOrder };
      }
      return null;
    },
    // Fully random from pool
    () => {
      const c = pool[Math.floor(Math.random() * pool.length)];
      const order = Math.floor(Math.random() * 7);
      const key = `${c.id}-${order}`;
      if (!used.has(key)) {
        used.add(key);
        return { consonant: c, orderIndex: order };
      }
      return null;
    },
  ];

  let attempts = 0;
  while (distractors.length < count && attempts < 50) {
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    const result = strategy();
    if (result) distractors.push(result);
    attempts++;
  }

  return distractors;
}
