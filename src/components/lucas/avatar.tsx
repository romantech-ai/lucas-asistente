'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LucasAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  mood?: 'happy' | 'thinking' | 'sleeping' | 'excited';
  className?: string;
}

const sizeClasses = {
  xs: 'w-8 h-8',
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

const svgSizes = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-18 h-18',
  xl: 'w-24 h-24',
};

export default function LucasAvatar({
  size = 'md',
  animate = false,
  mood = 'happy',
  className
}: LucasAvatarProps) {
  return (
    <motion.div
      className={cn(
        'relative rounded-full flex items-center justify-center overflow-hidden',
        'bg-gradient-to-br from-violet-500/20 via-purple-500/15 to-fuchsia-500/10',
        'shadow-lg shadow-primary/10',
        sizeClasses[size],
        className
      )}
      animate={animate ? {
        scale: [1, 1.03, 1],
        rotate: [0, 1, -1, 0],
      } : {}}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      whileHover={{ scale: 1.05 }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-sm" />

      {/* Cat SVG */}
      <svg
        viewBox="0 0 100 100"
        className={cn('relative z-10', svgSizes[size])}
      >
        <defs>
          <linearGradient id="catGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="earInner" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f9a8d4" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/>
          </filter>
        </defs>

        {/* Cat ears */}
        <path d="M18 48 L28 12 L46 42 Z" fill="url(#catGradient)" filter="url(#shadow)" />
        <path d="M82 48 L72 12 L54 42 Z" fill="url(#catGradient)" filter="url(#shadow)" />

        {/* Inner ears */}
        <path d="M24 44 L30 20 L42 40 Z" fill="url(#earInner)" opacity="0.8" />
        <path d="M76 44 L70 20 L58 40 Z" fill="url(#earInner)" opacity="0.8" />

        {/* Cat head */}
        <ellipse cx="50" cy="58" rx="36" ry="32" fill="url(#catGradient)" filter="url(#shadow)" />

        {/* Face highlight */}
        <ellipse cx="50" cy="52" rx="28" ry="22" fill="white" opacity="0.1" />

        {/* Eyes */}
        {mood === 'sleeping' ? (
          <>
            <path d="M34 52 Q40 48 46 52" stroke="#1e1b4b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M54 52 Q60 48 66 52" stroke="#1e1b4b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        ) : mood === 'excited' ? (
          <>
            <ellipse cx="38" cy="50" rx="7" ry="8" fill="#1e1b4b" />
            <ellipse cx="62" cy="50" rx="7" ry="8" fill="#1e1b4b" />
            <circle cx="41" cy="47" r="3" fill="white" />
            <circle cx="65" cy="47" r="3" fill="white" />
            <circle cx="37" cy="52" r="1.5" fill="white" opacity="0.6" />
            <circle cx="61" cy="52" r="1.5" fill="white" opacity="0.6" />
          </>
        ) : (
          <>
            <ellipse cx="38" cy="52" rx="6" ry="7" fill="#1e1b4b" />
            <ellipse cx="62" cy="52" rx="6" ry="7" fill="#1e1b4b" />
            <circle cx="40" cy="49" r="2.5" fill="white" />
            <circle cx="64" cy="49" r="2.5" fill="white" />
          </>
        )}

        {/* Blush */}
        <ellipse cx="28" cy="60" rx="6" ry="4" fill="#fda4af" opacity="0.5" />
        <ellipse cx="72" cy="60" rx="6" ry="4" fill="#fda4af" opacity="0.5" />

        {/* Nose */}
        <ellipse cx="50" cy="62" rx="4" ry="3" fill="#fda4af" />
        <ellipse cx="50" cy="61" rx="2" ry="1" fill="white" opacity="0.4" />

        {/* Mouth */}
        {mood === 'happy' || mood === 'excited' ? (
          <>
            <path d="M50 65 Q44 73 38 67" stroke="#1e1b4b" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M50 65 Q56 73 62 67" stroke="#1e1b4b" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        ) : mood === 'thinking' ? (
          <ellipse cx="54" cy="68" rx="4" ry="3" fill="#1e1b4b" opacity="0.8" />
        ) : (
          <path d="M44 68 Q50 72 56 68" stroke="#1e1b4b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        )}

        {/* Whiskers */}
        <g stroke="#1e1b4b" strokeWidth="1.2" strokeLinecap="round" opacity="0.7">
          <line x1="12" y1="55" x2="30" y2="58" />
          <line x1="12" y1="62" x2="30" y2="62" />
          <line x1="12" y1="69" x2="30" y2="66" />
          <line x1="88" y1="55" x2="70" y2="58" />
          <line x1="88" y1="62" x2="70" y2="62" />
          <line x1="88" y1="69" x2="70" y2="66" />
        </g>

        {/* Thinking bubbles */}
        {mood === 'thinking' && (
          <>
            <circle cx="78" cy="30" r="3" fill="white" opacity="0.6" />
            <circle cx="84" cy="22" r="4" fill="white" opacity="0.5" />
            <circle cx="88" cy="12" r="5" fill="white" opacity="0.4" />
          </>
        )}

        {/* Sleeping Zs */}
        {mood === 'sleeping' && (
          <text x="70" y="35" fill="#a78bfa" fontSize="14" fontWeight="bold" opacity="0.7">z</text>
        )}

        {/* Sparkles for excited */}
        {mood === 'excited' && (
          <>
            <text x="15" y="35" fill="#fbbf24" fontSize="12">✦</text>
            <text x="80" y="30" fill="#fbbf24" fontSize="10">✦</text>
          </>
        )}
      </svg>
    </motion.div>
  );
}
