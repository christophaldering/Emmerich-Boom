import { useState, useEffect } from "react";

const navLinks = [
  { label: "Start", href: "#start" },
  { label: "Event", href: "#event" },
  { label: "Playlist", href: "#playlist" },
  { label: "Galerie", href: "#galerie" },
  { label: "FAQ", href: "#faq" },
  { label: "Countdown", href: "#countdown" },
  { label: "Partner", href: "#partner" },
  { label: "Anmeldung", href: "#anmeldung" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = () => setOpen(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(14, 8, 22, 0.92)"
          : "rgba(14, 8, 22, 0.72)",
        backdropFilter: "blur(16px)",
        borderBottom: scrolled ? "1px solid hsl(268 28% 22%)" : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          <a
            href="#start"
            className="font-serif text-lg font-bold tracking-wide"
            style={{ color: "var(--gold)" }}
          >
            EMMERICH BOOMT!
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors duration-200"
                style={{ color: "hsl(40 25% 68%)" }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = "var(--gold)")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color = "hsl(40 25% 68%)")
                }
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#anmeldung"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded text-sm font-semibold transition-all duration-200"
              style={{
                background: "var(--gold)",
                color: "hsl(268 45% 7%)",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "hsl(38 88% 62%)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "var(--gold)")
              }
            >
              Jetzt anmelden
            </a>

            {/* Mobile burger */}
            <button
              className="lg:hidden flex flex-col gap-1.5 p-2"
              onClick={() => setOpen(!open)}
              aria-label="Menü öffnen"
            >
              <span
                className="block w-6 h-0.5 transition-all duration-300"
                style={{
                  background: "var(--gold)",
                  transform: open ? "translateY(8px) rotate(45deg)" : "",
                }}
              />
              <span
                className="block w-6 h-0.5 transition-all duration-300"
                style={{
                  background: "var(--gold)",
                  opacity: open ? 0 : 1,
                }}
              />
              <span
                className="block w-6 h-0.5 transition-all duration-300"
                style={{
                  background: "var(--gold)",
                  transform: open ? "translateY(-8px) rotate(-45deg)" : "",
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className="lg:hidden overflow-hidden transition-all duration-300"
        style={{
          maxHeight: open ? "400px" : "0",
          background: "rgba(14, 8, 22, 0.97)",
          borderBottom: open ? "1px solid hsl(268 28% 22%)" : "none",
        }}
      >
        <nav className="flex flex-col px-5 py-4 gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={handleNavClick}
              className="py-3 text-base font-medium border-b"
              style={{
                color: "hsl(40 25% 78%)",
                borderColor: "hsl(268 28% 18%)",
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#anmeldung"
            onClick={handleNavClick}
            className="mt-3 text-center py-3 rounded text-sm font-semibold"
            style={{ background: "var(--gold)", color: "hsl(268 45% 7%)" }}
          >
            Jetzt anmelden
          </a>
        </nav>
      </div>
    </header>
  );
}
