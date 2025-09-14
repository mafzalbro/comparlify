'use client';

import { BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

const sparkVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: [0, 1.2, 0],
    opacity: [0, 1, 0],
    transition: {
      delay: i * 0.15,
      duration: 1.2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  }),
};

const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut'
        }
    }
}

export function AIGenerationLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 bg-muted/50 rounded-lg border-2 border-dashed my-8">
      <motion.div
        className="relative"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <BrainCircuit className="h-16 w-16 text-primary" />
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={sparkVariants}
            initial="hidden"
            animate="visible"
            className="absolute h-3 w-3 bg-primary rounded-full"
            style={{
              top: `${50 + 45 * Math.sin((i * 2 * Math.PI) / 5)}%`,
              left: `${50 + 45 * Math.cos((i * 2 * Math.PI) / 5)}%`,
              translateX: '-50%',
              translateY: '-50%',
            }}
          />
        ))}
      </motion.div>
      <motion.p 
        className="font-semibold text-muted-foreground"
        variants={textVariants}
        initial="hidden"
        animate="visible"
      >
        Our AI is thinking...
      </motion.p>
    </div>
  );
}
