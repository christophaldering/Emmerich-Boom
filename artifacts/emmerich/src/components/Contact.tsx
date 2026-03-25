import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate network request for the form
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <section id="contact" className="py-32 bg-secondary/50 border-t border-border relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-primary/10 rounded-[100%] blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl md:text-8xl font-display font-extrabold mb-6 leading-none">
              Ready to <br />
              <span className="text-primary italic">boom?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-md">
              Whether you need a full re-invention or just want to add extreme velocity to your current trajectory, let's talk.
            </p>
            
            <div className="space-y-6">
              <a href="mailto:hello@emmerich.boom" className="block text-2xl font-display font-bold hover:text-primary transition-colors">
                hello@emmerich.boom
              </a>
              <div className="flex gap-6">
                <a href="#" className="font-semibold uppercase tracking-widest text-sm text-muted-foreground hover:text-foreground transition-colors">Twitter</a>
                <a href="#" className="font-semibold uppercase tracking-widest text-sm text-muted-foreground hover:text-foreground transition-colors">LinkedIn</a>
                <a href="#" className="font-semibold uppercase tracking-widest text-sm text-muted-foreground hover:text-foreground transition-colors">Dribbble</a>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border p-8 md:p-12 rounded-2xl relative"
          >
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center text-center"
              >
                <CheckCircle2 className="w-20 h-20 text-primary mb-6" />
                <h3 className="text-3xl font-display font-bold mb-4">Message Received</h3>
                <p className="text-muted-foreground text-lg mb-8">
                  I'll get back to you with lightning speed. Prepare for impact.
                </p>
                <Button variant="outline" onClick={() => setSubmitted(false)}>
                  Send Another
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    required
                    className="w-full bg-background border border-border rounded-lg px-4 py-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    required
                    className="w-full bg-background border border-border rounded-lg px-4 py-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Message</label>
                  <textarea 
                    id="message" 
                    rows={4}
                    required
                    className="w-full bg-background border border-border rounded-lg px-4 py-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                    placeholder="Tell me about your project..."
                  />
                </div>
                <Button type="submit" size="lg" className="w-full mt-4" disabled={loading}>
                  {loading ? "Sending..." : "Ignite Connection"} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
