import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export function Projects() {
  const projects = [
    {
      title: "Neon Velocity",
      category: "Fintech Interface",
      image: "project-1.png",
      description: "A high-speed trading platform designed for maximum readability under extreme cognitive load. Brutalist, fast, undeniable."
    },
    {
      title: "Apex Growth",
      category: "Viral Campaign",
      image: "project-2.png",
      description: "A multi-channel marketing assault that scaled a consumer app from 10k to 1M+ active users in under six months."
    },
    {
      title: "Quantum Shift",
      category: "Brand Re-invention",
      image: "project-3.png",
      description: "A complete visual and strategic overhaul for a legacy tech firm, dragging them kicking and screaming into the modern era."
    }
  ];

  return (
    <section id="work" className="py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-primary font-bold tracking-widest uppercase mb-4">Selected Work</h2>
            <h3 className="text-4xl md:text-6xl font-display font-bold">
              Proof of <br/> <span className="text-muted-foreground">Impact.</span>
            </h3>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-md text-lg text-muted-foreground"
          >
            I let the results speak for themselves. Here are a few times I brought the boom.
          </motion.p>
        </div>

        <div className="flex flex-col gap-24">
          {projects.map((project, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className={`flex flex-col gap-10 ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center group`}
            >
              {/* Image */}
              <div className="w-full lg:w-3/5 aspect-[4/3] rounded-2xl overflow-hidden relative border border-border group-hover:border-primary/50 transition-colors">
                <div className="absolute inset-0 bg-background/20 group-hover:bg-transparent transition-colors z-10" />
                <img 
                  src={`${import.meta.env.BASE_URL}images/${project.image}`}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Info */}
              <div className="w-full lg:w-2/5 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4">
                  <span className="h-px w-8 bg-primary block" />
                  <span className="text-primary font-mono tracking-wider text-sm uppercase">{project.category}</span>
                </div>
                <h4 className="text-4xl md:text-5xl font-display font-bold mb-6 group-hover:text-primary transition-colors">
                  {project.title}
                </h4>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  {project.description}
                </p>
                <button className="flex items-center gap-2 text-lg font-bold uppercase tracking-wider hover:text-primary transition-colors w-fit pb-1 border-b-2 border-transparent hover:border-primary">
                  View Case Study <ArrowUpRight className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
