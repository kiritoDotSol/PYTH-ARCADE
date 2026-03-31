import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Play, Pause } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const SPEED = 150;

export const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [highScore, setHighScore] = useState(0);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isOnSnake = snake.some(segment => segment.x === newFood!.x && segment.y === newFood!.y);
      if (!isOnSnake) break;
    }
    return newFood;
  }, [snake]);

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: (head.x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + direction.y + GRID_SIZE) % GRID_SIZE,
      };

      // Check collision with self
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        setIsPaused(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPaused, generateFood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
        case ' ': setIsPaused(p => !p); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    if (!isPaused && !gameOver) {
      gameLoopRef.current = setInterval(moveSnake, SPEED);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPaused, gameOver, moveSnake]);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood());
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-[#151619] rounded-2xl shadow-2xl border border-border max-w-2xl mx-auto">
      <div className="flex justify-between w-full mb-6">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-mono">Current Score</span>
          <span className="text-3xl font-mono text-foreground">{score}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-mono">High Score</span>
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-yellow-500" />
            <span className="text-3xl font-mono text-foreground">{highScore}</span>
          </div>
        </div>
      </div>

      <div 
        className="relative bg-black/40 border border-border rounded-lg overflow-hidden"
        style={{ 
          width: '400px', 
          height: '400px',
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
        }}
      >
        {/* Snake Body */}
        {snake.map((segment, i) => (
          <motion.div
            key={`${i}-${segment.x}-${segment.y}`}
            initial={false}
            animate={{ scale: 1 }}
            className={`rounded-sm ${i === 0 ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]' : 'bg-emerald-600/80'}`}
            style={{
              gridColumnStart: segment.x + 1,
              gridRowStart: segment.y + 1,
            }}
          />
        ))}

        {/* Food */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="bg-rose-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.8)]"
          style={{
            gridColumnStart: food.x + 1,
            gridRowStart: food.y + 1,
          }}
        />

        {/* Overlays */}
        <AnimatePresence>
          {(gameOver || isPaused) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10"
            >
              {gameOver ? (
                <>
                  <h2 className="text-4xl font-display uppercase tracking-tighter text-foreground mb-2">Game Over</h2>
                  <p className="text-foreground/60 mb-6 font-mono text-sm">Final Score: {score}</p>
                  <button
                    onClick={resetGame}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-8 rounded-full transition-all"
                  >
                    <RotateCcw size={20} />
                    Try Again
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-4xl font-display uppercase tracking-tighter text-foreground mb-6">Paused</h2>
                  <button
                    onClick={() => setIsPaused(false)}
                    className="flex items-center gap-2 bg-white hover:bg-white/90 text-black font-bold py-3 px-8 rounded-full transition-all"
                  >
                    <Play size={20} />
                    Resume
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 w-full">
        <div className="p-4 bg-white/5 rounded-xl border border-border">
          <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-mono block mb-2">Controls</span>
          <div className="flex gap-2 items-center text-foreground/80 text-xs font-mono">
            <kbd className="px-2 py-1 bg-white/10 rounded border border-border">Arrows</kbd>
            <span>to move</span>
          </div>
          <div className="flex gap-2 items-center text-foreground/80 text-xs font-mono mt-2">
            <kbd className="px-2 py-1 bg-white/10 rounded border border-border">Space</kbd>
            <span>to pause</span>
          </div>
        </div>
        <div className="p-4 bg-white/5 rounded-xl border border-border flex flex-col justify-center">
          <button 
            onClick={() => setIsPaused(p => !p)}
            className="flex items-center justify-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
            <span className="text-xs uppercase tracking-widest font-mono">{isPaused ? 'Resume Game' : 'Pause Game'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
