import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GameHUD from './GameHUD';

const COLS = 10;
const ROWS = 20;

const SHAPES = {
  I: {
    color: '#22d3ee',
    rotations: [
      [ [0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0] ],
      [ [0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0] ],
    ],
  },
  J: {
    color: '#60a5fa',
    rotations: [
      [ [1,0,0], [1,1,1], [0,0,0] ],
      [ [0,1,1], [0,1,0], [0,1,0] ],
      [ [0,0,0], [1,1,1], [0,0,1] ],
      [ [0,1,0], [0,1,0], [1,1,0] ],
    ],
  },
  L: {
    color: '#f59e0b',
    rotations: [
      [ [0,0,1], [1,1,1], [0,0,0] ],
      [ [0,1,0], [0,1,0], [0,1,1] ],
      [ [0,0,0], [1,1,1], [1,0,0] ],
      [ [1,1,0], [0,1,0], [0,1,0] ],
    ],
  },
  O: {
    color: '#fbbf24',
    rotations: [
      [ [1,1], [1,1] ],
    ],
  },
  S: {
    color: '#34d399',
    rotations: [
      [ [0,1,1], [1,1,0], [0,0,0] ],
      [ [0,1,0], [0,1,1], [0,0,1] ],
    ],
  },
  T: {
    color: '#a78bfa',
    rotations: [
      [ [0,1,0], [1,1,1], [0,0,0] ],
      [ [0,1,0], [0,1,1], [0,1,0] ],
      [ [0,0,0], [1,1,1], [0,1,0] ],
      [ [0,1,0], [1,1,0], [0,1,0] ],
    ],
  },
  Z: {
    color: '#ef4444',
    rotations: [
      [ [1,1,0], [0,1,1], [0,0,0] ],
      [ [0,0,1], [0,1,1], [0,1,0] ],
    ],
  },
};

const SHAPE_KEYS = Object.keys(SHAPES);

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function randomPiece() {
  const key = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
  return { key, rotation: 0, x: 3, y: 0 };
}

function getMatrix(piece) {
  const def = SHAPES[piece.key];
  return def.rotations[piece.rotation % def.rotations.length];
}

function canPlace(board, piece, x, y, rotation = piece.rotation) {
  const def = SHAPES[piece.key];
  const mat = def.rotations[rotation % def.rotations.length];
  for (let r = 0; r < mat.length; r++) {
    for (let c = 0; c < mat[r].length; c++) {
      if (!mat[r][c]) continue;
      const nx = x + c;
      const ny = y + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return false;
      if (ny >= 0 && board[ny][nx]) return false;
    }
  }
  return true;
}

function merge(board, piece) {
  const newBoard = board.map(row => row.slice());
  const mat = getMatrix(piece);
  const color = SHAPES[piece.key].color;
  for (let r = 0; r < mat.length; r++) {
    for (let c = 0; c < mat[r].length; c++) {
      if (mat[r][c]) {
        const x = piece.x + c;
        const y = piece.y + r;
        if (y >= 0) newBoard[y][x] = color;
      }
    }
  }
  return newBoard;
}

function clearLines(board) {
  let cleared = 0;
  const newRows = [];
  for (let r = 0; r < ROWS; r++) {
    if (board[r].every(cell => cell)) {
      cleared++;
    } else {
      newRows.push(board[r]);
    }
  }
  while (newRows.length < ROWS) newRows.unshift(Array(COLS).fill(0));
  return { board: newRows, cleared };
}

function scoreForLines(lines) {
  // Standard-ish scoring per number of lines cleared at once
  switch (lines) {
    case 1: return 100;
    case 2: return 300;
    case 3: return 500;
    case 4: return 800;
    default: return 0;
  }
}

export default function GameBoard() {
  const [board, setBoard] = useState(createEmptyBoard);
  const [current, setCurrent] = useState(() => randomPiece());
  const [next, setNext] = useState(() => randomPiece());
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const dropInterval = useRef(null);

  const speedMs = useMemo(() => Math.max(1000 - (level - 1) * 80, 120), [level]);

  const nextMatrix4x4 = useMemo(() => {
    const m = getMatrix(next);
    // center into 4x4 for preview
    const preview = Array.from({ length: 4 }, () => Array(4).fill(0));
    const offsetY = Math.floor((4 - m.length) / 2);
    const offsetX = Math.floor((4 - m[0].length) / 2);
    for (let r = 0; r < m.length; r++) {
      for (let c = 0; c < m[r].length; c++) {
        if (m[r][c]) preview[offsetY + r][offsetX + c] = SHAPES[next.key].color;
      }
    }
    return preview;
  }, [next]);

  const reset = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrent(randomPiece());
    setNext(randomPiece());
    setRunning(false);
    setPaused(false);
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
  }, []);

  const hardDrop = useCallback(() => {
    if (!running || paused || gameOver) return;
    let y = current.y;
    while (canPlace(board, current, current.x, y + 1)) y++;
    const landed = { ...current, y };
    const merged = merge(board, landed);
    const { board: clearedBoard, cleared } = clearLines(merged);
    if (cleared) {
      setLines(prev => prev + cleared);
      setScore(prev => prev + scoreForLines(cleared) * level);
      const newTotalLines = lines + cleared;
      const newLevel = 1 + Math.floor(newTotalLines / 10);
      setLevel(newLevel);
    }
    const incoming = next;
    const spawn = { ...incoming, x: 3, y: 0, rotation: 0 };
    setBoard(clearedBoard);
    setCurrent(spawn);
    setNext(randomPiece());
    if (!canPlace(clearedBoard, spawn, spawn.x, spawn.y, spawn.rotation)) {
      setRunning(false);
      setGameOver(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, current, running, paused, gameOver, next, level, lines]);

  const tick = useCallback(() => {
    setCurrent(prev => {
      const nextY = prev.y + 1;
      if (canPlace(board, prev, prev.x, nextY)) {
        return { ...prev, y: nextY };
      }
      // lock piece
      const merged = merge(board, prev);
      const cleared = clearLines(merged);
      if (cleared.cleared) {
        setLines(l => l + cleared.cleared);
        setScore(s => s + scoreForLines(cleared.cleared) * level);
        setLevel(lv => 1 + Math.floor((lines + cleared.cleared) / 10));
      }
      const incoming = next;
      const spawn = { ...incoming, x: 3, y: 0, rotation: 0 };
      setBoard(cleared.board);
      setNext(randomPiece());
      if (!canPlace(cleared.board, spawn, spawn.x, spawn.y, spawn.rotation)) {
        setRunning(false);
        setGameOver(true);
        return prev; // keep as is
      }
      return spawn;
    });
  }, [board, next, level, lines]);

  useEffect(() => {
    if (running && !paused && !gameOver) {
      dropInterval.current = setInterval(tick, speedMs);
      return () => clearInterval(dropInterval.current);
    }
    return () => {};
  }, [running, paused, gameOver, tick, speedMs]);

  useEffect(() => {
    const onKey = (e) => {
      if (!running || paused || gameOver) return;
      if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp','Space',' '].includes(e.code)) e.preventDefault();
      if (e.code === 'ArrowLeft') move(-1);
      if (e.code === 'ArrowRight') move(1);
      if (e.code === 'ArrowDown') softDrop();
      if (e.code === 'ArrowUp') rotate();
      if (e.code === 'Space') hardDrop();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running, paused, gameOver, hardDrop]);

  const start = useCallback(() => {
    if (gameOver) reset();
    setRunning(true);
    setPaused(false);
  }, [gameOver, reset]);

  const pause = useCallback(() => setPaused(true), []);

  const rotate = useCallback(() => {
    setCurrent(prev => {
      const nextRot = (prev.rotation + 1) % SHAPES[prev.key].rotations.length;
      // Simple wall kick: try shifts
      const kicks = [0, -1, 1, -2, 2];
      for (const dx of kicks) {
        if (canPlace(board, prev, prev.x + dx, prev.y, nextRot)) {
          return { ...prev, rotation: nextRot, x: prev.x + dx };
        }
      }
      return prev;
    });
  }, [board]);

  const move = useCallback((dx) => {
    setCurrent(prev => {
      if (canPlace(board, prev, prev.x + dx, prev.y)) {
        return { ...prev, x: prev.x + dx };
      }
      return prev;
    });
  }, [board]);

  const softDrop = useCallback(() => {
    setCurrent(prev => {
      if (canPlace(board, prev, prev.x, prev.y + 1)) return { ...prev, y: prev.y + 1 };
      // lock when cannot move down
      const merged = merge(board, prev);
      const cleared = clearLines(merged);
      if (cleared.cleared) {
        setLines(l => l + cleared.cleared);
        setScore(s => s + scoreForLines(cleared.cleared) * level);
        setLevel(lv => 1 + Math.floor((lines + cleared.cleared) / 10));
      }
      const incoming = next;
      const spawn = { ...incoming, x: 3, y: 0, rotation: 0 };
      setBoard(cleared.board);
      setNext(randomPiece());
      if (!canPlace(cleared.board, spawn, spawn.x, spawn.y, spawn.rotation)) {
        setRunning(false);
        setGameOver(true);
        return prev;
      }
      return spawn;
    });
  }, [board, next, level, lines]);

  const cells = useMemo(() => {
    // compose board + current piece overlay
    const temp = board.map(row => row.slice());
    const mat = getMatrix(current);
    const color = SHAPES[current.key].color;
    for (let r = 0; r < mat.length; r++) {
      for (let c = 0; c < mat[r].length; c++) {
        if (mat[r][c]) {
          const x = current.x + c;
          const y = current.y + r;
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) temp[y][x] = color;
        }
      }
    }
    return temp;
  }, [board, current]);

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-8 items-start">
      <div className="mx-auto lg:mx-0">
        <div className="relative bg-neutral-900/60 border border-neutral-800 p-2 rounded-2xl shadow-lg">
          <div className="grid grid-cols-10 gap-[2px] bg-neutral-900 rounded-xl p-2">
            {cells.map((row, rIdx) => (
              <React.Fragment key={rIdx}>
                {row.map((cell, cIdx) => (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-[3px] bg-neutral-950"
                    style={{ background: cell ? cell : 'linear-gradient(180deg, #0b0b0b 0%, #0f0f0f 100%)', boxShadow: cell ? 'inset 0 0 6px rgba(0,0,0,0.5)' : 'none', border: '1px solid rgba(255,255,255,0.04)' }}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
          {gameOver && (
            <div className="absolute inset-0 backdrop-blur-sm bg-neutral-950/70 rounded-2xl flex items-center justify-center">
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold">Game Over</h3>
                <p className="text-neutral-300">Score {score} • Level {level}</p>
                <button onClick={reset} className="mt-2 px-4 py-2 rounded-lg bg-cyan-500 text-neutral-900 font-semibold hover:bg-cyan-400">Play Again</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <GameHUD
        score={score}
        level={level}
        lines={lines}
        nextMatrix={nextMatrix4x4}
        running={running}
        paused={paused}
        onStart={start}
        onPause={pause}
        onReset={reset}
      />
    </div>
  );
}
