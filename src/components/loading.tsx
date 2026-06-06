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
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#060605] text-white" aria-busy="true">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/video/Black Simple Abstract Logo (2).mp4"
        autoPlay
        muted
        playsInline
      />

    </div>
  );
}
