import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE}/api`;
const ADMIN_PW = "#Boomer2026";
const PW_KEY = "emmerich_admin_auth";
const SECRET = "emmerich-orga-stats-2026";

type ScanResult =
  | { status: "ok"; personName: string; message: string }
  | { status: "already_used"; personName: string; message: string; usedAt: string }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string };

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === ADMIN_PW) { sessionStorage.setItem(PW_KEY, "1"); onAuth(); }
    else { setError(true); setInput(""); }
  };
  return (
    <div style={{ minHeight: "100svh", background: "#0a0704", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxWidth: "320px" }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.2rem", color: "#e8991a", textAlign: "center" }}>Einlass-Scanner</p>
        <input type="password" value={input} onChange={e => { setInput(e.target.value); setError(false); }} placeholder="Passwort" autoFocus
          style={{ background: "rgba(245,232,200,0.07)", border: `1px solid ${error ? "#e8991a" : "rgba(245,232,200,0.2)"}`, borderRadius: "3px", color: "#f5e8c8", padding: "0.75rem 1rem", fontSize: "1rem", fontFamily: "'Lora', serif", outline: "none" }} />
        {error && <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.9rem", color: "#e8991a", textAlign: "center", margin: 0 }}>Falsches Passwort.</p>}
        <button type="submit" style={{ background: "transparent", border: "1px solid #e8991a", borderRadius: "3px", color: "#e8991a", padding: "0.75rem", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1rem", cursor: "pointer" }}>Weiter</button>
      </form>
    </div>
  );
}

export default function EinlassPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(PW_KEY) === "1");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const cooldownRef = useRef(false);

  const startScanner = async () => {
    setResult(null);
    setScanning(true);
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (cooldownRef.current) return;
          cooldownRef.current = true;

          // Extract code from URL or use raw text
          let code = decodedText.trim().toUpperCase();
          const match = decodedText.match(/\/ticket\/([A-F0-9]{16})/i);
          if (match) code = match[1].toUpperCase();

          setLoading(true);
          try {
            const r = await fetch(`${API}/ticket/${code}/scan`, {
              method: "POST",
              headers: { "x-admin-secret": SECRET },
            });
            const data = await r.json();
            setResult(data);
          } catch {
            setResult({ status: "error", message: "Verbindungsfehler" });
          } finally {
            setLoading(false);
          }

          // Stop scanner after successful scan
          try {
            await scanner.stop();
            setScanning(false);
          } catch { /* ignore */ }
        },
        () => { /* ignore non-QR frames */ }
      );
    } catch {
      setResult({ status: "error", message: "Kamera konnte nicht gestartet werden. Bitte Berechtigung prüfen." });
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch { /* ignore */ }
    }
    setScanning(false);
  };

  const reset = () => {
    cooldownRef.current = false;
    setResult(null);
  };

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;

  const bgColor =
    result?.status === "ok" ? "#0a2e10" :
    result?.status === "already_used" ? "#2e1a0a" :
    result?.status === "invalid" || result?.status === "error" ? "#2e0a0a" :
    "#0a0704";

  return (
    <div style={{ minHeight: "100svh", background: bgColor, display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem 1rem", gap: "1.5rem", transition: "background 0.4s" }}>
      <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.3rem", color: "#e8991a", margin: 0 }}>
        Einlass-Scanner
      </p>

      {/* Scanner viewport */}
      {scanning && (
        <div style={{ width: "100%", maxWidth: "360px", borderRadius: "8px", overflow: "hidden", border: "2px solid #e8991a" }}>
          <div id="qr-reader" style={{ width: "100%" }} />
        </div>
      )}

      {/* Result display */}
      {result && !loading && (
        <div style={{
          width: "100%", maxWidth: "360px",
          borderRadius: "8px",
          border: `2px solid ${result.status === "ok" ? "#2ecc71" : result.status === "already_used" ? "#e8991a" : "#e74c3c"}`,
          padding: "1.5rem",
          textAlign: "center",
          background: "rgba(0,0,0,0.3)",
        }}>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "3rem",
            margin: "0 0 0.5rem",
          }}>
            {result.status === "ok" ? "✅" : result.status === "already_used" ? "⚠️" : "❌"}
          </p>
          {"personName" in result && (
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.4rem", color: "#f5e8c8", margin: "0 0 0.5rem" }}>
              {result.personName}
            </p>
          )}
          <p style={{ fontFamily: "'Lora', serif", fontSize: "1rem", color: "#f5e8c8", margin: "0 0 0.5rem" }}>
            {result.message}
          </p>
          {result.status === "already_used" && (
            <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.8rem", color: "rgba(245,232,200,0.6)", margin: 0 }}>
              Eingelöst um {new Date(result.usedAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
            </p>
          )}
        </div>
      )}

      {loading && (
        <p style={{ fontFamily: "'Lora', serif", color: "#e8991a", fontStyle: "italic" }}>Prüfe Ticket…</p>
      )}

      {/* Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "360px" }}>
        {!scanning && !result && (
          <button onClick={startScanner} style={btnStyle("#e8991a")}>
            Kamera starten &amp; scannen
          </button>
        )}
        {scanning && (
          <button onClick={stopScanner} style={btnStyle("rgba(245,232,200,0.3)")}>
            Abbrechen
          </button>
        )}
        {result && !scanning && (
          <button onClick={() => { reset(); startScanner(); }} style={btnStyle("#e8991a")}>
            Nächsten scannen
          </button>
        )}
      </div>

      {/* Manual code entry fallback */}
      <ManualEntry />
    </div>
  );
}

function ManualEntry() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(`${API}/ticket/${code.trim()}/scan`, {
        method: "POST",
        headers: { "x-admin-secret": SECRET },
      });
      const data = await r.json();
      setResult(data);
    } catch {
      setResult({ status: "error", message: "Verbindungsfehler" });
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ background: "transparent", border: "none", color: "rgba(245,232,200,0.35)", fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline" }}>
        Code manuell eingeben
      </button>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: "360px" }}>
      <form onSubmit={submit} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase()); setResult(null); }}
          placeholder="XXXXXXXXXXXXXXXX"
          maxLength={16}
          style={{ flex: 1, background: "rgba(245,232,200,0.07)", border: "1px solid rgba(245,232,200,0.2)", borderRadius: "3px", color: "#f5e8c8", padding: "0.6rem 0.75rem", fontSize: "0.9rem", fontFamily: "monospace", outline: "none", letterSpacing: "0.1em" }}
        />
        <button type="submit" disabled={loading} style={btnStyle("#e8991a", "0.6rem 1rem")}>
          Prüfen
        </button>
      </form>
      {result && (
        <p style={{ fontFamily: "'Lora', serif", fontSize: "0.85rem", color: result.status === "ok" ? "#2ecc71" : result.status === "already_used" ? "#e8991a" : "#e74c3c", marginTop: "0.5rem", textAlign: "center" }}>
          {"personName" in result ? `${result.personName} — ` : ""}{result.message}
        </p>
      )}
    </div>
  );
}

function btnStyle(borderColor: string, padding = "0.75rem"): React.CSSProperties {
  return {
    background: "transparent",
    border: `1px solid ${borderColor}`,
    borderRadius: "4px",
    color: borderColor,
    padding,
    fontFamily: "'Playfair Display', serif",
    fontStyle: "italic",
    fontSize: "1rem",
    cursor: "pointer",
    width: "100%",
  };
}
