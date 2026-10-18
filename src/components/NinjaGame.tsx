import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../utils/audio';
import { Flame, Clock, Award, Volume2, VolumeX, ShieldAlert, Sparkles, Play } from 'lucide-react';

interface NinjaItem {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  vRot: number;
  type: 'fruit' | 'rbt' | 'bomb';
  name: string;
  emoji: string;
  color: string;
  points: number;
  isSliced: boolean;
  half1?: { x: number; y: number; vx: number; vy: number; rot: number };
  half2?: { x: number; y: number; vx: number; vy: number; rot: number };
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
}

interface BladePoint {
  x: number;
  y: number;
  time: number;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  alpha: number;
  color: string;
}

interface NinjaGameProps {
  studentName: string;
  className: string;
  roundNumber?: number; // 1, 2, or 3
  previousGameScore?: number;
  onFinishGame: (roundScore: number, totalGameScore: number) => void;
}

const ITEM_TYPES: Array<{
  type: 'fruit' | 'rbt' | 'bomb';
  name: string;
  emoji: string;
  color: string;
  points: number;
}> = [
  { type: 'fruit', name: 'Tembikai', emoji: '🍉', color: '#ef4444', points: 15 },
  { type: 'fruit', name: 'Epal', emoji: '🍎', color: '#dc2626', points: 10 },
  { type: 'fruit', name: 'Oren Segar', emoji: '🍊', color: '#f97316', points: 12 },
  { type: 'fruit', name: 'Pisang', emoji: '🍌', color: '#eab308', points: 12 },
  { type: 'fruit', name: 'Strawberi', emoji: '🍓', color: '#f43f5e', points: 15 },
  { type: 'fruit', name: 'Nanas', emoji: '🍍', color: '#facc15', points: 20 },
  { type: 'rbt', name: 'micro:bit', emoji: '💻', color: '#06b6d4', points: 25 },
  { type: 'rbt', name: 'Bayam Hidroponik', emoji: '🥬', color: '#22c55e', points: 25 },
  { type: 'rbt', name: 'Gunting Jahitan', emoji: '✂️', color: '#8b5cf6', points: 25 },
  { type: 'rbt', name: 'Motor Servo', emoji: '⚙️', color: '#3b82f6', points: 25 },
  { type: 'rbt', name: 'Uncang Fabrik', emoji: '🧵', color: '#ec4899', points: 25 },
  { type: 'bomb', name: 'BOM Ralat', emoji: '💣', color: '#18181b', points: -30 },
];

export const NinjaGame: React.FC<NinjaGameProps> = ({
  studentName,
  className: studentClass,
  roundNumber = 1,
  previousGameScore = 0,
  onFinishGame,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 1 MINIT PENUH!
  const [isMuted, setIsMuted] = useState(sound.getIsMuted());

  // Mutable game state held in refs for 60fps canvas loop
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(60); // 1 MINIT
  const itemsRef = useRef<NinjaItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const bladeTrailRef = useRef<BladePoint[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const isPointerDownRef = useRef(false);
  const lastSliceTimeRef = useRef(0);
  const comboCounterRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const nextSpawnTimeRef = useRef(0);
  const itemIdCounter = useRef(1);

  // Sync state with refs
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Reset round when roundNumber changes
  useEffect(() => {
    setGameState('ready');
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(60);
    timeLeftRef.current = 60;
  }, [roundNumber]);

  // Handle mute toggle
  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Start the game
  const startGame = () => {
    sound.playButtonClick();
    sound.startMusic();
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(60); // 1 MINIT
    timeLeftRef.current = 60;
    itemsRef.current = [];
    particlesRef.current = [];
    bladeTrailRef.current = [];
    floatingTextsRef.current = [];
    comboCounterRef.current = 0;
    setGameState('playing');
  };

  // Spawn flying items
  const spawnItems = (width: number, height: number) => {
    const count = Math.random() < 0.4 ? 3 : Math.random() < 0.7 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const isBomb = Math.random() < 0.18;
      let template;
      if (isBomb) {
        template = ITEM_TYPES.find((t) => t.type === 'bomb')!;
      } else {
        const nonBombs = ITEM_TYPES.filter((t) => t.type !== 'bomb');
        template = nonBombs[Math.floor(Math.random() * nonBombs.length)];
      }

      // Spawn near bottom spread across width
      const x = width * 0.15 + Math.random() * (width * 0.7);
      const y = height + 40;
      // Target velocity towards center upper region
      const targetX = width * 0.3 + Math.random() * (width * 0.4);
      const vx = (targetX - x) / (35 + Math.random() * 15);
      const vy = -(height * 0.02 + Math.random() * 4 + 7);

      itemsRef.current.push({
        id: itemIdCounter.current++,
        x,
        y,
        vx,
        vy,
        radius: 36,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.1,
        type: template.type,
        name: template.name,
        emoji: template.emoji,
        color: template.color,
        points: template.points,
        isSliced: false,
      });
    }
  };

  // Create splash particles on slice
  const createSplatter = (x: number, y: number, color: string, count = 18) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 6 + 3,
        alpha: 1,
        decay: Math.random() * 0.03 + 0.02,
      });
    }
  };

  // Add floating text (e.g., +25, COMBO x3!)
  const addFloatingText = (text: string, x: number, y: number, color: string) => {
    floatingTextsRef.current.push({
      id: Math.random(),
      text,
      x,
      y,
      alpha: 1,
      color,
    });
  };

  // Check collision between blade line segment and item circle
  const checkSlice = (p1: BladePoint, p2: BladePoint) => {
    const items = itemsRef.current;
    let slicedInThisSwipe = 0;

    items.forEach((item) => {
      if (item.isSliced) return;

      // Distance from point to line segment
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const lenSq = dx * dx + dy * dy;

      if (lenSq < 4) return; // Too slow or small movement

      let t = ((item.x - p1.x) * dx + (item.y - p1.y) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));

      const projX = p1.x + t * dx;
      const projY = p1.y + t * dy;
      const distSq = (item.x - projX) * (item.x - projX) + (item.y - projY) * (item.y - projY);

      if (distSq < item.radius * item.radius) {
        // Slice hit!
        item.isSliced = true;
        slicedInThisSwipe++;

        if (item.type === 'bomb') {
          sound.playBomb();
          createSplatter(item.x, item.y, '#ef4444', 30);
          addFloatingText('LETUPAN BOM! -30', item.x, item.y - 20, '#ef4444');
          scoreRef.current = Math.max(0, scoreRef.current - 30);
          setScore(scoreRef.current);
          comboCounterRef.current = 0;
          setCombo(0);
        } else {
          sound.playSlice();
          createSplatter(item.x, item.y, item.color, 20);

          // Split halves
          item.half1 = {
            x: item.x - 12,
            y: item.y,
            vx: item.vx - 3,
            vy: item.vy - 2,
            rot: item.rotation,
          };
          item.half2 = {
            x: item.x + 12,
            y: item.y,
            vx: item.vx + 3,
            vy: item.vy - 1,
            rot: item.rotation,
          };

          const pts = item.points;
          scoreRef.current += pts;
          setScore(scoreRef.current);
          addFloatingText(`+${pts} (${item.name})`, item.x, item.y - 10, item.color);
        }
      }
    });

    if (slicedInThisSwipe >= 2) {
      comboCounterRef.current += slicedInThisSwipe;
      setCombo(comboCounterRef.current);
      const bonus = slicedInThisSwipe * 10;
      scoreRef.current += bonus;
      setScore(scoreRef.current);
      addFloatingText(`COMBO x${slicedInThisSwipe}! +${bonus}`, p2.x, p2.y - 40, '#f59e0b');
    }
  };

  // Pointer event handlers (Mouse & Touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isPointerDownRef.current = true;
    bladeTrailRef.current = [{ x, y, time: performance.now() }];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing' || !isPointerDownRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = performance.now();

    const trail = bladeTrailRef.current;
    if (trail.length > 0) {
      const lastPoint = trail[trail.length - 1];
      checkSlice(lastPoint, { x, y, time: now });
    }

    trail.push({ x, y, time: now });
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
  };

  // Game countdown timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState('ended');
          sound.playFanfare();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Main 60 FPS Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Adjust canvas resolution to display size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Clear frame
      ctx.clearRect(0, 0, width, height);

      // Dark Dojo Grid / Wood Grain Canvas background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Subtle ambient dojo glow lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (gameState === 'playing') {
        // Spawn management
        if (time > nextSpawnTimeRef.current) {
          spawnItems(width, height);
          nextSpawnTimeRef.current = time + 1400 + Math.random() * 900;
        }

        // Gravity constant
        const gravity = 18;

        // Update and draw items
        const currentItems = itemsRef.current;
        for (let i = currentItems.length - 1; i >= 0; i--) {
          const item = currentItems[i];

          if (!item.isSliced) {
            item.vy += gravity * dt;
            item.x += item.vx;
            item.y += item.vy;
            item.rotation += item.vRot;

            // Draw intact item with glowing aura
            ctx.save();
            ctx.translate(item.x, item.y);
            ctx.rotate(item.rotation);

            // Shadow
            ctx.shadowColor = item.color;
            ctx.shadowBlur = 12;

            // Outer circle
            ctx.beginPath();
            ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = item.color;
            ctx.stroke();

            // Render emoji icon
            ctx.font = '36px "Segoe UI Emoji", AppleColorEmoji, "Noto Color Emoji", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.emoji, 0, 2);

            ctx.restore();

            // Draw label below item for easy RBT identification
            ctx.save();
            ctx.font = 'bold 11px sans-serif';
            ctx.fillStyle = '#f8fafc';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 4;
            ctx.fillText(item.name, item.x, item.y + item.radius + 14);
            ctx.restore();

            // Remove if dropped off-screen
            if (item.y > height + 80 && item.vy > 0) {
              currentItems.splice(i, 1);
            }
          } else if (item.half1 && item.half2) {
            // Draw sliced halves separating
            item.half1.vy += gravity * dt;
            item.half1.x += item.half1.vx;
            item.half1.y += item.half1.vy;
            item.half1.rot -= 0.08;

            item.half2.vy += gravity * dt;
            item.half2.x += item.half2.vx;
            item.half2.y += item.half2.vy;
            item.half2.rot += 0.08;

            // Half 1
            ctx.save();
            ctx.translate(item.half1.x, item.half1.y);
            ctx.rotate(item.half1.rot);
            ctx.font = '26px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.emoji, 0, 0);
            ctx.restore();

            // Half 2
            ctx.save();
            ctx.translate(item.half2.x, item.half2.y);
            ctx.rotate(item.half2.rot);
            ctx.font = '26px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.emoji, 0, 0);
            ctx.restore();

            if (item.half1.y > height + 100 && item.half2.y > height + 100) {
              currentItems.splice(i, 1);
            }
          }
        }

        // Update and draw splatter particles
        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 8 * dt; // gravity
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Draw and decay blade trail
        const trail = bladeTrailRef.current;
        const now = performance.now();
        // Remove points older than 180ms
        while (trail.length > 0 && now - trail[0].time > 180) {
          trail.shift();
        }

        if (trail.length >= 2) {
          ctx.save();
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          // Outer glowing blade
          for (let i = 1; i < trail.length; i++) {
            const p1 = trail[i - 1];
            const p2 = trail[i];
            const age = now - p2.time;
            const progress = 1 - age / 180;
            const widthBlade = Math.max(2, progress * 10);

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${progress * 0.9})`; // electric cyan
            ctx.lineWidth = widthBlade;
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 14;
            ctx.stroke();

            // Inner white core
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${progress})`;
            ctx.lineWidth = Math.max(1, widthBlade * 0.4);
            ctx.stroke();
          }
          ctx.restore();
        }

        // Floating popup score texts
        const fTexts = floatingTextsRef.current;
        for (let i = fTexts.length - 1; i >= 0; i--) {
          const ft = fTexts[i];
          ft.y -= 35 * dt;
          ft.alpha -= 0.8 * dt;

          if (ft.alpha <= 0) {
            fTexts.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = ft.alpha;
          ctx.font = 'bold 18px system-ui, sans-serif';
          ctx.fillStyle = ft.color;
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 6;
          ctx.textAlign = 'center';
          ctx.fillText(ft.text, ft.x, ft.y);
          ctx.restore();
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState]);

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 flex flex-col h-[calc(100dvh-70px)] sm:h-[580px] max-h-[100dvh]">
      {/* Top HUD Header - Ultra-compact single row on mobile */}
      <div className="px-3 py-2 sm:px-5 sm:py-3 bg-slate-800/95 backdrop-blur-md border-b border-slate-700 flex items-center justify-between gap-2 text-white shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-base sm:text-xl shrink-0 shadow-md">
            🥷
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs sm:text-base flex items-center gap-1.5 truncate">
              <span className="text-amber-400 truncate max-w-[110px] sm:max-w-[180px]">{studentName}</span>
              <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono shrink-0">
                {studentClass}
              </span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shrink-0">
                Pusingan {roundNumber}/3
              </span>
            </div>
            <div className="text-[10px] text-slate-400 hidden sm:block">RBT Ninja Fruit: 1 Minit Setiap Pusingan</div>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/80 border border-amber-500/30 text-amber-400">
            <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider hidden xs:inline">Skor:</span>
            <span className="font-extrabold text-sm sm:text-lg tabular-nums text-white">
              {(previousGameScore || 0) + score}
            </span>
          </div>

          <div
            className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border ${
              timeLeft <= 10
                ? 'bg-red-950/80 border-red-500/50 text-red-400 animate-pulse'
                : 'bg-slate-900/80 border-emerald-500/30 text-emerald-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="font-extrabold text-sm sm:text-lg tabular-nums">{timeLeft}s</span>
          </div>

          {combo > 1 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-[10px] sm:text-xs animate-bounce shrink-0">
              <Flame className="w-3 h-3" />
              x{combo}!
            </div>
          )}

          <button
            onClick={handleToggleSound}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors shrink-0 cursor-pointer"
            title={isMuted ? 'Buka Bunyi' : 'Senyap'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area - flex-1 fills remaining mobile height automatically */}
      <div className="flex-1 relative w-full select-none touch-none cursor-crosshair overflow-hidden">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="w-full h-full block touch-none"
        />

        {/* START SCREEN OVERLAY */}
        {gameState === 'ready' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-3 sm:p-6 text-center text-white z-10 overflow-y-auto">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-red-500 via-amber-500 to-emerald-500 p-0.5 mb-2 sm:mb-3 shadow-xl shadow-red-500/20 animate-pulse shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl sm:text-3xl">
                ⚔️
              </div>
            </div>

            <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
              {roundNumber === 1
                ? 'Pusingan 1 daripada 3'
                : roundNumber === 2
                ? 'Pusingan 2 daripada 3'
                : 'Pusingan 3: Pusingan Akhir!'}
            </div>

            <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white mb-1">
              {roundNumber === 1
                ? 'Latihan Menghiris Ninja (1 Minit)'
                : roundNumber === 2
                ? 'Pusingan Ke-2 Menghiris Ninja (1 Minit)'
                : 'Pusingan Terakhir Menghiris Ninja (1 Minit)'}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-sm mb-2.5 sm:mb-4 leading-relaxed">
              {roundNumber === 1
                ? 'Main selama 1 minit untuk kumpul skor permulaan sebelum menjawab 10 soalan pertama!'
                : roundNumber === 2
                ? 'Tahniah siap 10 soalan pertama! Sekarang main 1 minit lagi untuk gandakan skor anda!'
                : '1 minit terakhir untuk mengumpul mata ninja maksimum sebelum markah keseluruhan!'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 max-w-md w-full mb-3 sm:mb-5 text-[11px] sm:text-xs text-left bg-slate-900/80 p-2 sm:p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🍉</span>
                <span>Buah: <b>+10 - +20</b></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base">💻</span>
                <span>Alatan RBT: <b>+25 Bonus</b></span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-400 col-span-2 sm:col-span-1">
                <span className="text-base">💣</span>
                <span>Elak BOM: <b>-30</b></span>
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-6 py-2.5 sm:px-8 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-emerald-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Play className="w-5 h-5 fill-white" />
              MULA PUSINGAN {roundNumber} (1 MINIT)
            </button>
          </div>
        )}

        {/* GAME OVER SCREEN OVERLAY -> PROCEED TO QUIZ OR FINAL RESULTS */}
        {gameState === 'ended' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 text-center text-white z-10 animate-fade-in overflow-y-auto">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-2xl mb-1.5 shrink-0">
              🏆
            </div>

            <h3 className="text-lg sm:text-2xl font-black text-amber-400 mb-0.5">
              Syabas, {studentName}!
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm mb-2 sm:mb-3">
              {roundNumber === 1
                ? 'Pusingan 1 (1 Minit) Tamat!'
                : roundNumber === 2
                ? 'Pusingan 2 (1 Minit) Tamat!'
                : 'Pusingan Akhir (1 Minit) Tamat!'}
            </p>

            <div className="bg-slate-900 border border-amber-500/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4 shadow-xl max-w-xs w-full">
              <div className="text-xs uppercase font-bold text-amber-400 tracking-wider mb-1">
                Skor Pusingan {roundNumber}: <span className="text-white font-black">+{score}</span>
              </div>
              <div className="text-2xl sm:text-4xl font-black text-white tabular-nums">
                {(previousGameScore || 0) + score}{' '}
                <span className="text-sm sm:text-lg font-bold text-amber-400">mata terkumpul</span>
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 mt-1">
                {roundNumber === 1
                  ? 'Seterusnya: Jawab 10 soalan pertama RBT (Bahagian 1).'
                  : roundNumber === 2
                  ? 'Seterusnya: Jawab 10 soalan kedua RBT (Bahagian 2).'
                  : 'Selesai semua pusingan! Mari lihat markah keseluruhan anda.'}
              </div>
            </div>

            <button
              onClick={() => {
                sound.playButtonClick();
                onFinishGame(score, (previousGameScore || 0) + score);
              }}
              className="px-6 py-2.5 sm:px-8 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {roundNumber === 1
                  ? 'TERUSKAN KE 10 SOALAN (BAHAGIAN 1)'
                  : roundNumber === 2
                  ? 'TERUSKAN KE 10 SOALAN (BAHAGIAN 2)'
                  : 'LIHAT MARKAH KESELURUHAN'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Instruction footer */}
      <div className="px-3 py-1.5 sm:px-5 sm:py-2 bg-slate-950 text-slate-400 text-[10px] sm:text-xs flex items-center justify-between border-t border-slate-800 shrink-0">
        <span>💡 Leret jari di skrin telefon anda untuk memotong.</span>
        <span className="hidden sm:inline">RBT Tahun 5 KSSR Semakan</span>
      </div>
    </div>
  );
};
