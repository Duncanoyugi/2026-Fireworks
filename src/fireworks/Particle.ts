export interface ParticleConfig {
  x: number;
  y: number;
  color: string;
  size?: number;
  gravity?: number;
  decay?: number;
  friction?: number;
  type?: 'default' | 'sparkle' | 'willow' | 'ring';
}

export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  life: number;
  color: string;
  size: number;
  gravity: number;
  decay: number;
  friction: number;
  type: string;
  angle: number;
  spinSpeed: number;
  trail: { x: number; y: number }[] = [];
  maxTrail = 3;

  constructor(config: ParticleConfig) {
    this.x = config.x;
    this.y = config.y;
    this.color = config.color;
    this.size = config.size || Math.random() * 3 + 1;
    this.gravity = config.gravity || 0.05;
    this.decay = config.decay || Math.random() * 0.02 + 0.01;
    this.friction = config.friction || 0.99;
    this.type = config.type || 'default';
    this.alpha = 1;
    this.life = 100;
    this.angle = Math.random() * Math.PI * 2;
    this.spinSpeed = (Math.random() - 0.5) * 0.1;

    // Different velocity patterns based on type
    switch (this.type) {
      case 'willow': {
        const speed = Math.random() * 2 + 1;
        this.vx = Math.cos(this.angle) * speed;
        this.vy = Math.sin(this.angle) * speed;
        this.gravity = 0.02; // Slower fall
        break;
      }
      case 'ring': {
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * 3;
        this.vy = Math.sin(angle) * 3;
        this.gravity = 0;
        break;
      }
      default: {
        const baseSpeed = Math.random() * 5 + 2;
        this.vx = Math.cos(this.angle) * baseSpeed;
        this.vy = Math.sin(this.angle) * baseSpeed;
      }
    }
  }

  update() {
    // Add to trail
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrail) {
      this.trail.shift();
    }

    // Apply physics
    this.vy += this.gravity;
    this.vx *= this.friction;
    this.vy *= this.friction;
    
    // Special behaviors
    if (this.type === 'ring') {
      this.angle += 0.05;
      this.vx = Math.cos(this.angle) * 3;
      this.vy = Math.sin(this.angle) * 3;
    }

    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    this.alpha -= this.decay;

    // Spin for sparkles
    if (this.type === 'sparkle') {
      this.angle += this.spinSpeed;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.alpha <= 0) return;

    ctx.globalAlpha = this.alpha;

    // Draw trail (optimized - only draw if trail exists and particle is visible)
    if (this.trail.length > 1 && this.alpha > 0.1) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.size * 0.5;
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      ctx.stroke();
    }

    // Draw particle based on type (optimized with early returns)
    switch (this.type) {
      case 'sparkle':
        this.drawSparkle(ctx);
        break;
      case 'willow':
        this.drawWillow(ctx);
        break;
      default:
        this.drawDefault(ctx);
    }

    ctx.globalAlpha = 1;
  }

  private drawDefault(ctx: CanvasRenderingContext2D) {
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.size * 2
    );
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Bright center
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawSparkle(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    
    ctx.fillStyle = this.color;
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(this.size * 3, 0);
      ctx.lineTo(this.size * 2, this.size);
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();
  }

  private drawWillow(ctx: CanvasRenderingContext2D) {
    // Longer, thinner particles
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.size;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx, this.y - this.vy);
    ctx.stroke();
  }

  isDead(): boolean {
    return this.life <= 0 || this.alpha <= 0;
  }
}