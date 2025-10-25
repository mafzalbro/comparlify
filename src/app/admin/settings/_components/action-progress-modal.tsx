
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import type { ProgressState } from './data-management';

const iconMap = {
  cleaning: <Loader2 className="h-6 w-6 animate-spin" />,
  seeding: <Loader2 className="h-6 w-6 animate-spin" />,
  success: <CheckCircle className="h-6 w-6 text-green-500" />,
  error: <AlertTriangle className="h-6 w-6 text-destructive" />,
  idle: null
};

export function ActionProgressModal({ state }: { state: ProgressState }) {
  const { step, message } = state;

  return (
    <AnimatePresence>
      {step !== 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-popover p-6 rounded-lg shadow-xl flex items-center gap-4 text-popover-foreground"
          >
            {iconMap[step]}
            <span className="font-medium">{message}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
