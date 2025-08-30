import React from 'react';
import HeroCover from './components/HeroCover';
import GameBoard from './components/GameBoard';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white font-inter">
      <HeroCover />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Play Testris</h2>
          <p className="text-neutral-300 mt-2 max-w-prose">A modern, responsive twist on the timeless falling-blocks puzzle. Use Arrow keys to move, Arrow Up to rotate, and Space to hard drop.</p>
        </section>
        <GameBoard />
      </main>
      <Footer />
    </div>
  );
}
