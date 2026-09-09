/* eslint-disable */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Preloader({ onComplete, isLoading }: { onComplete: () => void, isLoading: boolean }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Lock scrolling
    document.body.style.overflow = 'hidden';
    
    const duration = 1500; 
    const intervalTime = 20;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      let nextProgress = (currentStep / steps) * 100;

      // Real-time synchronization:
      // If assets are still loading, pause at 95%
      if (nextProgress >= 95 && isLoading) {
        nextProgress = 95;
      } else if (nextProgress >= 100) {
        nextProgress = 100;
        clearInterval(timer);
        setTimeout(() => {
          document.body.style.overflow = '';
          onComplete();
        }, 600);
      }
      
      setProgress(nextProgress);
    }, intervalTime);

    return () => {
      clearInterval(timer);
      document.body.style.overflow = '';
    };
  }, [onComplete, isLoading]);

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: '-100%' }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay: 2.5 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
    >
      <div className="relative overflow-hidden">
        <motion.h1 
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-4xl md:text-6xl font-semibold tracking-tighter text-white uppercase pr-[0.05em]"
        >
          Productica
        </motion.h1>
      </div>
      
      <div className="mt-8 flex items-center justify-center gap-4">
        <div className="h-[1px] w-48 bg-white/10 overflow-hidden relative">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <span className="text-xs font-mono text-white/50 w-8 text-right">
          {Math.round(progress)}%
        </span>
      </div>
    </motion.div>
  );
}
