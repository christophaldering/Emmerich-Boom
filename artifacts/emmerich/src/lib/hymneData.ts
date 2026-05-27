export const STROPHEN: Array<{ lines: string[]; refrain?: boolean }> = [
  // 0 — Strophe 1
  {
    lines: [
      "An der Theke der Sozietät, da nahm das Unheil seinen Lauf.",
      "Ein Pils, ein Alt, 'ne Schnapsidee — und keiner hörte auf.",
      "Tulpensonntag vierundzwanzig, da fing das alles irgendwie an.",
      "Seitdem sing'n wir durch lange Nächte — und irgendwann kommt irgendwann.",
    ],
  },
  // 1 — Vorsatz 1
  {
    lines: [
      "Kein Tinder, kein Insta, kein Status, kein Like —",
      "nur Theke, nur Boomer, nur Bier — und nur wir!",
    ],
  },
  // 2 — Refrain 1
  {
    refrain: true,
    lines: [
      "Emmerich boomt — und wir boomen mit!",
      "Oben am Kapaunenberg, da sing'n wir unsern Hit!",
      "Am Bölt, an der Theke, da gehör'n wir hin —",
      "Emmerich boomt, und wir mittendrin!",
      "Emmerich boomt — und wir boomen mit!",
    ],
  },
  // 3 — Strophe 2
  {
    lines: [
      "Sie nennen uns die Boomer — ja bitte, gern gescheh'n.",
      "Wir tanzen noch zu Platten, die hat keiner mehr gesehn.",
      "Das Handy liegt im Eck herum, das WLAN ist uns schnuppe.",
      "Auch am Feierabendmarkt am Rhein trifft man immer irgendwen von früher.",
    ],
  },
  // 4 — Vorsatz 2
  {
    lines: [
      "Kein Tinder, kein Insta, kein Status, kein Like —",
      "nur Theke, nur Boomer, nur Bier — und nur wir!",
    ],
  },
  // 5 — Refrain 2
  {
    refrain: true,
    lines: [
      "Emmerich boomt — und wir boomen mit!",
      "Oben am Kapaunenberg, da sing'n wir unsern Hit!",
      "Am Bölt, an der Theke, da gehör'n wir hin —",
      "Emmerich boomt, und wir mittendrin!",
      "Emmerich boomt — und wir boomen mit!",
    ],
  },
  // 6 — Strophe 3
  {
    lines: [
      "Wir sind nicht jung — na gut. Wir sind genau richtig.",
      "Wir halten zusammen, im Spaß und auch im Wichtig.",
      "Und wenn der Rhein vorbeizieht und der Abend leise wird,",
      "dann weiß hier jeder irgendwann: In Emmerich ist man nie verirrt.",
    ],
  },
  // 7 — Strophe 4
  {
    lines: [
      "Die Knie machen Krach, im Rücken is Pein —",
      "doch oben auf'm Bölt, da woll'n wir wieder achtzehn sein!",
      "Ein Bier, ein Lied, die Bude bebt, der DJ legt noch auf —",
      "und morgen früh? Ach völlig egal. Wir nehmen das in Kauf!",
    ],
  },
  // 8 — Vorsatz 3
  {
    lines: [
      "Kein Tinder, kein Insta, kein Status, kein Like —",
      "nur Theke, nur Boomer, nur Bier — und nur wir!",
    ],
  },
  // 9 — Finale-Refrain
  {
    refrain: true,
    lines: [
      "Emmerich boomt — und wir boomen mit!",
      "Oben am Kapaunenberg, da sing'n wir unsern Hit!",
      "Am Bölt, an der Theke, da gehör'n wir hin —",
      "Emmerich boomt, und wir mittendrin!",
      "Emmerich boomt! Und wir boomen mit!",
    ],
  },
];

// Calibrated start times (seconds) for each line.
// Song duration: ~4:10 (250s). 10 sections, 37 lines total.
// Adjust after listening to the actual recording.
export const LINE_TIMESTAMPS: number[][] = [
  // 0 Strophe 1 (nach ~7s Intro)
  [7.0, 15.0, 22.0, 29.0],
  // 1 Vorsatz 1
  [38.0, 44.0],
  // 2 Refrain 1
  [50.0, 56.0, 62.0, 67.0, 72.0],
  // 3 Strophe 2
  [80.0, 87.0, 94.0, 101.0],
  // 4 Vorsatz 2
  [109.0, 115.0],
  // 5 Refrain 2
  [121.0, 127.0, 133.0, 138.0, 143.0],
  // 6 Strophe 3
  [153.0, 160.0, 167.0, 173.0],
  // 7 Strophe 4
  [180.0, 187.0, 194.0, 200.0],
  // 8 Vorsatz 3
  [207.0, 213.0],
  // 9 Finale-Refrain
  [219.0, 225.0, 231.0, 236.0, 241.0],
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
