import { useEffect, useRef, useState, useCallback } from "react";
import { Firework, type FireworkType } from "../fireworks/Firework";
import { soundManager } from "../fireworks/SoundManager";

export default function FireworksCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const fireworksRef = useRef<Firework[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [selectedType, setSelectedType] = useState<FireworkType | 'random'>('random');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenShake, setScreenShake] = useState(true);
  const [performanceMode, setPerformanceMode] = useState(false);
  const shakeRef = useRef({ x: 0, y: 0, intensity: 0 });

  // Apply screen shake effect
  const applyScreenShake = useCallback((intensity: number) => {
    if (!screenShake) return;
    
    shakeRef.current.intensity = intensity;
    setTimeout(() => {
      shakeRef.current.intensity *= 0.7;
    }, 50);
    
    setTimeout(() => {
      shakeRef.current.intensity = 0;
    }, 200);
  }, [screenShake]);

  // Launch a new firework
  const launchFirework = useCallback((customType?: FireworkType | 'random') => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const x = Math.random() * canvas.width;
    const startY = canvas.height;
    const targetY = Math.random() * (canvas.height * 0.5);
    
    // Generate beautiful colors
    const hue = Math.floor(Math.random() * 360);
    const colors = [
      `hsl(${hue}, 100%, 70%)`,
      `hsl(${(hue + 30) % 360}, 100%, 70%)`,
      `hsl(${(hue + 60) % 360}, 100%, 70%)`,
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const typeToUse = customType || selectedType;
    const actualType: FireworkType = typeToUse === 'random' ? 
      ['peony', 'willow', 'ring', 'crackle', 'palm', 'crossette'][Math.floor(Math.random() * 6)] as FireworkType :
      typeToUse as FireworkType;
    
    const size = actualType === 'peony' ? 1.2 : 
                 actualType === 'willow' ? 0.9 : 
                 actualType === 'ring' ? 1.1 : 1;
    
    const firework = new Firework({
      x, startY, targetY, color,
      type: actualType,
      size
    });
    
    fireworksRef.current.push(firework);
    
    // Apply screen shake for large fireworks
    if (size > 1) {
      applyScreenShake(size * 0.3);
    }
  }, [selectedType, applyScreenShake]);

  // Launch multiple fireworks (for New Year burst)
  const launchBurst = useCallback((count: number = 20) => {
    const types: FireworkType[] = ['peony', 'willow', 'ring', 'crackle', 'palm', 'crossette'];
    
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const type = types[Math.floor(Math.random() * types.length)];
        launchFirework(type);
      }, i * 50);
    }
    
    // Big screen shake for burst
    applyScreenShake(1.5);
  }, [launchFirework, applyScreenShake]);

  // Handle click/tap to launch fireworks
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const startY = canvasRef.current.height;
    const targetY = e.clientY - rect.top;
    
    const hue = Math.floor(Math.random() * 360);
    const color = `hsl(${hue}, 100%, 70%)`;
    
    const firework = new Firework({
      x, startY, targetY, color,
      type: selectedType === 'random' ? undefined : selectedType,
      size: 1
    });
    
    fireworksRef.current.push(firework);
  }, [selectedType]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    console.log("Toggle audio button clicked");
    const enabled = soundManager.toggle();
    setAudioEnabled(enabled);
  }, []);

  // Auto-launch fireworks
  useEffect(() => {
    if (!isRunning) return;

    const autoLaunch = setInterval(() => {
      if (Math.random() > 0.7) {
        launchFirework();
      }
    }, 800);

    return () => clearInterval(autoLaunch);
  }, [isRunning, launchFirework]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    let lastTime = 0;
    const fps = 60;
    const interval = 1000 / fps;

    const animate = (timestamp: number) => {
      if (!lastTime || timestamp - lastTime >= interval) {
        lastTime = timestamp;

        // Clear with trail effect
        if (performanceMode) {
          ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          // More subtle trail for better visuals
          ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Add subtle stars in background
          if (Math.random() > 0.97) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.beginPath();
            ctx.arc(
              Math.random() * canvas.width,
              Math.random() * canvas.height * 0.4,
              Math.random() * 1.2 + 0.3,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }

        // Apply screen shake
        if (shakeRef.current.intensity > 0) {
          const shakeX = (Math.random() - 0.5) * shakeRef.current.intensity * 10;
          const shakeY = (Math.random() - 0.5) * shakeRef.current.intensity * 10;
          ctx.translate(shakeX, shakeY);
        }

        // Update and draw fireworks
        fireworksRef.current = fireworksRef.current.filter(f => !f.isDead());
        fireworksRef.current.forEach(firework => {
          firework.update();
          firework.draw(ctx);
        });

        // Reset transform after shake
        if (shakeRef.current.intensity > 0) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [performanceMode]);

  // Firework type descriptions
  const typeDescriptions: Record<FireworkType | 'random', string> = {
    random: "Random mix of all types",
    peony: "Classic round burst explosion",
    willow: "Long falling trail effects",
    ring: "Perfect circle patterns",
    crackle: "Multiple crackling bursts",
    palm: "Branching palm tree effect",
    crossette: "Secondary explosions"
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 cursor-pointer"
        onClick={handleClick}
      />
      
      {/* Firework Type Selector */}
      <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 flex gap-2 flex-wrap justify-center z-10 max-w-4xl">
        {(['random', 'peony', 'willow', 'ring', 'crackle', 'palm', 'crossette'] as const).map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              selectedType === type 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105' 
                : 'bg-white/10 text-white/80 hover:bg-white/20 hover:scale-105'
            }`}
            title={typeDescriptions[type]}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Controls */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
        <button
          onClick={() => {
            console.log("Launch Firework button clicked");
            launchFirework();
          }}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-lg"
        >
          Launch Firework 🎆
        </button>
        <button
          onClick={() => {
            console.log("Big Burst button clicked");
            launchBurst(20);
          }}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-lg"
        >
          Big Burst 💥
        </button>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-full font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-lg"
        >
          {isRunning ? "⏸️ Pause" : "▶️ Resume"}
        </button>
      </div>

      {/* Audio & Settings Controls */}
      <div className="fixed top-6 right-6 flex gap-3 z-10">
        <button
          onClick={toggleAudio}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
            audioEnabled 
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg' 
              : 'bg-gradient-to-r from-red-600 to-rose-600 shadow-lg'
          }`}
          title={audioEnabled ? "Mute sound" : "Unmute sound"}
        >
          {audioEnabled ? "🔊" : "🔇"}
        </button>
        
        <button
          onClick={() => setScreenShake(!screenShake)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
            screenShake 
              ? 'bg-gradient-to-r from-yellow-600 to-amber-600 shadow-lg' 
              : 'bg-gradient-to-r from-gray-700 to-gray-900 shadow-lg'
          }`}
          title={screenShake ? "Disable screen shake" : "Enable screen shake"}
        >
          {screenShake ? "🌋" : "📱"}
        </button>
        
        <button
          onClick={() => setPerformanceMode(!performanceMode)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
            performanceMode 
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg' 
              : 'bg-gradient-to-r from-gray-700 to-gray-900 shadow-lg'
          }`}
          title={performanceMode ? "Quality mode" : "Performance mode"}
        >
          {performanceMode ? "⚡" : "✨"}
        </button>
      </div>

      {/* Current Selection Info */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 text-center z-10">
        <div className="bg-black/60 backdrop-blur-lg rounded-full px-4 py-2 inline-block">
          <span className="text-white/90 text-sm">
            Selected: <span className="font-bold text-yellow-300">{selectedType}</span> • {typeDescriptions[selectedType]}
          </span>
        </div>
      </div>
    </>
  );
}