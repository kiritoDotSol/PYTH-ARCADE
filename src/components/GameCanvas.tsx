import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store';

import { hexToSeeds, mulberry32 } from '../utils/prng';
import { PYTH_ASSETS, formatPrice } from '../pyth';
import { useAssets } from '../hooks/useAssets';
import { getCurrentLevel } from '../lib/progression';
import { usePythPrices } from '../hooks/usePythPrices';

interface Vec2 {
  x: number;
  y: number;
}

interface Point extends Vec2 {
  time: number;
}

interface GameObject {
  id: string;
  assetId: string;
  symbol: string;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  spawnPrice: number;
  spawnExpo: number;
  currentPrice?: number;
  spawnTime: number;
  isSliced: boolean;
  sliceFeedback?: 'LONG' | 'SHORT' | 'PROFIT' | 'LOSS' | 'CRASH' | 'BONUS' | 'INSIDER';
  sliceAngle?: number;
  isHalf?: boolean;
  halfSide?: 'top' | 'bottom';
  rotation?: number;
  vr?: number;
  type?: 'normal' | 'bomb' | 'insider' | 'golden';
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  size: number;
}

interface GameCanvasProps {
  width: number;
  height: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const decrementLife = useGameStore(state => state.decrementLife);
  const resetCombo = useGameStore(state => state.resetCombo);
  const combo = useGameStore(state => state.combo);
  const status = useGameStore(state => state.status);
  const setStatus = useGameStore(state => state.setStatus);
  const difficulty = useGameStore(state => state.difficulty);
  const addPrediction = useGameStore(state => state.addPrediction);
  const addSliceAttempt = useGameStore(state => state.addSliceAttempt);

  const currentEntropy = useGameStore(state => state.currentEntropy);
  const { assets: cgAssets } = useAssets();

  const prngRef = useRef<(() => number) | null>(null);
  const imageCacheRef = useRef<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    if (Object.keys(cgAssets).length > 0) {
      Object.keys(cgAssets).forEach(sym => {
        if (!imageCacheRef.current[sym] && cgAssets[sym]?.image) {
          const img = new Image();
          img.src = cgAssets[sym].image;
          imageCacheRef.current[sym] = img;
        }
      });
    }
  }, [cgAssets]);

  useEffect(() => {
    if (status === 'PLAYING') {
      const seeds = hexToSeeds(currentEntropy || '0x42');
      prngRef.current = mulberry32(seeds[0]);
    }
  }, [status, currentEntropy]);
  
  const objectsRef = useRef<GameObject[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const trailRef = useRef<Point[]>([]);
  const requestRef = useRef<number>(null);
  const lastSpawnTime = useRef<number>(0);
  const nextSpawnInterval = useRef<number>(1500);
  const mousePos = useRef<Point | null>(null);
  const isMouseDown = useRef(false);
  const screenShakeRef = useRef<number>(0);

  const triggerShake = (intensity = 20) => {
    screenShakeRef.current = intensity;
  };

  const playSFX = (type: string, multiplier: number = 1) => {
    try {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (!AudioContextClass) return;
      
      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      switch (type) {
        case 'spawn':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
          break;
        case 'slice':
        case 'correct':
          oscillator.type = 'sine';
          // Increase pitch based on multiplier/combo
          const baseFreq = type === 'correct' ? 523.25 : 800;
          const freq = baseFreq * (1 + (multiplier - 1) * 0.05);
          oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
          break;
        case 'bomb':
        case 'wrong':
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(type === 'wrong' ? 150 : 100, audioCtx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.4);
          gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
          break;
        case 'combo':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
          oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.2); // C6
          gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
          break;
        default:
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
          gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      }

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
      
      // Close context after play to free resources
      setTimeout(() => audioCtx.close(), 600);
    } catch (e) {
      // Audio might be blocked
    }
  };

  const prices = usePythPrices();
  const xp = useGameStore(state => state.xp);
  const currentLevel = getCurrentLevel(xp);

  const spawnObject = () => {
    // Pick randomly from all available PYTH assets instead of locking to progression
    const availableAssets = PYTH_ASSETS;
    const asset = availableAssets[Math.floor((prngRef.current ? prngRef.current() : Math.random()) * availableAssets.length)];
    const priceData = prices[asset.symbol];
    if (!priceData) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Adjust speed and variation based on difficulty
    let speedMult = 1;
    let baseVy = -12;
    let varVy = 5;

    if (difficulty === 'easy') {
      speedMult = 0.8;
      baseVy = -10;
      varVy = 3;
    } else if (difficulty === 'hard') {
      speedMult = 1.3;
      baseVy = -14;
      varVy = 8;
    }

    const newObj: GameObject = {
      id: (prngRef.current ? prngRef.current() : Math.random()).toString(36).substr(2, 9),
      assetId: asset.id,
      symbol: asset.symbol,
      color: asset.color,
      x: (prngRef.current ? prngRef.current() : Math.random()) * (width - 150) + 75,
      y: height + 50,
      vx: ((prngRef.current ? prngRef.current() : Math.random()) - 0.5) * 6 * speedMult,
      vy: -(prngRef.current ? prngRef.current() : Math.random()) * varVy + baseVy,
      radius: 45,
      spawnPrice: priceData.price,
      spawnExpo: priceData.expo,
      spawnTime: Date.now(),
      isSliced: false,
      type: 'normal',
    };

    const rand = (prngRef.current ? prngRef.current() : Math.random());
    if (rand > 0.95) {
      newObj.type = 'golden';
      newObj.symbol = '🪙';
      newObj.color = '#eab308';
    } else if (rand > 0.90) {
      newObj.type = 'insider';
      newObj.symbol = '⚡';
      newObj.color = '#0ea5e9';
    } else if (rand > 0.82) {
      newObj.type = 'bomb';
      newObj.symbol = '💣';
      newObj.color = '#ef4444';
    }

    objectsRef.current.push(newObj);
    playSFX('spawn');
  };

  const createExplosion = (x: number, y: number, color: string, sliceAngle?: number) => {
    // Create 30 particles for a more substantial explosion
    for (let i = 0; i < 30; i++) {
      const isSpark = (prngRef.current ? prngRef.current() : Math.random()) > 0.7; // 30% chance for a white spark
      
      let vx, vy;
      if (sliceAngle !== undefined) {
        // Directional explosion based on slice angle
        // Spread particles roughly perpendicular to the slice, on both sides
        const side = (prngRef.current ? prngRef.current() : Math.random()) > 0.5 ? 1 : -1;
        const spread = ((prngRef.current ? prngRef.current() : Math.random()) - 0.5) * 1.5; // Spread around the perpendicular
        const finalAngle = sliceAngle + (Math.PI / 2) * side + spread;
        const speed = (prngRef.current ? prngRef.current() : Math.random()) * 12 + 4;
        vx = Math.cos(finalAngle) * speed;
        vy = Math.sin(finalAngle) * speed;
      } else {
        // Radial explosion
        vx = ((prngRef.current ? prngRef.current() : Math.random()) - 0.5) * 12;
        vy = ((prngRef.current ? prngRef.current() : Math.random()) - 0.5) * 12;
      }

      particlesRef.current.push({
        id: (prngRef.current ? prngRef.current() : Math.random()).toString(36).substr(2, 9),
        x,
        y,
        vx,
        vy,
        color: isSpark ? '#ffffff' : color,
        life: 1.5, // Increased from 1.0
        size: (prngRef.current ? prngRef.current() : Math.random()) * 8 + 3, // Increased from 5+2
      });
    }
  };

  const gameMode = useGameStore(state => state.gameMode);
  const setScore = useGameStore(state => state.setScore);
  const score = useGameStore(state => state.score);
  const setCombo = useGameStore(state => state.setCombo);
  const maxCombo = useGameStore(state => state.maxCombo);
  const setMaxCombo = useGameStore(state => state.setMaxCombo);

  const handleSlice = (obj: GameObject, sliceDir: 'up' | 'down', angle: number, forceCorrect: boolean = false) => {
    if (obj.isSliced) return;

    obj.isSliced = true;
    obj.sliceAngle = angle;
    const reactionTime = Date.now() - obj.spawnTime;

    const isUp = sliceDir === 'up';
    
    if (obj.type === 'bomb') {
      obj.sliceFeedback = 'CRASH';
      createExplosion(obj.x, obj.y, '#ef4444', angle);
      triggerShake(40);
      resetCombo();
      decrementLife();
      playSFX('wrong');
      addSliceAttempt(false);
    } else if (obj.type === 'golden') {
      obj.sliceFeedback = 'BONUS';
      createExplosion(obj.x, obj.y, '#eab308', angle);
      setScore(score + 500);
      playSFX('correct', combo + 1);
      addSliceAttempt(true, reactionTime);
    } else if (obj.type === 'insider') {
      obj.sliceFeedback = 'INSIDER';
      createExplosion(obj.x, obj.y, '#0ea5e9', angle);
      playSFX('correct', combo + 1);
      addSliceAttempt(true, reactionTime);
      // Auto correct slice: slice all other normal objects on screen correctly
      setTimeout(() => {
        const targets = objectsRef.current.filter(other => !other.isSliced && other.type === 'normal' && !other.isHalf);
        targets.forEach(other => {
          handleSlice(other, 'up', 0, true);
        });
      }, 100);
    } else {
      if (gameMode === 'LIVE') {
        const currentPriceData = prices[obj.symbol];
        if (currentPriceData) {
          const isPriceUp = currentPriceData.delta >= 0; // Use delta for direction
          const isCorrect = forceCorrect || ((isUp && isPriceUp) || (!isUp && !isPriceUp));
          
          obj.sliceFeedback = isCorrect ? 'PROFIT' : 'LOSS';
          const explosionColor = isCorrect ? '#bef264' : '#f43f5e';
          createExplosion(obj.x, obj.y, explosionColor, angle);

          if (isCorrect) {
            const newCombo = combo + 1;
            setCombo(newCombo);
            if (newCombo > maxCombo) setMaxCombo(newCombo);
            
            let multiplier = 1;
            if (newCombo >= 10) multiplier = 3;
            else if (newCombo >= 6) multiplier = 2;
            else if (newCombo >= 3) multiplier = 1.5;
            
            setScore(score + 100 * multiplier);
            playSFX('correct', newCombo);
            addSliceAttempt(true, reactionTime);
          } else {
            triggerShake(25);
            resetCombo();
            decrementLife();
            playSFX('wrong');
            addSliceAttempt(false);
          }
        } else {
          // Fallback if price data missing
          obj.sliceFeedback = isUp ? 'LONG' : 'SHORT';
          createExplosion(obj.x, obj.y, isUp ? '#bef264' : '#f43f5e', angle);
          playSFX('slice');
          addSliceAttempt(true, reactionTime);
        }
      } else {
        obj.sliceFeedback = isUp ? 'LONG' : 'SHORT';
        const explosionColor = isUp ? '#bef264' : '#f43f5e';
        createExplosion(obj.x, obj.y, explosionColor, angle);
        
        addPrediction({
          id: obj.id,
          symbol: obj.symbol,
          assetId: obj.assetId,
          spawnPrice: obj.spawnPrice,
          direction: sliceDir,
          guaranteedCorrect: forceCorrect
        });
        playSFX('slice');
        addSliceAttempt(true, reactionTime);
      }
    }
    
    // Create two independent halves
    const force = 4;
    // Calculate normal to the slice angle
    const nx = Math.cos(angle + Math.PI / 2);
    const ny = Math.sin(angle + Math.PI / 2);

    let halfColor = isUp ? 'rgba(190, 242, 100, 0.5)' : 'rgba(244, 63, 94, 0.5)';
    if (obj.type === 'bomb') halfColor = 'rgba(239, 68, 68, 0.5)';
    else if (obj.type === 'golden') halfColor = 'rgba(234, 179, 8, 0.5)';
    else if (obj.type === 'insider') halfColor = 'rgba(14, 165, 233, 0.5)';

    const half1: GameObject = {
      ...obj,
      id: (prngRef.current ? prngRef.current() : Math.random()).toString(36).substr(2, 9),
      isHalf: true,
      halfSide: 'top',
      vx: obj.vx - nx * force,
      vy: obj.vy - ny * force,
      rotation: angle,
      vr: -0.05 - (prngRef.current ? prngRef.current() : Math.random()) * 0.1,
      color: halfColor,
      sliceFeedback: undefined, // Only show feedback on the original or one half
    };

    const half2: GameObject = {
      ...obj,
      id: (prngRef.current ? prngRef.current() : Math.random()).toString(36).substr(2, 9),
      isHalf: true,
      halfSide: 'bottom',
      vx: obj.vx + nx * force,
      vy: obj.vy + ny * force,
      rotation: angle,
      vr: 0.05 + (prngRef.current ? prngRef.current() : Math.random()) * 0.1,
      color: halfColor,
      sliceFeedback: undefined,
    };

    objectsRef.current.push(half1, half2);
  };

  const animate = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate max volatility and global direction among active on-screen objects
    let maxVol = 0;
    objectsRef.current.forEach(obj => {
      const p = prices[obj.symbol];
      if (p && p.volatility > maxVol) maxVol = p.volatility;
    });

    // Render Volatility Edge Glow
    if (maxVol > 0.1) {
      const intensity = Math.min(1, maxVol);
      const pulse = Math.sin(time / 150) * 0.5 + 0.5;
      const alpha = intensity * 0.3 * pulse; // Max 0.3 opacity
      
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.height * 0.3,
        canvas.width / 2, canvas.height / 2, canvas.height * 0.8
      );
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      // Use red/orange for high volatility warning
      grad.addColorStop(1, `rgba(239, 68, 68, ${alpha})`); 
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.save();
    if (screenShakeRef.current > 0.5) {
      const dx = ((prngRef.current ? prngRef.current() : Math.random()) - 0.5) * screenShakeRef.current;
      const dy = ((prngRef.current ? prngRef.current() : Math.random()) - 0.5) * screenShakeRef.current;
      const dr = ((prngRef.current ? prngRef.current() : Math.random()) - 0.5) * (screenShakeRef.current * 0.001);
      ctx.translate(dx, dy);
      ctx.rotate(dr);
      screenShakeRef.current *= 0.92;
    }

    // Update and draw particles
    particlesRef.current = particlesRef.current.map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vy: p.vy + 0.1, // Gravity
      life: p.life - 0.015,
    })).filter(p => p.life > 0);

    particlesRef.current.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      
      // Add glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      
      ctx.beginPath();
      // Particles shrink as they lose life
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    if (status === 'PLAYING') {
      // Spawn logic
      if (time - lastSpawnTime.current > nextSpawnInterval.current) {
        spawnObject();
        lastSpawnTime.current = time;
        
        // Randomize next interval based on difficulty
        let min = 800;
        let max = 2200;
        
        if (difficulty === 'easy') {
          min = 1200;
          max = 3000;
        } else if (difficulty === 'hard') {
          min = 500;
          max = 1500;
        }
        
        nextSpawnInterval.current = (prngRef.current ? prngRef.current() : Math.random()) * (max - min) + min;
      }

      // Update objects
      objectsRef.current = objectsRef.current.map(obj => {
        const newObj = { ...obj };
        if (!obj.isSliced || obj.isHalf) {
          newObj.x += obj.vx;
          newObj.y += obj.vy;
          newObj.vy += 0.15; // Gravity
          if (obj.isHalf && obj.rotation !== undefined && obj.vr !== undefined) {
            newObj.rotation += obj.vr;
          }
        } else {
          // Original sliced object: just fall to keep feedback text moving
          newObj.y += 10;
        }
        return newObj;
      }).filter(obj => {
        const isOffScreen = obj.y >= height + 100;
        if (isOffScreen && !obj.isSliced && obj.type === 'normal') {
          // Missed normal asset - reset combo
          resetCombo();
          triggerShake(15);
        }
        return !isOffScreen;
      });

      // Collision detection with trail
      const trail = trailRef.current;
      if (trail.length > 1) {
        objectsRef.current.forEach(obj => {
          if (obj.isSliced) return;

          for (let i = 0; i < trail.length - 1; i++) {
            const p1 = trail[i];
            const p2 = trail[i+1];
            
            // Simple line-circle intersection
            const dist = distToSegment({ x: obj.x, y: obj.y }, p1, p2);
            if (dist < obj.radius) {
              const sliceDir = p2.y < p1.y ? 'up' : 'down';
              const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
              handleSlice(obj, sliceDir, angle);
              break;
            }
          }
        });
      }
    }

    // Draw objects
    objectsRef.current.forEach(obj => {
      ctx.save();
      ctx.translate(obj.x, obj.y);

      // Cast ambient shadow
      if (!obj.isHalf) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, obj.radius * 1.5, 0, Math.PI * 2);
        const isDark = document.documentElement.classList.contains('dark');
        ctx.fillStyle = isDark ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0)';
        ctx.shadowBlur = isDark ? 50 : 30;
        ctx.shadowColor = obj.color;
        // Draw an invisible shape just to cast the shadow
        ctx.fill();
        // Light inner glow
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, obj.radius * 1.8);
        grad.addColorStop(0, `${obj.color}${isDark ? '20' : '40'}`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }

      if (obj.isHalf && obj.rotation !== undefined && obj.halfSide) {
        // Draw independent half
        const angle = obj.rotation;
        
        ctx.save();
        ctx.rotate(angle);
        
        // Add a slight color variation for the split edge
        const splitColor = obj.halfSide === 'top' ? obj.color : '#ffffff';
        const innerColor = obj.halfSide === 'top' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)';

        ctx.shadowBlur = 15;
        ctx.shadowColor = obj.color;
        
        ctx.beginPath();
        if (obj.halfSide === 'top') {
          ctx.arc(0, 0, obj.radius, Math.PI, 0);
        } else {
          ctx.arc(0, 0, obj.radius, 0, Math.PI);
        }
        
        // Create a gradient for the "texture"
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, obj.radius);
        grad.addColorStop(0, splitColor);
        grad.addColorStop(1, obj.color);
        
        ctx.fillStyle = grad;
        ctx.fill();
        
        // Draw the inner cut surface
        ctx.beginPath();
        ctx.moveTo(-obj.radius, 0);
        ctx.lineTo(obj.radius, 0);
        ctx.strokeStyle = innerColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw symbol/price part
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        if (obj.halfSide === 'top') {
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText(obj.symbol, 0, -5);
        } else {
          ctx.font = '10px sans-serif';
          const priceText = formatPrice(obj.spawnPrice);
          ctx.fillText(priceText, 0, 15);
        }
        ctx.restore();
      } else if (!obj.isSliced) {
        if (obj.type === 'bomb') {
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#ef4444';
          ctx.beginPath();
          ctx.arc(0, 0, obj.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#18181b';
          ctx.fill();
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.stroke();
          
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'white';
          ctx.font = '30px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💣', 0, 0);
        } else if (obj.type === 'golden') {
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#eab308';
          ctx.beginPath();
          ctx.arc(0, 0, obj.radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(234, 179, 8, 0.3)';
          ctx.fill();
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 3;
          ctx.stroke();
          
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'white';
          ctx.font = '30px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🪙', 0, 0);
        } else if (obj.type === 'insider') {
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#0ea5e9';
          ctx.beginPath();
          ctx.arc(0, 0, obj.radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(14, 165, 233, 0.3)';
          ctx.fill();
          ctx.strokeStyle = '#0ea5e9';
          ctx.lineWidth = 3;
          ctx.stroke();
          
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'white';
          ctx.font = '30px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⚡', 0, 0);
        } else {
          // Determine dynamic color based on price trend
          const currentPriceData = prices[obj.symbol];
          const diff = currentPriceData ? currentPriceData.delta : 0;
          const isUp = diff >= 0;
          const deltaPct = currentPriceData && obj.spawnPrice > 0 ? (currentPriceData.delta / obj.spawnPrice) * 100 : 0;
          
      // Pulse effect before expiration (when falling near bottom)
      const isExpiring = obj.y > height - 180 && obj.vy > 0;
      if (isExpiring) {
        const pulse = 1 + Math.sin(Date.now() / 100) * 0.1;
        ctx.scale(pulse, pulse);
      }

          // Transparent purple for bullish, transparent grey for bearish
          const dynamicColor = isUp ? 'rgba(124, 58, 237, 0.5)' : 'rgba(128, 128, 128, 0.5)';
          const glowColor = isUp ? '#7c3aed' : '#808080';

          // Draw original circle
          ctx.shadowBlur = isExpiring ? 25 : 15;
          ctx.shadowColor = isExpiring ? '#ef4444' : glowColor;

          // Draw circle
          ctx.beginPath();
          ctx.arc(0, 0, obj.radius, 0, Math.PI * 2);
          ctx.fillStyle = dynamicColor;
          ctx.fill();

          // Add a thin border for clarity
          ctx.strokeStyle = isExpiring ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = isExpiring ? 2 : 1;
          ctx.stroke();

          // Draw text
          ctx.shadowBlur = 0;
          ctx.fillStyle = obj.color;
        
        // Glow styling for both text fallback and image
        ctx.shadowBlur = 15;
        ctx.shadowColor = obj.color;
        
        const cachedImg = imageCacheRef.current[obj.symbol];
        if (cachedImg && cachedImg.complete && cachedImg.naturalWidth > 0) {
           // Draw circular image with glow
           ctx.save();
           ctx.beginPath();
           ctx.arc(0, 0, obj.radius, 0, Math.PI * 2);
           ctx.closePath();
           ctx.clip(); // Ensure it acts exactly like rounded-full CSS
           ctx.drawImage(cachedImg, -obj.radius, -obj.radius, obj.radius * 2, obj.radius * 2);
           ctx.restore();
        } else {
           ctx.font = `900 ${obj.radius}px Arial`;
           ctx.textAlign = 'center';
           ctx.fillText(obj.symbol, 0, obj.radius/3);
        }
        
        // Price Delta Text
        ctx.font = '500 10px "JetBrains Mono", monospace';
        ctx.fillStyle = 'white';
          const priceText = formatPrice(obj.spawnPrice);
          ctx.fillText(priceText, 0, 15);

          // Draw mini price delta
          if (currentPriceData && diff !== 0) {
            ctx.font = '700 9px "JetBrains Mono", monospace';
            ctx.fillStyle = isUp ? '#bef264' : '#f43f5e';
            const deltaText = `${isUp ? '+' : ''}${deltaPct.toFixed(2)}%`;
            ctx.fillText(deltaText, 0, 28);
          }

          // Draw trend indicator with animation
          if (currentPriceData) {
            if (diff !== 0) {
              const indicatorColor = isUp ? '#bef264' : '#7c3aed'; // Lime for up, Purple for down
              const textWidth = ctx.measureText(priceText).width;
              const indicatorX = textWidth / 2 + 8;
              
              // Animated offset
              const animOffset = Math.sin(Date.now() / 150) * 3;
              const indicatorY = 12 + animOffset;

              ctx.beginPath();
              if (isUp) {
                // Upward triangle
                ctx.moveTo(indicatorX, indicatorY);
                ctx.lineTo(indicatorX - 4, indicatorY + 6);
                ctx.lineTo(indicatorX + 4, indicatorY + 6);
              } else {
                // Downward triangle
                ctx.moveTo(indicatorX, indicatorY + 6);
                ctx.lineTo(indicatorX - 4, indicatorY);
                ctx.lineTo(indicatorX + 4, indicatorY);
              }
              ctx.closePath();
              ctx.fillStyle = indicatorColor;
              ctx.fill();
            }
          }
        }
      }

      if (obj.isSliced && obj.sliceFeedback) {
        ctx.font = '900 20px Inter, sans-serif';
        let feedbackColor = '#ffffff';
        if (obj.sliceFeedback === 'LONG' || obj.sliceFeedback === 'PROFIT') feedbackColor = '#bef264';
        else if (obj.sliceFeedback === 'SHORT' || obj.sliceFeedback === 'LOSS') feedbackColor = '#f43f5e';
        else if (obj.sliceFeedback === 'CRASH') feedbackColor = '#ef4444';
        else if (obj.sliceFeedback === 'BONUS') feedbackColor = '#eab308';
        else if (obj.sliceFeedback === 'INSIDER') feedbackColor = '#0ea5e9';
        
        ctx.fillStyle = feedbackColor;
        ctx.fillText(obj.sliceFeedback, 0, -obj.radius - 10);
      }

      ctx.restore();
    });

    // Draw Combo
    if (status === 'PLAYING' && combo > 1) {
      ctx.save();
      ctx.font = '900 48px Inter, sans-serif';
      ctx.fillStyle = '#bef264'; // Lime for combo
      ctx.textAlign = 'right';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#7c3aed'; // Purple glow
      ctx.fillText(`${combo}x COMBO`, width - 40, height - 40);
      
      // Multiplier text
      let multiplier = '1x';
      if (combo >= 10) multiplier = '3x';
      else if (combo >= 6) multiplier = '2x';
      else if (combo >= 3) multiplier = '1.5x';
      
      if (multiplier !== '1x') {
        ctx.font = '700 24px "JetBrains Mono", monospace';
        ctx.fillText(`${multiplier} MULTIPLIER`, width - 40, height - 85);
      }
      ctx.restore();
    }

    // Draw trail
    const trail = trailRef.current;
    if (trail.length > 1) {
      ctx.save();
      
      const first = trail[0];
      const last = trail[trail.length - 1];
      const isUpward = last.y < first.y;
      
      // Use blade color from progression level
      const themeColor = currentLevel.bladeColor;
      const isDark = document.documentElement.classList.contains('dark');
      
      // 1. Outer Glow Pass (Wide & Soft)
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(trail[i].x, trail[i].y);
      }
      
      ctx.shadowBlur = isDark ? 50 : 20;
      ctx.shadowColor = themeColor;
      ctx.strokeStyle = themeColor;
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = isDark ? 0.3 : 0.4;
      ctx.stroke();
      
      // 2. Inner Glow Pass (Tighter & Brighter)
      ctx.shadowBlur = 20;
      ctx.lineWidth = 10;
      ctx.globalAlpha = 0.6;
      ctx.stroke();
      
      // 3. Core Pass (Tapering & Color Gradient)
      ctx.shadowBlur = isDark ? 0 : 5;
      ctx.globalAlpha = 1.0;
      
      for (let i = 0; i < trail.length - 1; i++) {
        const p1 = trail[i];
        const p2 = trail[i + 1];
        const progress = i / (trail.length - 1);
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        
        // Gradient from theme color (tail) to white (tip)
        // We use the progress to interpolate between the theme color and white
        const r = parseInt(themeColor.slice(1, 3), 16);
        const g = parseInt(themeColor.slice(3, 5), 16);
        const b = parseInt(themeColor.slice(5, 7), 16);
        
        const curR = Math.round(r + (255 - r) * progress);
        const curG = Math.round(g + (255 - g) * progress);
        const curB = Math.round(b + (255 - b) * progress);
        
        ctx.strokeStyle = `rgba(${curR}, ${curG}, ${curB}, ${progress})`;
        
        // Tapering width: starts thin, gets thicker towards the tip
        ctx.lineWidth = 1 + (progress * 8);
        ctx.stroke();
      }
      
      // 4. Sharp Tip Sparkle
      ctx.beginPath();
      ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ffffff';
      ctx.fill();
      
      ctx.restore();
    }

    // Clean up old trail points (increase lifetime from 250ms to 400ms)
    const now = Date.now();
    trailRef.current = trailRef.current.filter(p => now - p.time < 400);


    // Red flash on mistake
    if (screenShakeRef.current > 5) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.2, (screenShakeRef.current - 5) / 100);
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    ctx.restore(); // Restore from screen shake
  };

  useEffect(() => {
    let isRunning = true;
    
    const loop = (time: number) => {
      if (!isRunning) return;
      animate(time);
      requestRef.current = requestAnimationFrame(loop);
    };
    
    requestRef.current = requestAnimationFrame(loop);
    
    return () => {
      isRunning = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [status]); // Re-run loop when status changes to ensure it's active

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    isMouseDown.current = true;
    const pos = getPos(e);
    if (pos) {
      trailRef.current = [{ ...pos, time: Date.now() }];
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isMouseDown.current) return;
    const pos = getPos(e);
    if (pos) {
      trailRef.current.push({ ...pos, time: Date.now() });
    }
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      time: Date.now()
    };
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
    />
  );
};

// Helper functions for geometry
function dist2(v: Vec2, w: Vec2) { return Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2); }
function distToSegmentSquared(p: Vec2, v: Vec2, w: Vec2) {
  const l2 = dist2(v, w);
  if (l2 === 0) return dist2(p, v);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
}
function distToSegment(p: Vec2, v: Vec2, w: Vec2) { return Math.sqrt(distToSegmentSquared(p, v, w)); }
