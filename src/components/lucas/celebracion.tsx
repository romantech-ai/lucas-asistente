'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Heart } from 'lucide-react';

interface CelebracionProps {
  show: boolean;
  onComplete?: () => void;
}

const confettiColors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'];

export default function Celebracion({ show, onComplete }: CelebracionProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
        >
          {/* Cat jumping animation */}
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.5 }}
            animate={{
              y: [100, -20, 0],
              opacity: 1,
              scale: [0.5, 1.2, 1],
              rotate: [0, -10, 10, 0]
            }}
            exit={{ y: 100, opacity: 0, scale: 0.5 }}
            transition={{
              duration: 0.8,
              times: [0, 0.5, 1],
              ease: 'easeOut'
            }}
            className="relative"
          >
            {/* Cat face SVG celebrating */}
            <svg
              viewBox="0 0 100 100"
              className="w-32 h-32 text-primary"
              fill="currentColor"
            >
              {/* Cat ears */}
              <path d="M20 45 L30 15 L45 40 Z" />
              <path d="M80 45 L70 15 L55 40 Z" />

              {/* Cat head */}
              <ellipse cx="50" cy="58" rx="35" ry="30" />

              {/* Inner ears */}
              <path d="M25 42 L32 22 L42 38 Z" fill="currentColor" opacity="0.3" />
              <path d="M75 42 L68 22 L58 38 Z" fill="currentColor" opacity="0.3" />

              {/* Happy closed eyes */}
              <path d="M32 52 Q38 48 44 52" stroke="#1a1a1a" strokeWidth="3" fill="none" />
              <path d="M56 52 Q62 48 68 52" stroke="#1a1a1a" strokeWidth="3" fill="none" />

              {/* Nose */}
              <ellipse cx="50" cy="62" rx="4" ry="3" fill="#ff9999" />

              {/* Big smile */}
              <path d="M35 68 Q50 82 65 68" stroke="#1a1a1a" strokeWidth="3" fill="none" />

              {/* Blush */}
              <ellipse cx="30" cy="62" rx="5" ry="3" fill="#ff9999" opacity="0.5" />
              <ellipse cx="70" cy="62" rx="5" ry="3" fill="#ff9999" opacity="0.5" />
            </svg>

            {/* Sparkles around */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-4 -right-4"
            >
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-4 -left-4"
            >
              <Star className="w-6 h-6 text-yellow-400" />
            </motion.div>
          </motion.div>

          {/* Floating hearts and stars */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                scale: 0,
                x: 0,
                y: 0
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0.5],
                x: (Math.random() - 0.5) * 300,
                y: (Math.random() - 0.5) * 300
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                ease: 'easeOut'
              }}
              className="absolute"
              style={{ color: confettiColors[i % confettiColors.length] }}
            >
              {i % 2 === 0 ? (
                <Heart className="w-6 h-6 fill-current" />
              ) : (
                <Star className="w-5 h-5 fill-current" />
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
