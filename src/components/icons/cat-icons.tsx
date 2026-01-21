'use client';

import { cn } from '@/lib/utils';

interface IconProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const sizeMap = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function CatFaceIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn(sizeMap[size], className)}
    >
      <defs>
        <linearGradient id="catIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="catIconEarInner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f9a8d4" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
      </defs>

      {/* Ears */}
      <path d="M18 48 L28 12 L46 42 Z" fill="url(#catIconGradient)" />
      <path d="M82 48 L72 12 L54 42 Z" fill="url(#catIconGradient)" />

      {/* Inner ears */}
      <path d="M24 44 L30 20 L42 40 Z" fill="url(#catIconEarInner)" opacity="0.8" />
      <path d="M76 44 L70 20 L58 40 Z" fill="url(#catIconEarInner)" opacity="0.8" />

      {/* Head */}
      <ellipse cx="50" cy="58" rx="36" ry="32" fill="url(#catIconGradient)" />

      {/* Face highlight */}
      <ellipse cx="50" cy="52" rx="28" ry="22" fill="white" opacity="0.1" />

      {/* Eyes */}
      <ellipse cx="38" cy="52" rx="6" ry="7" fill="#1e1b4b" />
      <ellipse cx="62" cy="52" rx="6" ry="7" fill="#1e1b4b" />
      <circle cx="40" cy="49" r="2.5" fill="white" />
      <circle cx="64" cy="49" r="2.5" fill="white" />

      {/* Blush */}
      <ellipse cx="28" cy="60" rx="6" ry="4" fill="#fda4af" opacity="0.5" />
      <ellipse cx="72" cy="60" rx="6" ry="4" fill="#fda4af" opacity="0.5" />

      {/* Nose */}
      <ellipse cx="50" cy="62" rx="4" ry="3" fill="#fda4af" />
      <ellipse cx="50" cy="61" rx="2" ry="1" fill="white" opacity="0.4" />

      {/* Mouth */}
      <path d="M50 65 Q44 73 38 67" stroke="#1e1b4b" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M50 65 Q56 73 62 67" stroke="#1e1b4b" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Whiskers */}
      <g stroke="#1e1b4b" strokeWidth="1.2" strokeLinecap="round" opacity="0.6">
        <line x1="12" y1="55" x2="30" y2="58" />
        <line x1="12" y1="62" x2="30" y2="62" />
        <line x1="88" y1="55" x2="70" y2="58" />
        <line x1="88" y1="62" x2="70" y2="62" />
      </g>
    </svg>
  );
}

export function PawPrintIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn(sizeMap[size], className)}
    >
      <defs>
        <linearGradient id="pawGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>

      {/* Main pad */}
      <ellipse cx="50" cy="65" rx="22" ry="18" fill="url(#pawGradient)" />
      <ellipse cx="50" cy="62" rx="14" ry="10" fill="white" opacity="0.15" />

      {/* Toe pads */}
      <ellipse cx="28" cy="38" rx="10" ry="12" fill="url(#pawGradient)" />
      <ellipse cx="28" cy="35" rx="6" ry="7" fill="white" opacity="0.15" />

      <ellipse cx="72" cy="38" rx="10" ry="12" fill="url(#pawGradient)" />
      <ellipse cx="72" cy="35" rx="6" ry="7" fill="white" opacity="0.15" />

      <ellipse cx="42" cy="25" rx="9" ry="11" fill="url(#pawGradient)" />
      <ellipse cx="42" cy="22" rx="5" ry="6" fill="white" opacity="0.15" />

      <ellipse cx="58" cy="25" rx="9" ry="11" fill="url(#pawGradient)" />
      <ellipse cx="58" cy="22" rx="5" ry="6" fill="white" opacity="0.15" />
    </svg>
  );
}

export function CatFaceHappyIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn(sizeMap[size], className)}
    >
      <defs>
        <linearGradient id="catHappyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="catHappyEarInner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f9a8d4" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
      </defs>

      {/* Ears */}
      <path d="M18 48 L28 12 L46 42 Z" fill="url(#catHappyGradient)" />
      <path d="M82 48 L72 12 L54 42 Z" fill="url(#catHappyGradient)" />

      {/* Inner ears */}
      <path d="M24 44 L30 20 L42 40 Z" fill="url(#catHappyEarInner)" opacity="0.8" />
      <path d="M76 44 L70 20 L58 40 Z" fill="url(#catHappyEarInner)" opacity="0.8" />

      {/* Head */}
      <ellipse cx="50" cy="58" rx="36" ry="32" fill="url(#catHappyGradient)" />

      {/* Face highlight */}
      <ellipse cx="50" cy="52" rx="28" ry="22" fill="white" opacity="0.1" />

      {/* Happy closed eyes (^ ^) */}
      <path d="M32 52 Q38 46 44 52" stroke="#1e1b4b" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M56 52 Q62 46 68 52" stroke="#1e1b4b" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Blush */}
      <ellipse cx="28" cy="58" rx="7" ry="5" fill="#fda4af" opacity="0.6" />
      <ellipse cx="72" cy="58" rx="7" ry="5" fill="#fda4af" opacity="0.6" />

      {/* Nose */}
      <ellipse cx="50" cy="62" rx="4" ry="3" fill="#fda4af" />
      <ellipse cx="50" cy="61" rx="2" ry="1" fill="white" opacity="0.4" />

      {/* Big smile */}
      <path d="M38 67 Q50 80 62 67" stroke="#1e1b4b" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Whiskers */}
      <g stroke="#1e1b4b" strokeWidth="1.2" strokeLinecap="round" opacity="0.6">
        <line x1="12" y1="55" x2="30" y2="58" />
        <line x1="12" y1="62" x2="30" y2="62" />
        <line x1="88" y1="55" x2="70" y2="58" />
        <line x1="88" y1="62" x2="70" y2="62" />
      </g>
    </svg>
  );
}

export function CatFaceSleepyIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn(sizeMap[size], className)}
    >
      <defs>
        <linearGradient id="catSleepyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="catSleepyEarInner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f9a8d4" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
      </defs>

      {/* Ears */}
      <path d="M18 48 L28 12 L46 42 Z" fill="url(#catSleepyGradient)" />
      <path d="M82 48 L72 12 L54 42 Z" fill="url(#catSleepyGradient)" />

      {/* Inner ears */}
      <path d="M24 44 L30 20 L42 40 Z" fill="url(#catSleepyEarInner)" opacity="0.8" />
      <path d="M76 44 L70 20 L58 40 Z" fill="url(#catSleepyEarInner)" opacity="0.8" />

      {/* Head */}
      <ellipse cx="50" cy="58" rx="36" ry="32" fill="url(#catSleepyGradient)" />

      {/* Face highlight */}
      <ellipse cx="50" cy="52" rx="28" ry="22" fill="white" opacity="0.1" />

      {/* Sleepy closed eyes (- -) */}
      <path d="M32 52 Q38 50 44 52" stroke="#1e1b4b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M56 52 Q62 50 68 52" stroke="#1e1b4b" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Blush */}
      <ellipse cx="28" cy="60" rx="6" ry="4" fill="#fda4af" opacity="0.5" />
      <ellipse cx="72" cy="60" rx="6" ry="4" fill="#fda4af" opacity="0.5" />

      {/* Nose */}
      <ellipse cx="50" cy="62" rx="4" ry="3" fill="#fda4af" />

      {/* Small smile */}
      <path d="M44 68 Q50 72 56 68" stroke="#1e1b4b" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Whiskers */}
      <g stroke="#1e1b4b" strokeWidth="1.2" strokeLinecap="round" opacity="0.5">
        <line x1="12" y1="55" x2="30" y2="58" />
        <line x1="12" y1="62" x2="30" y2="62" />
        <line x1="88" y1="55" x2="70" y2="58" />
        <line x1="88" y1="62" x2="70" y2="62" />
      </g>

      {/* Zzz */}
      <text x="72" y="32" fill="#a78bfa" fontSize="14" fontWeight="bold" opacity="0.8">z</text>
      <text x="80" y="22" fill="#a78bfa" fontSize="11" fontWeight="bold" opacity="0.6">z</text>
    </svg>
  );
}
