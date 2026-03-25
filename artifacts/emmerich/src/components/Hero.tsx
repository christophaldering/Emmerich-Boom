import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

export function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const item = {
    hidden: { y: 100, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", bounce: 0.4, duration: 0.8 } },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image & Overlay */}
      <motion.div 
        style={{ y: y1, opacity }} 
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-background/80 mix-blend-multiply z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background z-10" />
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          alt="Hero abstract background"
          className="w-full h-full object-cover opacity-60"
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-start"
        >
          <motion.div variants={item} className="inline-block mb-4 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm">
            <span className="text-primary text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Available for new projects
            </span>
          </motion.div>

          <motion.h1 
            variants={item}
            className="text-7xl md:text-[9rem] lg:text-[12rem] font-display font-extrabold leading-[0.85] tracking-tighter text-foreground mb-2"
          >
            EMMERICH
          </motion.h1>

          <motion.div variants={item} className="flex flex-wrap items-center gap-4 md:gap-8 mb-8">
            <span className="text-5xl md:text-8xl font-display font-bold italic text-primary text-glow">
              boomt.
            </span>
            <div className="h-1 w-20 md:w-32 bg-primary mt-4 md:mt-8 rounded-full" />
          </motion.div>

          <motion.p 
            variants={item}
            className="max-w-2xl text-xl md:text-3xl text-muted-foreground font-light mb-12"
          >
            I build. I grow. <span className="text-foreground font-medium">I make things boom.</span> 
            <br className="hidden md:block" /> Bringing extreme velocity to digital products.
          </motion.p>

          <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" onClick={() => document.getElementById("work")?.scrollIntoView({ behavior: "smooth" })}>
              View My Work <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>
              Let's Connect
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Scroll</span>
        <div className="w-[1px] h-12 bg-border overflow-hidden">
          <motion.div 
            animate={{ y: [0, 48] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-full h-1/2 bg-primary"
          />
        </div>
      </motion.div>
    </section>
  );
}
