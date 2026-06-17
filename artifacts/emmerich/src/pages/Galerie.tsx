import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { THEKE_SZENE } from "../config/theke-szene";
import { BEISPIEL_SCHWELLE, BEISPIEL_PROFILE, LEER_RAHMEN, HAUSMEISTER } from "./beispielProfile";

// ─── Konstanten ───────────────────────────────────────────────────────────────

const A   = "#E8991A";
const BG  = "#0A0704";
const FG  = "#F5E8C8";
const fg  = (o: number) => `rgba(245,232,200,${o})`;
const am  = (o: number) => `rgba(232,153,26,${o})`;

const PORTRAIT_W     = 118;
const PORTRAIT_H     = 157;
const GAP            = 26;
const ITEM_STRIDE    = PORTRAIT_W + GAP;
const AUTOPLAY_SPEED = 42;   // px/s
const BUFFER         = 3;    // extra items links/rechts vom Viewport rendern

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GalerieEntry {
  id:                   number;
  anmeldung_ticket_id:  number;
  anzeige_name:         string;
  vorstellung?:         string | null;
  lauter_song?:         string | null;
  f_tontraeger?:        string | null;
  f_abends?:            string | null;
  f_untersatz?:         string | null;
  f_musik?:             string | null;
  f_getraenk?:          string | null;
  foto_frueher_key?:    string | null;
  foto_frueher_jahr?:   number | null;
  foto_heute_key?:      string | null;
  foto_heute_jahr?:     number | null;
  fotos:                { id: number; datei_key: string; bildunterschrift?: string | null; jahr?: number | null; sichtbar_ok: boolean }[];
  hat_botschaft:        boolean;
  zuletzt_gesehen_am?:  string | null;
  istBeispiel?:         boolean;
  istLeerRahmen?:       boolean;
  istInventar?:         boolean;
  foto_frueher_url?:    string | null;
  foto_heute_url?:      string | null;
}

export interface GalerieWandProps {
  entries:               GalerieEntry[];
  token:                 string;
  now:                   number;
  onPorträtAntippen?:   (e: GalerieEntry) => void;
  onDeinPlatzAntippen?: () => void;
  beamer?:               boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fotoUrl(key: string, token: string) {
  return `/api/theke/datei/${key}?t=${encodeURIComponent(token)}`;
}

/** Deterministischer Pseudo-Zufall aus id + seed, Ergebnis in [0, 1) */
function seededVal(id: number, seed: number = 0): number {
  const x = Math.sin(Math.abs(id) * 9301 + seed * 49297 + 233) * 100_000;
  return x - Math.floor(x);
}

function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("") || "?";
}

// ─── SVG Bilderrahmen ─────────────────────────────────────────────────────────
// 4 Typen, deterministisch per ID (|id| % 4). Kein Three.js/WebGL.

function SvgBilderrahmen({ id, glow, isBeispiel }: { id: number; glow: boolean; isBeispiel?: boolean }) {
  const typ = Math.abs(id) % 4;

  const goldH = glow ? "#f5c848" : isBeispiel ? "#5a4010" : "#d4a020";
  const goldM = glow ? "#e8991a" : isBeispiel ? "#3a2a08" : "#9a6e14";
  const goldD = glow ? "#a86010" : isBeispiel ? "#201608" : "#4a3308";

  const glowAnim = glow
    ? "galerieGlow 2.8s ease-in-out infinite"
    : "none";

  const filter = glow
    ? "drop-shadow(0 0 9px rgba(232,153,26,0.65)) drop-shadow(0 5px 16px rgba(0,0,0,0.9))"
    : "drop-shadow(0 5px 14px rgba(0,0,0,0.88))";

  const w = 100, h = 133;
  const uid = `f${Math.abs(id)}`;

  const grad = (
    <linearGradient id={uid} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stopColor={goldH} />
      <stop offset="45%"  stopColor={goldM} />
      <stop offset="100%" stopColor={goldD} />
    </linearGradient>
  );

  const svgStyle: React.CSSProperties = {
    position: "absolute", inset: 0,
    width: "100%", height: "100%",
    zIndex: 1, filter,
    pointerEvents: "none",
    overflow: "visible",
  };

  if (typ === 2) {
    // ── Oval ──
    const rx = w / 2 - 1, ry = h / 2 - 1;
    const irx = rx - 7, iry = ry - 7;
    return (
      <svg viewBox={`0 0 ${w} ${h}`} style={svgStyle}>
        <defs>
          <radialGradient id={uid} cx="40%" cy="35%" r="65%">
            <stop offset="0%"   stopColor={goldH} />
            <stop offset="55%"  stopColor={goldM} />
            <stop offset="100%" stopColor={goldD} />
          </radialGradient>
        </defs>
        <ellipse cx={w/2} cy={h/2} rx={rx}   ry={ry}   fill={`url(#${uid})`} style={{ animation: glowAnim }} />
        <ellipse cx={w/2} cy={h/2} rx={rx-3}  ry={ry-3}  fill="none" stroke={goldH} strokeWidth="0.6" opacity="0.55" />
        <ellipse cx={w/2} cy={h/2} rx={irx}  ry={iry}  fill={BG} />
        <ellipse cx={w/2} cy={h/2} rx={irx-2} ry={iry-2} fill="none" stroke={goldM} strokeWidth="0.5" opacity="0.35" />
      </svg>
    );
  }

  if (typ === 1) {
    // ── Klassisch doppelt ──
    return (
      <svg viewBox={`0 0 ${w} ${h}`} style={svgStyle}>
        <defs>{grad}</defs>
        <rect x="0.5" y="0.5" width={w-1} height={h-1} fill={`url(#${uid})`} rx="1.5" style={{ animation: glowAnim }} />
        <rect x="5"   y="5"   width={w-10} height={h-10} fill={BG} rx="0.5" />
        <rect x="9"   y="9"   width={w-18} height={h-18} fill="none" stroke={goldH} strokeWidth="0.7" rx="0.5" opacity="0.5" />
        {/* Oben-Mitte Ornament */}
        <polygon points={`${w/2},1 ${w/2+5},7 ${w/2},13 ${w/2-5},7`} fill={goldH} />
        {/* Unten-Mitte */}
        <polygon points={`${w/2},${h-1} ${w/2+4},${h-7} ${w/2},${h-13} ${w/2-4},${h-7}`} fill={goldH} />
      </svg>
    );
  }

  if (typ === 3) {
    // ── Barock mit Eckreliefs ──
    const corners: [number, number][] = [[5,5],[w-5,5],[5,h-5],[w-5,h-5]];
    const mids:    [number, number][] = [[w/2,2],[w/2,h-2],[2,h/2],[w-2,h/2]];
    return (
      <svg viewBox={`0 0 ${w} ${h}`} style={svgStyle}>
        <defs>{grad}</defs>
        <rect x="0.5" y="0.5" width={w-1} height={h-1} fill={`url(#${uid})`} style={{ animation: glowAnim }} />
        <rect x="6"   y="6"   width={w-12} height={h-12} fill={BG} />
        <rect x="9"   y="9"   width={w-18} height={h-18} fill="none" stroke={goldM} strokeWidth="0.6" opacity="0.4" />
        {corners.map(([cx,cy],i) => (
          <g key={i} transform={`translate(${cx},${cy})`}>
            <circle r="3.8" fill={goldH} />
            <circle r="1.8" fill={goldD} />
          </g>
        ))}
        {mids.map(([cx,cy],i) => (
          <polygon key={i}
            points={`${cx},${cy-3.5} ${cx+3.5},${cy} ${cx},${cy+3.5} ${cx-3.5},${cy}`}
            fill={goldH} opacity="0.85"
          />
        ))}
      </svg>
    );
  }

  // ── Typ 0: Klassisch einfach ──
  const corners: [number, number][] = [[6,6],[w-6,6],[6,h-6],[w-6,h-6]];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={svgStyle}>
      <defs>{grad}</defs>
      <rect x="0.5" y="0.5" width={w-1} height={h-1} fill={`url(#${uid})`} style={{ animation: glowAnim }} />
      <rect x="5"   y="5"   width={w-10} height={h-10} fill={BG} />
      <rect x="8.5" y="8.5" width={w-17} height={h-17} fill="none" stroke={goldH} strokeWidth="0.65" opacity="0.45" />
      {corners.map(([cx,cy],i) => (
        <polygon key={i}
          points={`${cx},${cy-4.5} ${cx+4.5},${cy} ${cx},${cy+4.5} ${cx-4.5},${cy}`}
          fill={goldH}
        />
      ))}
    </svg>
  );
}

// ─── Einzelnes Porträt-Karte ──────────────────────────────────────────────────

function PorträtKarte({
  entry, token, anwesend, physX, scrollOffset, yOff, scale, rot, isCenter,
  onAntippen,
}: {
  entry:         GalerieEntry;
  token:         string;
  anwesend:      boolean;
  physX:         number;
  scrollOffset:  number;
  yOff:          number;
  scale:         number;
  rot:           number;
  isCenter:      boolean;
  onAntippen:    (e: GalerieEntry) => void;
}) {
  const isOval    = Math.abs(entry.id) % 4 === 2;
  const hauptFotoUrl = entry.foto_heute_url ?? entry.foto_frueher_url ?? null;
  const hauptFoto    = hauptFotoUrl ? null : (entry.foto_heute_key ?? entry.foto_frueher_key);
  const init      = initials(entry.anzeige_name);

  const insetPx =
    Math.abs(entry.id) % 4 === 1 ? 13 :
    Math.abs(entry.id) % 4 === 3 ? 10 : 8;

  const clipPath = isOval ? "ellipse(48% 48% at 50% 50%)" : undefined;

  const left = physX - scrollOffset;

  return (
    <div
      onClick={() => onAntippen(entry)}
      style={{
        position:   "absolute",
        left:       `${left}px`,
        top:        `calc(50% + ${yOff}px)`,
        width:      `${PORTRAIT_W}px`,
        height:     `${PORTRAIT_H}px`,
        transform:  `translateY(-50%) rotate(${rot}deg) scale(${scale})`,
        cursor:     "pointer",
        userSelect: "none",
        willChange: "transform",
      }}
    >
      {/* SVG-Rahmen (zuerst → liegt unter dem Portrait) */}
      <SvgBilderrahmen id={entry.id} glow={anwesend} isBeispiel={entry.istBeispiel} />

      {/* Portrait-Inhalt (danach → liegt über dem Rahmen) */}
      <div style={{
        position:   "absolute",
        inset:      `${insetPx}px`,
        overflow:   "hidden",
        clipPath,
        zIndex:     2,
        filter:     entry.istBeispiel && !entry.istInventar ? "saturate(0.35) brightness(0.7)" : undefined,
      }}>
        {entry.istLeerRahmen ? (
          <div style={{
            width: "100%", height: "100%",
            background: "rgba(232,153,26,0.06)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "0.4rem",
          }}>
            <span style={{ fontSize: "2rem", color: am(0.35), lineHeight: 1 }}>+</span>
            <span style={{
              fontFamily: "'Lora', serif", fontSize: "0.5rem",
              color: am(0.55), textAlign: "center", lineHeight: 1.4,
              padding: "0 0.35rem", fontStyle: "italic",
            }}>
              Häng dich dazu
            </span>
          </div>
        ) : (hauptFotoUrl ?? hauptFoto) ? (
          <>
            <img
              src={hauptFotoUrl ?? fotoUrl(hauptFoto!, token)}
              alt={entry.anzeige_name}
              loading="lazy"
              style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
                animation: isCenter && anwesend === false && !entry.istBeispiel
                  ? "kenBurnsGalerie 9s ease-in-out alternate infinite"
                  : undefined,
              }}
            />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(10,7,4,0.8) 0%, transparent 55%)",
            }} />
          </>
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: entry.istBeispiel ? "rgba(232,153,26,0.18)" : A,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{
              fontFamily: "'Playfair Display', serif", fontWeight: 700,
              fontSize: "1.5rem", color: entry.istBeispiel ? am(0.45) : BG,
            }}>
              {init}
            </span>
          </div>
        )}

        {/* Name unten */}
        {!entry.istLeerRahmen && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "1.2rem 0.4rem 0.35rem",
            background: "linear-gradient(transparent, rgba(10,7,4,0.88))",
          }}>
            <p style={{
              fontFamily: "'Playfair Display', serif", fontWeight: 700,
              fontSize: "0.57rem", color: FG, margin: 0, textAlign: "center",
              textShadow: "0 1px 5px rgba(0,0,0,0.95)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {entry.anzeige_name}
            </p>
            {entry.hat_botschaft && (
              <p style={{ textAlign: "center", fontSize: "0.5rem", color: am(0.85), margin: "0.1rem 0 0" }}>🎙</p>
            )}
          </div>
        )}

        {/* Anwesend-Puls */}
        {anwesend && (
          <div style={{
            position: "absolute", top: "0.3rem", right: "0.3rem",
            width: "7px", height: "7px", borderRadius: "50%",
            background: A, animation: "thekePuls 2.5s ease-in-out infinite", zIndex: 4,
          }} />
        )}
      </div>

      {/* Bändchen */}
      {(entry.istBeispiel || entry.istInventar) && (
        <div style={{
          position: "absolute", top: "10px", left: "-4px", zIndex: 6,
          background: entry.istInventar ? am(0.55) : am(0.75), padding: "1.5px 7px",
          fontSize: "0.42rem", fontFamily: "'Lora', serif",
          letterSpacing: "0.12em", color: BG, textTransform: "uppercase",
          transform: "rotate(-10deg)", boxShadow: "0 2px 6px rgba(0,0,0,0.6)",
          borderRadius: "1px",
        }}>
          {entry.istInventar ? "Inventar" : "Beispiel"}
        </div>
      )}
    </div>
  );
}

// ─── BeispielDetail-Overlay (lokal, ohne FeedDetail anzufassen) ───────────────

function BeispielDetailOverlay({ entry, onClose }: { entry: GalerieEntry; onClose: () => void }) {
  const felder: [string, string | null | undefined][] = [
    ["Tonträger",        entry.f_tontraeger],
    ["Abends",           entry.f_abends],
    ["Untersatz",        entry.f_untersatz],
    ["Musik heute",      entry.f_musik],
    ["Lieblingsgetränk", entry.f_getraenk],
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(10,7,4,0.88)", overflowY: "auto", padding: "2rem 1rem",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "480px",
          background: "#0e0905", border: `1px solid ${am(0.28)}`,
          borderRadius: "10px", padding: "1.75rem", position: "relative", marginTop: "2rem",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "1rem", right: "1rem",
            background: "transparent", border: "none",
            color: fg(0.5), fontSize: "1.4rem", cursor: "pointer", lineHeight: 1,
          }}
        >×</button>

        {/* Beispiel-Banner */}
        <div style={{
          display: "inline-block", background: am(0.18), border: `1px solid ${am(0.35)}`,
          borderRadius: "4px", padding: "0.2rem 0.6rem", marginBottom: "1rem",
        }}>
          <span style={{
            fontFamily: "'Lora', serif", fontSize: "0.72rem",
            letterSpacing: "0.12em", textTransform: "uppercase", color: am(0.85),
          }}>
            Beispiel-Profil
          </span>
        </div>

        <p style={{
          fontFamily: "'Playfair Display', serif", fontWeight: 700,
          fontStyle: "italic", fontSize: "1.5rem", color: A, marginBottom: "0.75rem",
        }}>
          {entry.anzeige_name}
        </p>

        {entry.vorstellung && (
          <p style={{
            fontFamily: "'Lora', serif", fontStyle: "italic",
            fontSize: "0.92rem", color: fg(0.78), lineHeight: 1.7,
            borderLeft: `2px solid ${am(0.35)}`, paddingLeft: "0.75rem",
            marginBottom: "1.25rem",
          }}>
            {entry.vorstellung}
          </p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem 1.5rem", marginBottom: "1rem" }}>
          {felder.filter(([,v]) => v).map(([l, v]) => (
            <div key={l}>
              <div style={{ fontFamily: "'Lora', serif", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: am(0.65), marginBottom: "0.2rem" }}>{l}</div>
              <div style={{ fontFamily: "'Lora', serif", fontSize: "0.88rem", color: fg(0.82) }}>{v}</div>
            </div>
          ))}
        </div>

        {entry.lauter_song && (
          <div>
            <div style={{ fontFamily: "'Lora', serif", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: am(0.65), marginBottom: "0.2rem" }}>Lautester Song</div>
            <div style={{ fontFamily: "'Lora', serif", fontSize: "0.88rem", color: fg(0.82) }}>♪ {entry.lauter_song}</div>
          </div>
        )}

        {(entry.foto_frueher_url || entry.foto_heute_url) && (
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
            {[["Früher", entry.foto_frueher_url], ["Heute", entry.foto_heute_url]].map(([label, url]) =>
              url ? (
                <div key={label as string} style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Lora', serif", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: am(0.6), marginBottom: "0.3rem", textAlign: "center" }}>{label}</div>
                  <img src={url as string} alt={label as string} style={{ width: "100%", borderRadius: "4px", objectFit: "cover", aspectRatio: "3/4", filter: "saturate(0.4) brightness(0.75)" }} />
                </div>
              ) : null
            )}
          </div>
        )}

        <p style={{ fontFamily: "'Lora', serif", fontSize: "0.75rem", color: fg(0.35), fontStyle: "italic", marginTop: "1.5rem", textAlign: "center" }}>
          Richte deinen Steckbrief ein — dann hängst du hier.
        </p>
      </div>
    </div>
  );
}

// ─── Hauptkomponente: GalerieWand ─────────────────────────────────────────────

export function GalerieWand({
  entries, token, now,
  onPorträtAntippen, onDeinPlatzAntippen,
  beamer = false,
}: GalerieWandProps) {

  const containerRef    = useRef<HTMLDivElement>(null);
  const rafRef          = useRef<number | undefined>(undefined);
  const autoplayDirRef  = useRef(1);
  const dragRef         = useRef<{ startX: number; startOffset: number } | null>(null);
  const lastTRef        = useRef<number | null>(null);

  const [scrollOffset,   setScrollOffset]   = useState(0);
  const [autoplay,       setAutoplay]        = useState(beamer);
  const [beispielDetail, setBeispielDetail] = useState<GalerieEntry | null>(null);

  // Alle anzuzeigenden Einträge
  const alleEntries = useMemo<GalerieEntry[]>(() => {
    const showBeispiel = entries.length < BEISPIEL_SCHWELLE;
    const base = showBeispiel
      ? [...entries, ...(beamer ? BEISPIEL_PROFILE : [...BEISPIEL_PROFILE, LEER_RAHMEN])]
      : [...entries];
    return [...base, HAUSMEISTER];
  }, [entries, beamer]);

  const totalWidth = alleEntries.length * ITEM_STRIDE + 60;

  // Deterministische Layoutwerte pro Eintrag
  const layout = useMemo(() =>
    alleEntries.map(e => ({
      yOff:  (seededVal(e.id, 1) - 0.5) * 26,
      scale: 0.86 + seededVal(e.id, 2) * 0.26,
      rot:   (seededVal(e.id, 3) - 0.5) * 5.5,
    })), [alleEntries]);

  // Autoplay RAF
  useEffect(() => {
    if (!autoplay || alleEntries.length === 0) return;

    function step(t: number) {
      if (!lastTRef.current) lastTRef.current = t;
      const dt = Math.min(t - lastTRef.current, 60);
      lastTRef.current = t;

      setScrollOffset(prev => {
        const containerW = containerRef.current?.clientWidth ?? 380;
        const maxOffset  = Math.max(0, totalWidth - containerW + 40);
        const next = prev + (dt / 1000) * AUTOPLAY_SPEED * autoplayDirRef.current;
        if (next >= maxOffset) { autoplayDirRef.current = -1; return maxOffset; }
        if (next <= 0)         { autoplayDirRef.current =  1; return 0; }
        return next;
      });

      rafRef.current = requestAnimationFrame(step);
    }

    lastTRef.current = null;
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [autoplay, alleEntries.length, totalWidth]);

  // Pointer / Touch-Drag
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startOffset: scrollOffset };
    if (autoplay && !beamer) {
      setAutoplay(false);
      lastTRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
  }, [scrollOffset, autoplay, beamer]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const delta      = dragRef.current.startX - e.clientX;
    const containerW = containerRef.current?.clientWidth ?? 380;
    const maxOffset  = Math.max(0, totalWidth - containerW + 40);
    setScrollOffset(Math.max(0, Math.min(maxOffset, dragRef.current.startOffset + delta)));
  }, [totalWidth]);

  const onPointerUp = useCallback(() => { dragRef.current = null; }, []);

  // Windowing
  const containerW   = containerRef.current?.clientWidth ?? 380;
  const startIdx     = Math.max(0, Math.floor(scrollOffset / ITEM_STRIDE) - BUFFER);
  const endIdx       = Math.min(alleEntries.length - 1, Math.ceil((scrollOffset + containerW) / ITEM_STRIDE) + BUFFER);

  const centerOffset = scrollOffset + containerW / 2;
  const centerIdx    = Math.round(centerOffset / ITEM_STRIDE);

  // Antippen-Handler
  function handleAntippen(e: GalerieEntry) {
    if (beamer) return;
    if (e.istLeerRahmen)  { onDeinPlatzAntippen?.(); return; }
    if (e.istBeispiel || e.istInventar) { setBeispielDetail(e); return; }
    onPorträtAntippen?.(e);
  }

  // Leer-Zustand Beamer
  if (beamer && alleEntries.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes galerieGlow {
          0%,100% { box-shadow: 0 0 10px rgba(232,153,26,0.25); }
          50%      { box-shadow: 0 0 22px rgba(232,153,26,0.55); }
        }
        @keyframes kenBurnsGalerie {
          0%   { transform: scale(1)    translate(0px, 0px); }
          33%  { transform: scale(1.06) translate(-1%, 0.5%); }
          66%  { transform: scale(1.04) translate(1%, -0.5%); }
          100% { transform: scale(1.08) translate(-0.5%, 1%); }
        }
        @keyframes thekePuls { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.75)} }
      `}</style>

      <div
        ref={containerRef}
        onPointerDown={beamer ? undefined : onPointerDown}
        onPointerMove={beamer ? undefined : onPointerMove}
        onPointerUp={beamer ? undefined : onPointerUp}
        onPointerCancel={beamer ? undefined : onPointerUp}
        style={{
          position:    "relative",
          width:       "100%",
          height:      "100%",
          overflow:    "hidden",
          cursor:      beamer ? "none" : "grab",
          touchAction: "pan-x",
          userSelect:  "none",
        }}
      >
        {/* Parallax-Hintergrund (Backdrop scrollt langsamer) */}
        <div aria-hidden style={{
          position:            "absolute",
          inset:               0,
          backgroundImage:     `url(${THEKE_SZENE.BACKDROP_URL})`,
          backgroundRepeat:    "repeat-x",
          backgroundSize:      "auto 280%",
          backgroundPositionX: `${-scrollOffset * 0.38}px`,
          backgroundPositionY: "28%",
          filter:              "brightness(0.28) blur(1.5px)",
          zIndex:              0,
        }} />

        {/* Vignette links/rechts */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "linear-gradient(to right, rgba(10,7,4,0.65) 0%, transparent 12%, transparent 88%, rgba(10,7,4,0.65) 100%)",
        }} />

        {/* Porträt-Reihe */}
        <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
          {alleEntries.slice(startIdx, endIdx + 1).map((e, relIdx) => {
            const absIdx   = startIdx + relIdx;
            const physX    = absIdx * ITEM_STRIDE + 20;
            const anwesend = !e.istBeispiel && !e.istLeerRahmen && !e.istInventar &&
              !!(e.zuletzt_gesehen_am && (now - new Date(e.zuletzt_gesehen_am).getTime()) < 90_000);
            const l = layout[absIdx]!;

            return (
              <PorträtKarte
                key={e.id}
                entry={e}
                token={token}
                anwesend={anwesend}
                physX={physX}
                scrollOffset={scrollOffset}
                yOff={l.yOff}
                scale={l.scale}
                rot={l.rot}
                isCenter={absIdx === centerIdx && autoplay}
                onAntippen={handleAntippen}
              />
            );
          })}
        </div>

        {/* Leer-Zustand (keine Profile, kein Beamer) */}
        {!beamer && alleEntries.length === 0 && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 3,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <p style={{
              fontFamily: "'Lora', serif", fontStyle: "italic",
              color: fg(0.42), fontSize: "0.82rem", textAlign: "center",
              textShadow: "0 1px 8px rgba(0,0,0,0.95)", padding: "0 1rem",
            }}>
              Noch niemand an der Wand. Richte deinen Steckbrief ein.
            </p>
          </div>
        )}

        {/* „Lehn dich zurück"-Button */}
        {!beamer && !autoplay && alleEntries.length > 1 && (
          <button
            onClick={() => setAutoplay(true)}
            style={{
              position: "absolute", bottom: "0.6rem", right: "0.75rem", zIndex: 10,
              background: "rgba(10,7,4,0.72)", border: `1px solid ${am(0.32)}`,
              borderRadius: "20px", padding: "0.28rem 0.75rem",
              fontFamily: "'Lora', serif", fontStyle: "italic",
              fontSize: "0.62rem", color: am(0.75),
              cursor: "pointer", backdropFilter: "blur(4px)",
              letterSpacing: "0.03em",
            }}
          >
            ▶ Abspielen
          </button>
        )}

        {/* Autoplay-Pause-Indikator */}
        {!beamer && autoplay && (
          <button
            onClick={() => { setAutoplay(false); if (rafRef.current) cancelAnimationFrame(rafRef.current); }}
            style={{
              position: "absolute", bottom: "0.6rem", right: "0.75rem", zIndex: 10,
              background: "rgba(10,7,4,0.72)", border: `1px solid ${am(0.22)}`,
              borderRadius: "20px", padding: "0.28rem 0.75rem",
              fontFamily: "'Lora', serif", fontStyle: "italic",
              fontSize: "0.62rem", color: fg(0.35),
              cursor: "pointer", backdropFilter: "blur(4px)",
            }}
          >
            ◼ Pause
          </button>
        )}
      </div>

      {/* Beispiel-Detail-Overlay */}
      {beispielDetail && (
        <BeispielDetailOverlay
          entry={beispielDetail}
          onClose={() => setBeispielDetail(null)}
        />
      )}
    </>
  );
}
