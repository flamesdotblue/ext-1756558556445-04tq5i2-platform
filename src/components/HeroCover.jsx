import React from 'react';
import Spline from '@splinetool/react-spline';

export default function HeroCover() {
  return (
    <header className="relative h-[70vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/WCoEDSwacOpKBjaC/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/50 via-neutral-950/40 to-neutral-950/80 pointer-events-none" />

      <div className="relative z-10 h-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="space-y-6 pointer-events-none">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Testris
          </h1>
          <p className="text-neutral-200 max-w-xl text-lg">
            Stack, spin, and clear lines in a sleek, modern interface inspired by digital innovation.
          </p>
        </div>
      </div>
    </header>
  );
}
