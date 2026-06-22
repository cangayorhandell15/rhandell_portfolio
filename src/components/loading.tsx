'use client';

import { useEffect } from 'react';

export default function LoadingScreen() {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-gradient-to-br from-[#030712] via-[#020617] to-[#0f172a] text-white flex items-center justify-center p-4" 
      aria-busy="true"
    >
      {/* Banayad na background glow para tumugma sa look ng portfolio */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(29,78,216,0.15),transparent_60%)] pointer-events-none" />

      <div className="relative w-full max-w-[420px] sm:max-w-[560px] aspect-[16/9] rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-slate-800/50 backdrop-blur-md">
        <video
          className="absolute inset-0 h-full w-full object-cover mix-blend-screen"
          src="/video/Black Simple Abstract Logo (2).mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onError={(e) => console.error('Video load error:', e)}
        />
        {/* Swabeng gradient overlay para mag-blend ang video edges sa background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/40" />
      </div>
    </div>
  );
}