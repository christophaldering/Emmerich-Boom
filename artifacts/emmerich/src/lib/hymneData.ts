export const STROPHEN: Array<{ lines: string[]; refrain?: boolean }> = [
  {
    lines: [
      "An der Theke der Sozietät, da nahm das Unheil seinen Lauf,",
      "ein Pils, ein Alt, 'ne Schnapsidee — und keiner hörte auf.",
      "Tulpensonntag '24, daran erinnert sich noch wer —",
      "seitdem geh'n wir nicht nüchtern heim. Na und, wer fragt schon sehr?",
    ],
  },
  {
    lines: [
      "Kein Tinder, kein Insta, kein Status, kein Like —",
      "nur Theke, nur Truppe, nur Bier — und nur wir!",
    ],
  },
  {
    refrain: true,
    lines: [
      "Emmerich boomt! — und wir boomen mit,",
      "oben am Kapaunenberg, da singen wir uns'ren Hit!",
      "Am Bölt, an der Theke, da gehör'n wir hin —",
      "Emmerich boomt — und wir mittendrin!",
      "Emmerich boomt — und wir boomen mit!",
    ],
  },
  {
    lines: [
      "Sie nennen uns die Boomer — ja bitte, gern geschehn.",
      "wir tanzen noch zu Platten, die hat keiner mehr gesehn.",
      "Das Handy liegt im Eck, das W-LAN ist uns schnuppe,",
      "am Feierabendmarkt am Rhein steht schon die halbe Truppe.",
    ],
  },
  {
    lines: [
      "Kein Tinder, kein Insta, kein Status, kein Like —",
      "nur Theke, nur Truppe, nur Bier — und nur wir!",
    ],
  },
  {
    refrain: true,
    lines: [
      "Emmerich boomt! — und wir boomen mit,",
      "oben am Kapaunenberg, da singen wir uns'ren Hit!",
      "Am Bölt, an der Theke, da gehör'n wir hin —",
      "Emmerich boomt — und wir mittendrin!",
      "Emmerich boomt — und wir boomen mit!",
    ],
  },
  {
    lines: [
      "Wir sind nicht jung — na gut. Wir sind genau richtig.",
      "Wir halten zusammen, im Spaß und auch im Wichtig.",
      "Und wenn der Rhein vorbeizieht und der Abend leise wird,",
      "dann weiß ein jeder hier: in Emmerich ist man nie verirrt.",
    ],
  },
  {
    lines: [
      "Die Knie machen Krach, der Rücken hat Beschwerden,",
      "doch oben aufm Bölt, da woll'n wir achtzehn werden!",
      "Ein Bier, ein Lied, die Bude bebt, der DJ legt nochmal auf —",
      "und morgen früh? Egal. Wir nehmen das in Kauf!",
    ],
  },
];

// Manually calibrated start times (seconds) for each line.
// Song duration: ~4:10 (250s). Adjust after listening to the recording.
// Structure: Intro → St1 → St2 → Ref1 → St3 → St4 → Ref2 → St5 → St6 → Outro
export const LINE_TIMESTAMPS: number[][] = [
  // Strophe 1 (nach ~8s Intro)
  [8.0, 16.0, 24.0, 32.0],
  // Strophe 2 — "Kein Tinder …"
  [42.0, 50.0],
  // Refrain 1
  [58.0, 65.0, 72.0, 78.5, 85.0],
  // Strophe 3 — "Sie nennen uns …"
  [96.0, 104.0, 112.0, 120.0],
  // Strophe 4 — "Kein Tinder …"
  [130.0, 138.0],
  // Refrain 2
  [146.0, 153.0, 160.0, 166.5, 173.0],
  // Strophe 5 — "Wir sind nicht jung …"
  [185.0, 193.0, 201.0, 209.0],
  // Strophe 6 — "Die Knie machen Krach …"
  [218.0, 226.0, 234.0, 242.0],
];

export interface FlatEntry {
  flatIdx: number;
  si: number;
  li: number;
  startTime: number;
  text: string;
  isRefrain: boolean;
}

export const FLAT_ENTRIES: FlatEntry[] = LINE_TIMESTAMPS.flatMap((strophe, si) =>
  strophe.map((startTime, li) => ({
    si,
    li,
    startTime,
    text: STROPHEN[si].lines[li],
    isRefrain: !!STROPHEN[si].refrain,
    flatIdx: 0,
  }))
).sort((a, b) => a.startTime - b.startTime)
  .map((e, i) => ({ ...e, flatIdx: i }));

export function getActiveLineIndex(currentTime: number): number {
  if (currentTime <= 0) return -1;
  let activeIdx = -1;
  for (let i = 0; i < FLAT_ENTRIES.length; i++) {
    if (FLAT_ENTRIES[i].startTime <= currentTime) {
      activeIdx = i;
    } else {
      break;
    }
  }
  return activeIdx;
}
