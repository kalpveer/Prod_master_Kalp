/* eslint-disable */
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function CTA() {
  const ref = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    // Multiply by a smaller scalar for subtler magnetism
    setPosition({ x: middleX * 0.15, y: middleY * 0.15 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <section className="relative w-full py-40 bg-white flex flex-col items-center justify-center border-t border-black/5">
      
      <div className="container mx-auto px-6 max-w-2xl flex flex-col items-center text-center">
        
        {/* Magnetic Button */}
        <motion.a 
          href="https://productica-test-psi.vercel.app/"
          ref={ref}
          onMouseMove={handleMouse}
          onMouseLeave={reset}
          animate={{ x: position.x, y: position.y }}
          transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
          className="group relative cursor-pointer inline-block"
        >
          {/* Background glow expansion */}
          <div className="absolute inset-0 bg-black rounded-full opacity-10 group-hover:scale-125 group-hover:opacity-10 transition-all duration-700 ease-out blur-xl"></div>
          
          <motion.div 
            animate={{ x: position.x * 0.5, y: position.y * 0.5 }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className="relative px-12 py-6 bg-black text-white text-lg rounded-full font-medium tracking-wide transition-transform duration-300 ease-out flex items-center gap-4"
          >
            Enter Productica
            <svg 
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </motion.div>
        </motion.a>

        <p className="mt-12 text-sm uppercase tracking-[0.2em] font-medium text-black/40">
          Build what the market wants.
        </p>
        
      </div>
      
    </section>
  );
}
