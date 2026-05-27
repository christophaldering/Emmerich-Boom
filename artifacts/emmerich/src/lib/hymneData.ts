export const STROPHEN: Array<{ lines: string[]; refrain?: boolean; title?: boolean }> = [
  // 0 — Titel
  {
    title: true,
    lines: [
      "EMMERICH BOOMT!",
      "Die Hymne vom BoomerClub Emmerich",
    ],
  },
  // 1 — Strophe 1
  {
    lines: [
      "An der Theke der Sozietät, da nahm das Unheil seinen Lauf,",
      "ein Pils, ein Alt, 'ne Schnapsidee — und keiner hörte auf.",
      "Tulpensonntag '24, daran erinnert sich noch wer —",
      "seitdem geh'n wir nicht nüchtern heim. Na und, wer fragt schon sehr?",
    ],
  },
  // 1 — Vorsatz 1
  {
    lines: [
      "Kein Tinder, kein Insta, kein Status, kein Like —",
      "nur Theke, nur Truppe, nur Bier — und nur wir!",
    ],
  },
  // 2 — Refrain 1
  {
    refrain: true,
    lines: [
      "Emmerich boomt! — und wir boomen mit,",
      "oben am Kapaunenberg, da singen wir uns'ren Hit!",
      "Am Bölt, an der Theke, da gehör'n wir hin —",
      "Emmerich boomt, und wir mittendrin!",
      "Emmerich boomt — und wir boomen mit!",
    ],
  },
  // 3 — Strophe 2
  {
    lines: [
      "Sie nennen uns die Boomer — ja bitte, gern geschehn,",
      "wir tanzen noch zu Platten, die hat keiner mehr gesehn.",
      "Das Handy liegt im Eck, das W-LAN ist uns schnuppe,",
      "am Feierabendmarkt am Rhein steht schon die halbe Truppe.",
    ],
  },
  // 4 — Vorsatz 2
  {
    lines: [
      "Kein Tinder, kein Insta, kein Status, kein Like —",
      "nur Theke, nur Truppe, nur Bier — und nur wir!",
    ],
  },
  // 5 — Refrain 2
  {
    refrain: true,
    lines: [
      "Emmerich boomt! — und wir boomen mit,",
      "oben am Kapaunenberg, da singen wir uns'ren Hit!",
      "Am Bölt, an der Theke, da gehör'n wir hin —",
      "Emmerich boomt, und wir mittendrin!",
      "Emmerich boomt — und wir boomen mit!",
    ],
  },
  // 6 — Strophe 3
  {
    lines: [
      "Wir sind nicht jung — na gut. Wir sind genau richtig.",
      "Wir halten zusammen, im Spaß und auch im Wichtig'.",
      "Und wenn der Rhein vorbeizieht und der Abend leise wird,",
      "dann weiß ein jeder hier: in Emmerich ist man nie verirrt.",
    ],
  },
  // 7 — Strophe 4
  {
    lines: [
      "Die Knie machen Krach, der Rücken hat Beschwerden,",
      "doch oben aufm Bölt, da woll'n wir achtzehn werden!",
      "Ein Bier, ein Lied, die Bude bebt, der DJ legt nochmal auf —",
      "und morgen früh? Egal. Wir nehmen das in Kauf!",
    ],
  },
  // 8 — Vorsatz 3
  {
    lines: [
      "Kein Tinder, kein Insta, kein Status, kein Like —",
      "nur Theke, nur Truppe, nur Boomer dabei!",
    ],
  },
  // 9 — Finale-Refrain
  {
    refrain: true,
    lines: [
      "Emmerich boomt! — und wir boomen mit,",
      "oben am Kapaunenberg, da singen wir uns'ren Hit!",
      "Am Bölt, an der Theke, da gehör'n wir hin —",
      "Emmerich boomt, und wir mittendrin!",
      "Emmerich boomt — und wir boomen mit!",
    ],
  },
];

// Calibrated start times (seconds) for each line.
// Song duration: ~4:10 (250s). 10 sections, 37 lines total.
// Adjust after listening to the actual recording.
export const LINE_TIMESTAMPS: number[][] = [
  // 0 Titel (vor dem Song, kein Timing)
  [0.0, 3.0],
  // 1 Strophe 1 (+5s gesamt)
  [12.0, 20.0, 27.0, 34.0],
  // 2 Vorsatz 1
  [43.0, 49.0],
  // 3 Refrain 1
  [55.0, 61.0, 67.0, 72.0, 77.0],
  // 4 Strophe 2
  [92.0, 99.0, 106.0, 113.0],
  // 5 Vorsatz 2
  [121.0, 127.0],
  // 6 Refrain 2
  [133.0, 139.0, 145.0, 150.0, 155.0],
  // 7 Strophe 3
  [165.0, 172.0, 179.0, 185.0],
  // 8 Strophe 4
  [192.0, 199.0, 206.0, 212.0],
  // 9 Vorsatz 3
  [219.0, 225.0],
  // 10 Finale-Refrain
  [231.0, 237.0, 243.0, 247.0, 249.0],
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
