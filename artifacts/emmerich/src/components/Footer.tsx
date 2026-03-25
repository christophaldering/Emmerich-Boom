export function Footer() {
  return (
    <footer className="py-12 border-t border-border bg-background text-center">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-2xl font-display font-bold">
          EMMERICH<span className="text-primary">.</span>
        </p>
        <p className="text-muted-foreground font-mono text-sm">
          &copy; {new Date().getFullYear()} Emmerich Boomt. All rights reserved.
        </p>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-sm font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
          Back to Top
        </button>
      </div>
    </footer>
  );
}
