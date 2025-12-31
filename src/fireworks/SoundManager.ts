class SoundManager {
  private audioContext: AudioContext | null = null;
  private isAudioEnabled = true;
  private isInitialized = false;

  constructor() {
    // Initialize on user interaction
    this.initOnInteraction();
  }

  private initOnInteraction() {
    const initAudio = () => {
      if (this.isInitialized) return;
      
      try {
        this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        this.isInitialized = true;
        
        // Remove event listeners after first interaction
        document.removeEventListener('click', initAudio);
        document.removeEventListener('keydown', initAudio);
        document.removeEventListener('touchstart', initAudio);
      } catch {
        console.warn('Web Audio API not supported');
        this.isAudioEnabled = false;
      }
    };

    // Initialize on first user interaction
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });
  }

  private ensureAudioContext(): boolean {
    if (!this.isAudioEnabled || !this.audioContext) {
      return false;
    }
    
    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    return true;
  }

  enable() {
    this.isAudioEnabled = true;
  }

  disable() {
    this.isAudioEnabled = false;
  }

  toggle() {
    this.isAudioEnabled = !this.isAudioEnabled;
    return this.isAudioEnabled;
  }

  // Generate whoosh sound (firework launch)
  playWhoosh(pitch = 1, volume = 0.3) {
    if (!this.ensureAudioContext() || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(300 * pitch, now);
    oscillator.frequency.exponentialRampToValueAtTime(80 * pitch, now + 0.6);
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    oscillator.start(now);
    oscillator.stop(now + 0.8);
  }

  // Generate bang sound (firework explosion)
  playBang(pitch = 1, volume = 0.4) {
    if (!this.ensureAudioContext() || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    
    // Main bang
    for (let i = 0; i < 3; i++) {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      const freq = (80 + Math.random() * 40) * pitch * (i + 1);
      oscillator.type = i === 0 ? 'sine' : 'triangle';
      oscillator.frequency.setValueAtTime(freq, now);
      oscillator.frequency.exponentialRampToValueAtTime(freq * 0.3, now + 0.4);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume * (1 - i * 0.3), now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      oscillator.start(now);
      oscillator.stop(now + 0.5);
    }

    // Crackle effect
    setTimeout(() => {
      if (!this.ensureAudioContext() || !this.audioContext) return;
      
      const crackleTime = this.audioContext.currentTime;
      for (let i = 0; i < 5; i++) {
        const crackleOsc = this.audioContext.createOscillator();
        const crackleGain = this.audioContext.createGain();
        
        crackleOsc.connect(crackleGain);
        crackleGain.connect(this.audioContext.destination);
        
        crackleOsc.type = 'square';
        crackleOsc.frequency.setValueAtTime(1000 + Math.random() * 500, crackleTime + i * 0.05);
        crackleOsc.frequency.exponentialRampToValueAtTime(200, crackleTime + i * 0.05 + 0.1);
        
        crackleGain.gain.setValueAtTime(0, crackleTime + i * 0.05);
        crackleGain.gain.linearRampToValueAtTime(volume * 0.2, crackleTime + i * 0.05 + 0.01);
        crackleGain.gain.exponentialRampToValueAtTime(0.001, crackleTime + i * 0.05 + 0.15);
        
        crackleOsc.start(crackleTime + i * 0.05);
        crackleOsc.stop(crackleTime + i * 0.05 + 0.15);
      }
    }, 100);
  }

  // Sparkle sound for particle trails
  playSparkle() {
    if (!this.ensureAudioContext() || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1500, now);
    oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.2);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    oscillator.start(now);
    oscillator.stop(now + 0.25);
  }

  // Celebration fanfare
  playCelebration() {
    if (!this.ensureAudioContext() || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now + index * 0.15);
      
      gainNode.gain.setValueAtTime(0, now + index * 0.15);
      gainNode.gain.linearRampToValueAtTime(0.3, now + index * 0.15 + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + index * 0.15 + 0.5);
      
      oscillator.start(now + index * 0.15);
      oscillator.stop(now + index * 0.15 + 0.5);
    });
  }
}

export const soundManager = new SoundManager();