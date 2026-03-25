export default function Footer() {
  const links = [
    { label: "Impressum", href: "#" },
    { label: "Datenschutz", href: "#" },
    { label: "Kontakt", href: "#anmeldung" },
    { label: "FAQ", href: "#faq" },
    { label: "Partner", href: "#partner" },
    { label: "Playlist", href: "#playlist" },
    { label: "Galerie", href: "#galerie" },
  ];

  return (
    <footer
      className="py-14 border-t"
      style={{
        background: "hsl(268 45% 6%)",
        borderColor: "hsl(268 28% 17%)",
      }}
    >
      <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">
        <p className="font-serif text-xl font-bold mb-6" style={{ color: "var(--gold)" }}>
          EMMERICH BOOMT!
        </p>

        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-8">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm transition-colors duration-200"
              style={{ color: "hsl(40 15% 50%)" }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "var(--gold)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "hsl(40 15% 50%)")
              }
            >
              {link.label}
            </a>
          ))}
        </div>

        <p className="text-xs" style={{ color: "hsl(40 15% 38%)" }}>
          Sommer 2026. Musik, Menschen, Momente.
        </p>
      </div>
    </footer>
  );
}
