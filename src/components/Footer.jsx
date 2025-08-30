import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-800 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>
          © {new Date().getFullYear()} Testris. Built with React + Vite + Tailwind.
        </p>
        <p>
          Use Arrow keys to move, Up to rotate, Space to hard drop.
        </p>
      </div>
    </footer>
  );
}
