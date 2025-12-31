import { Particle } from "./Particle";
import { soundManager } from "./SoundManager";

export type FireworkType = 'peony' | 'willow' | 'ring' | 'crackle' | 'palm' | 'crossette';

interface FireworkConfig {
  x: number;
  startY: number;
  targetY: number;
  color?: string;
  type?: FireworkType;
  size?: number;
}

export class Firework {
  x: number;
  y: number;
  startY: number;
  targetY: number;
  speed: number;
  color: string;
  type: FireworkType;
  size: number;
  particles: Particle[] = [];
  exploded = false;
  trail: { x: number; y: number }[] = [];
  maxTrail = 5;
  soundPlayed = false;

  constructor(config: FireworkConfig) {
    this.x = config.x;
    this.y = config.startY;
    this.startY = config.startY;
    this.targetY = config.targetY;
    this.speed = Math.random() * 3 + 4;
    this.color = config.color || this.getRandomColor();
    this.type = config.type || this.getRandomType();
    this.size = config.size || 1;
  }

  private getRandomColor(): string {
    const hues = [0, 30, 60, 120, 180, 240, 300, 330]; // Red, orange, yellow, green, cyan, blue, purple, pink
    const hue = hues[Math.floor(Math.random() * hues.length)];
    return `hsl(${hue}, 100%, 70%)`;
  }

  private getRandomType(): FireworkType {
    const types: FireworkType[] = ['peony', 'willow', 'ring', 'crackle', 'palm', 'crossette'];
    return types[Math.floor(Math.random() * types.length)];
  }

  update() {
    if (!this.exploded) {
      // Play whoosh sound when launching
      if (!this.soundPlayed) {
        soundManager.playWhoosh(1, 0.2 * this.size);
        this.soundPlayed = true;
      }

      // Add to trail
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > this.maxTrail) {
        this.trail.shift();
      }

      // Move upward
      const distanceToTarget = this.targetY - this.y;
      const speed = Math.min(this.speed, Math.abs(distanceToTarget) * 0.1);
      this.y -= speed;

      // Check if reached target
      if (this.y <= this.targetY) {
        this.explode();
      }
    }

    // Update particles
    this.particles = this.particles.filter((p) => !p.isDead());
    this.particles.forEach((p) => p.update());
  }

  explode() {
    this.exploded = true;
    soundManager.playBang(this.size, 0.3 * this.size);
    
    switch (this.type) {
      case 'peony':
        this.createPeony();
        break;
      case 'willow':
        this.createWillow();
        break;
      case 'ring':
        this.createRing();
        break;
      case 'crackle':
        this.createCrackle();
        break;
      case 'palm':
        this.createPalm();
        break;
      case 'crossette':
        this.createCrossette();
        break;
    }
  }

  private createPeony() {
    const particleCount = 150 * this.size;
    const hue = parseInt(this.color.match(/hsl\((\d+)/)?.[1] || '0');

    for (let i = 0; i < particleCount; i++) {
      const color = `hsl(${hue + Math.random() * 30}, 100%, ${Math.random() * 30 + 70}%)`;
      this.particles.push(new Particle({
        x: this.x,
        y: this.y,
        color,
        type: 'default'
      }));
    }
  }

  private createWillow() {
    const particleCount = 80 * this.size;
    const hue = parseInt(this.color.match(/hsl\((\d+)/)?.[1] || '0');

    for (let i = 0; i < particleCount; i++) {
      const color = `hsl(${hue}, 100%, ${Math.random() * 20 + 60}%)`;
      this.particles.push(new Particle({
        x: this.x,
        y: this.y,
        color,
        type: 'willow',
        gravity: 0.02,
        decay: 0.005
      }));
    }
  }

  private createRing() {
    const rings = 3;
    const particlesPerRing = 60 * this.size;
    const hue = parseInt(this.color.match(/hsl\((\d+)/)?.[1] || '0');

    for (let ring = 0; ring < rings; ring++) {
      for (let i = 0; i < particlesPerRing; i++) {
        const angle = (i / particlesPerRing) * Math.PI * 2;
        const radius = (ring + 1) * 30;
        const x = this.x + Math.cos(angle) * radius;
        const y = this.y + Math.sin(angle) * radius;
        
        const color = `hsl(${(hue + ring * 60) % 360}, 100%, 70%)`;
        this.particles.push(new Particle({
          x, y,
          color,
          type: 'ring',
          gravity: 0
        }));
      }
    }
  }

  private createCrackle() {
    const clusterCount = 8 * this.size;
    const hue = parseInt(this.color.match(/hsl\((\d+)/)?.[1] || '0');

    for (let c = 0; c < clusterCount; c++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 40;
      const clusterX = this.x + Math.cos(angle) * distance;
      const clusterY = this.y + Math.sin(angle) * distance;
      
      // Small secondary explosion after delay
      setTimeout(() => {
        for (let i = 0; i < 20; i++) {
          const color = `hsl(${hue}, 100%, ${Math.random() * 30 + 70}%)`;
          this.particles.push(new Particle({
            x: clusterX,
            y: clusterY,
            color,
            type: 'sparkle',
            size: 1
          }));
        }
        soundManager.playSparkle();
      }, 100 + Math.random() * 200);
    }
  }

  private createPalm() {
    const branchCount = 5 * this.size;
    const hue = parseInt(this.color.match(/hsl\((\d+)/)?.[1] || '0');

    for (let b = 0; b < branchCount; b++) {
      
      for (let i = 0; i < 30; i++) {
        const color = `hsl(${hue}, 100%, ${Math.random() * 20 + 50}%)`;
        this.particles.push(new Particle({
          x: this.x,
          y: this.y,
          color,
          type: 'willow',
          gravity: 0.01,
          decay: 0.003
        }));
      }
    }
  }

  private createCrossette() {
    const subFireworkCount = 12 * this.size;
    const hue = parseInt(this.color.match(/hsl\((\d+)/)?.[1] || '0');

    for (let i = 0; i < subFireworkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      // Secondary explosion after travel
      setTimeout(() => {
        const x = this.x + vx * 20;
        const y = this.y + vy * 20;
        
        for (let j = 0; j < 15; j++) {
          const color = `hsl(${(hue + 60) % 360}, 100%, 70%)`;
          this.particles.push(new Particle({
            x, y,
            color,
            type: 'default',
            size: 0.8
          }));
        }
        soundManager.playBang(1.5, 0.1);
      }, 300 + Math.random() * 200);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.exploded) {
      // Draw trail
      this.trail.forEach((point, i) => {
        const alpha = i / this.trail.length;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2 * alpha, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color}${Math.floor(alpha * 128).toString(16).padStart(2, '0')}`;
        ctx.fill();
      });

      // Draw firework head
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3 * this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();

      // Draw glow
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, 8 * this.size
      );
      // Convert hsl to rgba for addColorStop
      const hslMatch = this.color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      if (hslMatch) {
        const h = parseInt(hslMatch[1]);
        const s = parseInt(hslMatch[2]);
        const l = parseInt(hslMatch[3]);
        const rgbaColor = this.hslToRgba(h, s, l, 0.8);
        gradient.addColorStop(0, rgbaColor);
      } else {
        gradient.addColorStop(0, this.color);
      }
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 8 * this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw particles
    this.particles.forEach((p) => p.draw(ctx));
  }

  isDead(): boolean {
    return this.exploded && this.particles.length === 0;
  }

  private hslToRgba(h: number, s: number, l: number, a: number): string {
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s / 100;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
}