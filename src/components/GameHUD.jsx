import React from 'react';
import { Play, Pause, RotateCcw, RefreshCw } from 'lucide-react';

export default function GameHUD({ score, level, lines, nextMatrix, running, paused, onStart, onPause, onReset }) {
  return (
    <div className="flex flex-col gap-6 w-full lg:w-80">
      <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
        <Stat label="Score" value={score} />
        <Stat label="Level" value={level} />
        <Stat label="Lines" value={lines} />
      </div>

      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
        <h4 className="text-sm text-neutral-300 mb-3">Next</h4>
        <div className="grid grid-cols-4 gap-1 w-36 h-36 p-2 bg-neutral-950/60 rounded-lg border border-neutral-800">
          {Array.from({ length: 16 }).map((_, i) => {
            const r = Math.floor(i / 4);
            const c = i % 4;
            const filled = nextMatrix?.[r]?.[c] || 0;
            const color = typeof filled === 'string' ? filled : filled ? '#22d3ee' : 'transparent';
            return (
              <div key={i} className="w-full h-full rounded-sm" style={{ backgroundColor: color }} />
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        {!running ? (
          <Button onClick={onStart} icon={<Play size={18} />} label="Start" />
        ) : paused ? (
          <Button onClick={onStart} icon={<Play size={18} />} label="Resume" />
        ) : (
          <Button onClick={onPause} icon={<Pause size={18} />} label="Pause" />
        )}
        <Button onClick={onReset} icon={<RefreshCw size={18} />} label="Reset" variant="secondary" />
      </div>

      <div className="text-sm text-neutral-400 space-y-1">
        <p className="font-medium text-neutral-300">Controls</p>
        <p>Left/Right: Move • Down: Soft drop</p>
        <p>Up: Rotate • Space: Hard drop</p>
        <p className="inline-flex items-center gap-1"><RotateCcw size={14} /> Clear lines to level up</p>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-neutral-950/60 rounded-lg px-3 py-2 border border-neutral-800">
      <div className="text-xs uppercase tracking-wide text-neutral-400">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function Button({ onClick, icon, label, variant = 'primary' }) {
  const base = 'inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors';
  const variants = {
    primary: 'bg-cyan-500 hover:bg-cyan-400 text-neutral-900 font-semibold',
    secondary: 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700',
  };
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}
