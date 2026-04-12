"use client";

import { useState, useEffect } from "react";
import { BrainCircuit } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

const sparkVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: [0, 1.2, 0],
    opacity: [0, 1, 0],
    transition: {
      delay: i * 0.15,
      duration: 1.2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  }),
};

const textVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    },
  },
};

interface AIGenerationLoaderProps {
  show: boolean;
}

export function AIGenerationLoader({ show }: AIGenerationLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = [
    "Our AI is thinking...",
    "Scanning Knowledge Graph...",
    "Synthesizing Content...",
    "Optimizing Architecture...",
    "Refining Intelligence...",
    "Forging Creative Bridges...",
  ];

  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [show, messages.length]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl"
        >
          <div className="relative mb-12">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              <BrainCircuit className="h-24 w-24 text-primary drop-shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]" />
            </motion.div>
            
            {/* Pulsing rings around the brain */}
            <motion.div 
               animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute inset-0 rounded-full border-2 border-primary/20"
            />
            <motion.div 
               animate={{ scale: [1, 2], opacity: [0.3, 0] }}
               transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
               className="absolute inset-0 rounded-full border border-primary/10"
            />

            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={sparkVariants}
                initial="hidden"
                animate="visible"
                className="absolute h-2 w-2 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]"
                style={{
                  top: `${50 + 60 * Math.sin((i * 2 * Math.PI) / 8)}%`,
                  left: `${50 + 60 * Math.cos((i * 2 * Math.PI) / 8)}%`,
                  translateX: "-50%",
                  translateY: "-50%",
                }}
              />
            ))}
          </div>

          <div className="text-center space-y-4">
            <motion.div
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-8"
            >
              <p className="text-xl font-black uppercase tracking-[0.2em] text-primary italic">
                {messages[messageIndex]}
              </p>
            </motion.div>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest opacity-50">
              Forging Premium Output
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
