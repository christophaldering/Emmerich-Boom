import { motion } from "framer-motion";

export function About() {
  return (
    <section id="about" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <div className="aspect-square rounded-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-primary/20 mix-blend-overlay z-10" />
              <img 
                src={`${import.meta.env.BASE_URL}images/avatar.png`}
                alt="Emmerich Portrait" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-105 hover:scale-100"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10" />
            <div className="absolute -top-8 -left-8 w-32 h-32 border border-primary/30 rounded-full -z-10 animate-pulse" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <h2 className="text-primary font-bold tracking-widest uppercase mb-4">The Catalyst</h2>
            <h3 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-8">
              Obsessed with <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">
                momentum.
              </span>
            </h3>
            
            <div className="space-y-6 text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
              <p>
                I don't just build things; I make them thrive. My entire philosophy is rooted in velocity, uncompromising quality, and a relentless pursuit of the extraordinary. 
              </p>
              <p>
                Whether it's scaling a product from zero to one or reinventing a legacy brand, I bring an energetic, no-excuses approach to every project. When I'm on board, things happen fast.
              </p>
              <p className="text-foreground font-medium border-l-4 border-primary pl-6 py-2 italic">
                "Growth isn't an accident. It's engineered."
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
