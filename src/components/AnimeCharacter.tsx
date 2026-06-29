import React from "react";

export default function AnimeCharacter() {
  return (
    <div className="relative shrink-0 flex items-center justify-center select-none" id="anime-mascot-container">
      {/* Premium subtle glow background */}
      <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl animate-pulse" />
      
      <div className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center">
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-[0_4px_10px_rgba(16,185,129,0.3)]"
          id="anime-character-svg"
        >
          <defs>
            {/* Hair Gradient */}
            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" /> {/* Deep Indigo */}
              <stop offset="50%" stopColor="#0f172a" /> {/* Deep Slate */}
              <stop offset="100%" stopColor="#10b981" /> {/* Emerald Streak */}
            </linearGradient>

            {/* Hair Highlight Gradient */}
            <linearGradient id="hairHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>

            {/* Skin Shading Gradient */}
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fff1f2" /> {/* Pale Blush */}
              <stop offset="100%" stopColor="#fecdd3" /> {/* Soft Rose Shadow */}
            </linearGradient>

            {/* Eye Gradient */}
            <radialGradient id="eyeGrad" cx="50%" cy="50%" r="50%" fx="40%" fy="40%">
              <stop offset="0%" stopColor="#6ee7b7" /> {/* Light Mint */}
              <stop offset="70%" stopColor="#059669" /> {/* Rich Emerald */}
              <stop offset="100%" stopColor="#064e3b" /> {/* Deep forest */}
            </radialGradient>

            {/* Blush Gradient */}
            <radialGradient id="blush" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fda4af" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#fecdd3" stopOpacity="0" />
            </radialGradient>
            
            {/* Shadow Gradient for Neck */}
            <linearGradient id="neckShadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fda4af" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#fff1f2" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 1. Back hair (Long flowy locks behind ears) */}
          <path d="M 25 65 C 10 30, 110 30, 95 65 C 102 85, 98 105, 95 110 C 85 95, 80 85, 75 75 C 45 75, 40 85, 25 110 C 22 105, 18 85, 25 65 Z" fill="url(#hairGrad)" />
          
          {/* 2. Neck and Shoulders */}
          <path d="M 48 75 L 48 90 C 48 95, 72 95, 72 90 L 72 75 Z" fill="#ffe4e6" />
          {/* Shadow on Neck */}
          <path d="M 48 75 Q 60 85 72 75 L 72 81 Q 60 90 48 81 Z" fill="url(#neckShadow)" />

          {/* 3. Cool Outfit (High-collar futuristic black/emerald jacket) */}
          {/* Shoulder Base */}
          <path d="M 22 115 C 32 98, 88 98, 98 115 L 100 120 L 20 120 Z" fill="#0f172a" />
          
          {/* Jacket Collar flaps */}
          <path d="M 38 90 L 48 115 L 34 118 Z" fill="#1e293b" />
          <path d="M 82 90 L 72 115 L 86 118 Z" fill="#1e293b" />

          {/* Inner shirt (Teal/Emerald high collar with gold zip detail) */}
          <path d="M 46 88 L 74 88 L 68 112 L 52 112 Z" fill="#047857" />
          {/* Golden Zip Line */}
          <line x1="60" y1="88" x2="60" y2="112" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
          {/* Zipper Pull */}
          <circle cx="60" cy="94" r="2.5" fill="#fbbf24" />
          
          {/* Jacket outer zip lining in neon emerald */}
          <path d="M 38 90 L 48 115" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 82 90 L 72 115" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

          {/* 4. Head/Face Base */}
          {/* Chin & Jaw (Cute sharp anime chin) */}
          <path d="M 32 55 C 32 75, 42 85, 60 92 C 78 85, 88 75, 88 55 C 88 35, 32 35, 32 55 Z" fill="#ffe4e6" />

          {/* Cute Blush on cheeks */}
          <ellipse cx="42" cy="68" rx="8" ry="4" fill="url(#blush)" />
          <ellipse cx="78" cy="68" rx="8" ry="4" fill="url(#blush)" />

          {/* Small elegant nose */}
          <path d="M 59 64 L 60 67 L 58 68" fill="none" stroke="#f43f5e" strokeWidth="1" strokeLinecap="round" />

          {/* Cute content smile */}
          <path d="M 54 74 Q 60 78 66 74" fill="none" stroke="#9f1239" strokeWidth="2.2" strokeLinecap="round" />

          {/* 5. Big Beautiful Anime Eyes */}
          {/* LEFT EYE */}
          {/* Sclera & Eye Base */}
          <ellipse cx="46" cy="58" rx="7.5" ry="10" fill="#ffffff" />
          {/* Beautiful Iris */}
          <ellipse cx="47" cy="58" rx="6" ry="8.5" fill="url(#eyeGrad)" />
          {/* Dark pupil */}
          <ellipse cx="47" cy="58" rx="3.5" ry="5.5" fill="#022c22" />
          {/* Specular Sparkles (White reflections) */}
          <circle cx="44.5" cy="54" r="2.2" fill="#ffffff" />
          <circle cx="49.5" cy="61" r="1.2" fill="#ffffff" />
          <circle cx="44.5" cy="60" r="0.7" fill="#ffffff" />
          {/* Sharp Eyelashes / Eyelid */}
          <path d="M 37 54 C 41 49, 52 49, 55 54" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
          <path d="M 36 53 L 40 50" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" /> {/* Lash flick */}
          {/* Left Eyebrow (Expressive, elegant) */}
          <path d="M 37 45 Q 46 41 53 46" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />

          {/* RIGHT EYE */}
          {/* Sclera & Eye Base */}
          <ellipse cx="74" cy="58" rx="7.5" ry="10" fill="#ffffff" />
          {/* Beautiful Iris */}
          <ellipse cx="73" cy="58" rx="6" ry="8.5" fill="url(#eyeGrad)" />
          {/* Dark pupil */}
          <ellipse cx="73" cy="58" rx="3.5" ry="5.5" fill="#022c22" />
          {/* Specular Sparkles (White reflections) */}
          <circle cx="70.5" cy="54" r="2.2" fill="#ffffff" />
          <circle cx="75.5" cy="61" r="1.2" fill="#ffffff" />
          <circle cx="70.5" cy="60" r="0.7" fill="#ffffff" />
          {/* Sharp Eyelashes / Eyelid */}
          <path d="M 65 54 C 68 49, 79 49, 83 54" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
          <path d="M 84 53 L 80 50" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" /> {/* Lash flick */}
          {/* Right Eyebrow */}
          <path d="M 67 46 Q 74 41 83 45" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />


          {/* 6. Hair Bangs (Beautifully frame the face, covering forehead) */}
          {/* Center long strand */}
          <path d="M 60 25 L 60 52 C 58 46, 54 44, 52 48" fill="url(#hairGrad)" />
          {/* Side strands & bangs */}
          <path d="M 28 45 C 33 28, 48 24, 60 25 C 72 24, 87 28, 92 45 C 88 38, 83 38, 80 43 C 78 30, 68 32, 60 38 C 52 32, 42 30, 40 43 C 37 38, 32 38, 28 45 Z" fill="url(#hairGrad)" />
          
          {/* Long side locks framing the cheeks */}
          <path d="M 28 40 C 26 55, 30 75, 33 80 C 31 70, 29 55, 32 45 Z" fill="url(#hairGrad)" />
          <path d="M 92 40 C 94 55, 90 75, 87 80 C 89 70, 91 55, 88 45 Z" fill="url(#hairGrad)" />

          {/* Vibrant Emerald Streaks in bangs for gorgeous premium anime style */}
          <path d="M 44 32 Q 50 48 53 45 Q 48 30 44 32 Z" fill="#10b981" />
          <path d="M 76 32 Q 70 48 67 45 Q 72 30 76 32 Z" fill="#10b981" />

          {/* Hair Gloss Highlight Arc (The beautiful circular halo reflection seen in anime) */}
          <path d="M 36 34 C 44 26, 76 26, 84 34" fill="none" stroke="url(#hairHighlight)" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <path d="M 36 34 C 44 26, 76 26, 84 34" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        </svg>
      </div>
    </div>
  );
}
