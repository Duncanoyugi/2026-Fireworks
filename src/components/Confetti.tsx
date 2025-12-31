// fireworks-2026/src/components/Confetti.tsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  shape: 'rect' | 'circle' | 'triangle' | 'star';
  speedX: number;
  speedY: number;
  rotationSpeed: number;
  element: HTMLDivElement | null;
}

export default function Confetti() {
  const containerRef = useRef<HTMLDivElement>(null);
  const piecesRef = useRef<ConfettiPiece[]>([]);
  const nextIdRef = useRef(0);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const colors = [
      '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', 
      '#118AB2', '#EF476F', '#7209B7', '#3A86FF',
      '#FB5607', '#8338EC', '#FF006E', '#FFBE0B'
    ];

    const shapes: ConfettiPiece['shape'][] = ['rect', 'circle', 'triangle', 'star'];

    // Initial confetti burst
    const createInitialBurst = () => {
      const pieces: ConfettiPiece[] = [];
      
      for (let i = 0; i < 150; i++) {
        const id = nextIdRef.current++;
        const piece: ConfettiPiece = {
          id,
          x: Math.random() * window.innerWidth,
          y: -50,
          rotation: Math.random() * 360,
          scale: Math.random() * 0.5 + 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          speedX: (Math.random() - 0.5) * 12,
          speedY: Math.random() * 6 + 4,
          rotationSpeed: (Math.random() - 0.5) * 15,
          element: null
        };
        
        pieces.push(piece);
        createConfettiElement(piece);
      }
      
      piecesRef.current = pieces;
    };

    const createConfettiElement = (piece: ConfettiPiece) => {
      const el = document.createElement('div');
      el.className = 'absolute pointer-events-none';
      el.dataset.id = piece.id.toString();
      
      // Style based on shape
      switch (piece.shape) {
        case 'circle':
          el.style.width = '12px';
          el.style.height = '12px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = piece.color;
          break;
        case 'triangle':
          el.style.width = '0';
          el.style.height = '0';
          el.style.borderLeft = '8px solid transparent';
          el.style.borderRight = '8px solid transparent';
          el.style.borderBottom = `14px solid ${piece.color}`;
          break;
        case 'star':
          el.innerHTML = '★';
          el.style.fontSize = '20px';
          el.style.color = piece.color;
          el.style.textShadow = '0 0 8px currentColor';
          break;
        default: // rect
          el.style.width = '14px';
          el.style.height = '8px';
          el.style.backgroundColor = piece.color;
          break;
      }
      
      el.style.transform = `translate(${piece.x}px, ${piece.y}px) rotate(${piece.rotation}deg) scale(${piece.scale})`;
      el.style.opacity = '0.9';
      
      containerRef.current?.appendChild(el);
      piece.element = el;
      
      // Animate with GSAP
      gsap.to(el, {
        y: window.innerHeight + 100,
        x: `+=${piece.speedX * 120}`,
        rotation: `+=${piece.rotationSpeed * 360}`,
        duration: Math.random() * 4 + 3,
        ease: "power2.out",
        delay: Math.random() * 0.5,
        onComplete: () => {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
          piecesRef.current = piecesRef.current.filter(p => p.id !== piece.id);
        }
      });
    };

    const addContinuousConfetti = () => {
      if (piecesRef.current.length < 200) {
        const id = nextIdRef.current++;
        const piece: ConfettiPiece = {
          id,
          x: Math.random() * window.innerWidth,
          y: -50,
          rotation: Math.random() * 360,
          scale: Math.random() * 0.4 + 0.6,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          speedX: (Math.random() - 0.5) * 10,
          speedY: Math.random() * 5 + 3,
          rotationSpeed: (Math.random() - 0.5) * 12,
          element: null
        };
        
        piecesRef.current.push(piece);
        createConfettiElement(piece);
      }
    };

    // Initial burst
    createInitialBurst();
    
    // Continuous confetti
    const interval = setInterval(addContinuousConfetti, 300);
    
    // Wind effect animation
    animationRef.current = gsap.to({}, {
      duration: 10,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      onUpdate: () => {
        piecesRef.current.forEach(piece => {
          if (piece.element) {
            gsap.to(piece.element, {
              x: `+=${(Math.random() - 0.5) * 2}`,
              duration: 0.5,
              ease: "sine.inOut"
            });
          }
        });
      }
    });

    return () => {
      clearInterval(interval);
      if (animationRef.current) {
        animationRef.current.kill();
      }
      const container = containerRef.current;
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-30 overflow-hidden"
    />
  );
}