import { motion } from "framer-motion";
import { Zap, Target, Rocket, Layers } from "lucide-react";

export function Skills() {
  const skills = [
    {
      icon: <Layers className="w-8 h-8 text-primary" />,
      title: "Creative Work",
      description: "Striking visual design, bold branding, and interfaces that refuse to be ignored."
    },
    {
      icon: <Rocket className="w-8 h-8 text-primary" />,
      title: "Growth",
      description: "Scaling user bases, engineering viral loops, and pushing metrics up and to the right."
    },
    {
      icon: <Target className="w-8 h-8 text-primary" />,
      title: "Vision",
      description: "Strategic foresight to position products not just for today, but for what's next."
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "Execution",
      description: "Shipping fast. No excuses. Turning ambitious concepts into production-ready reality."
    }
  ];

  return (
    <section id="skills" className="py-32 bg-secondary/30 relative border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-display font-bold mb-6"
          >
            How I Make It <span className="text-primary italic">Boom.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground"
          >
            A multi-disciplinary arsenal focused on one singular goal: impact.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skills.map((skill, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="bg-card border border-border p-10 rounded-2xl group hover:border-primary/50 transition-colors"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                {skill.icon}
              </div>
              <h3 className="text-2xl font-display font-bold mb-4">{skill.title}</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {skill.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
