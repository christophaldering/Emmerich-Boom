export type Track = {
  key: string;
  label: string;
  artist: string;
  title: string;
  energy: number;
  wishBy?: string;
};

export type Phase = {
  name: string;
  description: string;
  min: number;
  max: number;
};

export type RevealInfo = {
  position: number;
  total: number;
  phase: Phase;
  prev: Track | null;
  next: Track | null;
};

export const PHASES: Phase[] = [
  { name: "Ankommen",      description: "Sanft reinkommen — der Abend beginnt",       min: 1,  max: 20  },
  { name: "Aufwärmen",     description: "Die Stimmung baut sich auf",                  min: 21, max: 45  },
  { name: "Tanzfläche",    description: "Jetzt geht die Post ab",                      min: 46, max: 70  },
  { name: "Stimmungshoch", description: "Volle Energie — alle sind dabei",             min: 71, max: 88  },
  { name: "Finale",        description: "Der große Abschluss — unvergesslich",         min: 89, max: 100 },
];

export function getPhase(energy: number): Phase {
  return PHASES.find((p) => energy >= p.min && energy <= p.max) ?? PHASES[2];
}

export const CURATED: Track[] = [
  { key: "c0",  label: "70er",   artist: "Boney M.",                   title: "Rivers of Babylon",          energy: 12 },
  { key: "c1",  label: "70er",   artist: "Toto",                       title: "Africa",                     energy: 18 },
  { key: "c2",  label: "2020er", artist: "Harry Styles",               title: "As It Was",                  energy: 22 },
  { key: "c3",  label: "2000er", artist: "Amy Winehouse",              title: "Rehab",                      energy: 27 },
  { key: "c4",  label: "70er",   artist: "Earth, Wind & Fire",         title: "September",                  energy: 33 },
  { key: "c5",  label: "80er",   artist: "Duran Duran",                title: "Rio",                        energy: 38 },
  { key: "c6",  label: "90er",   artist: "Die Fantastischen Vier",     title: "Die Da",                     energy: 42 },
  { key: "c7",  label: "80er",   artist: "a-ha",                       title: "Take On Me",                 energy: 45 },
  { key: "c8",  label: "70er",   artist: "Gloria Gaynor",              title: "I Will Survive",             energy: 50 },
  { key: "c9",  label: "80er",   artist: "Cyndi Lauper",               title: "Girls Just Want to Have Fun",energy: 55 },
  { key: "c10", label: "2010er", artist: "Pharrell Williams",          title: "Happy",                      energy: 58 },
  { key: "c11", label: "2020er", artist: "Dua Lipa",                   title: "Levitating",                 energy: 63 },
  { key: "c12", label: "70er",   artist: "ABBA",                       title: "Dancing Queen",              energy: 67 },
  { key: "c13", label: "80er",   artist: "Nena",                       title: "99 Luftballons",             energy: 69 },
  { key: "c14", label: "90er",   artist: "Haddaway",                   title: "What Is Love",               energy: 74 },
  { key: "c15", label: "80er",   artist: "Depeche Mode",               title: "Personal Jesus",             energy: 78 },
  { key: "c16", label: "2010er", artist: "Mark Ronson ft. Bruno Mars", title: "Uptown Funk",                energy: 82 },
  { key: "c17", label: "90er",   artist: "Snap!",                      title: "Rhythm Is a Dancer",         energy: 86 },
  { key: "c18", label: "70er",   artist: "Queen",                      title: "Bohemian Rhapsody",          energy: 95 },
];

const ARTIST_ENERGY: [string, number][] = [
  ["bach",            8],  ["mozart",         8],  ["beethoven",      8],  ["klassik",        8],
  ["sinatra",        12],  ["dean martin",   12],  ["ella fitzgerald",12],  ["nat king cole", 12],
  ["billie holiday", 12],  ["boney m",       12],
  ["fleetwood mac",  32],  ["eagles",        30],  ["simon & garfunkel",28],
  ["beatles",        40],  ["rolling stones",48],  ["led zeppelin",   50],
  ["police",         50],  ["sting",         50],  ["blondie",        55],
  ["eurythmics",     55],  ["annie lennox",  55],  ["david bowie",    55],
  ["elton john",     50],  ["stevie wonder", 55],  ["george michael", 60],
  ["wham",           65],  ["bruce springsteen",58],["u2",            55],
  ["bon jovi",       65],  ["robbie williams",65],  ["coldplay",      45],
  ["adele",          30],  ["ed sheeran",    42],  ["dolly parton",   35],
  ["radiohead",      30],  ["nirvana",       50],
  ["michael jackson",72],  ["prince",        75],  ["madonna",        68],
  ["tina turner",    70],  ["donna summer",  68],  ["bee gees",       65],
  ["kylie minogue",  68],  ["whitney houston",62], ["grease",         65],
  ["macarena",       78],  ["los del rio",   78],  ["village people", 82],
  ["ymca",           82],  ["gangnam",       80],  ["psy",            80],
  ["lizzo",          78],  ["rihanna",       70],  ["beyonce",        72],
  ["beyoncé",        72],  ["taylor swift",  65],  ["drake",          65],
  ["eminem",         70],  ["pitbull",       82],  ["daft punk",      80],
  ["calvin harris",  82],  ["david guetta",  82],  ["the weeknd",     72],
  ["weeknd",         72],  ["blinding lights",72],  ["bad bunny",     72],
  ["killers",        60],  ["shape of you",  68],  ["uptown funk",    82],
  ["happy",          58],  ["levitating",    63],  ["dancing queen",  67],
  ["bohemian rhapsody",95],["don't stop me now",85],["we will rock you",80],
];

export function estimateEnergy(songText: string): number {
  const lower = songText.toLowerCase();
  for (const [keyword, energy] of ARTIST_ENERGY) {
    if (lower.includes(keyword)) return energy;
  }
  return 68;
}

export type WishEntry = { id: number; name: string; song: string | null };

function parseSong(raw: string): { artist: string; title: string } {
  const emDash = raw.indexOf(" – ");
  if (emDash > 0) return { artist: raw.slice(0, emDash).trim(), title: raw.slice(emDash + 3).trim() };
  const hyphen = raw.indexOf(" - ");
  if (hyphen > 0) return { artist: raw.slice(0, hyphen).trim(), title: raw.slice(hyphen + 3).trim() };
  return { artist: raw.trim(), title: "" };
}

export function buildSortedPlaylist(wishes: WishEntry[]): Track[] {
  const wishTracks: Track[] = wishes
    .filter((e) => e.song && e.song.trim() !== "")
    .map((e) => {
      const raw = e.song!.trim();
      const { artist, title } = parseSong(raw);
      const energy = estimateEnergy(raw);
      return {
        key: `w${e.id}`,
        label: "♥",
        artist,
        title,
        energy,
        wishBy: e.name,
      };
    });

  return [...CURATED, ...wishTracks].sort((a, b) => a.energy - b.energy);
}

export function getRevealInfo(submittedSong: string, submittedId: number, allTracks: Track[]): RevealInfo {
  const key = `w${submittedId}`;
  const idx = allTracks.findIndex((t) => t.key === key);
  const energy = estimateEnergy(submittedSong);
  const phase = getPhase(energy);

  if (idx === -1) {
    return { position: allTracks.length, total: allTracks.length, phase, prev: allTracks[allTracks.length - 2] ?? null, next: null };
  }

  return {
    position: idx + 1,
    total: allTracks.length,
    phase,
    prev: idx > 0 ? allTracks[idx - 1] : null,
    next: idx < allTracks.length - 1 ? allTracks[idx + 1] : null,
  };
}

export function buildPlaylistText(tracks: Track[]): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
  const sep = "─".repeat(50);

  const lines: string[] = [
    "EMMERICH BOOMT! — Die Playlist",
    "Boomer-Party · Samstag, 18. Juli 2026 · Bölt (Kapaunenberg)",
    `Stand: ${dateStr}`,
    sep,
    "",
  ];

  let currentPhaseIdx = -1;
  tracks.forEach((t, i) => {
    const phaseIdx = PHASES.findIndex((p) => t.energy >= p.min && t.energy <= p.max);
    if (phaseIdx !== currentPhaseIdx) {
      currentPhaseIdx = phaseIdx;
      lines.push(`── ${PHASES[phaseIdx]?.name ?? ""} ${"─".repeat(35)}`);
    }
    const num = String(i + 1).padStart(2, " ");
    const songLabel = t.title ? `${t.artist} – ${t.title}` : t.artist;
    const song = t.wishBy ? `${songLabel}  (Wunsch von ${t.wishBy})` : songLabel;
    lines.push(`${num}.  ${song}`);
  });

  lines.push("");
  lines.push(sep);
  lines.push(`Insgesamt: ${tracks.length} Songs · emmerich-boomt.replit.app`);
  return lines.join("\n");
}
