import { useEffect, useState, useCallback, useMemo } from "react";
import FireworksCanvas from "./components/FireworksCanvas";
import Countdown from "./components/Countdown";
import Confetti from "./components/Confetti";
import { soundManager } from "./fireworks/SoundManager";

export default function App() {
  const [isNewYear, setIsNewYear] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [theme, setTheme] = useState<'default' | 'neon' | 'pastel' | 'monochrome'>('default');
  const target = useMemo(() => new Date(Date.now() - 1000), []); // Set target to 1 second ago for testing

  const checkNewYear = useCallback(() => {
    const now = Date.now();
    const isNY = now >= target.getTime();
    
    if (isNY && !isNewYear) {
      setIsNewYear(true);
      setShowConfetti(true);
      
      // Play celebration sounds
      setTimeout(() => {
        soundManager.playCelebration();
        for (let i = 0; i < 10; i++) {
          setTimeout(() => soundManager.playBang(0.8, 0.4), i * 200);
        }
      }, 500);
    }
    
    if (!isNY && isNewYear) {
      setIsNewYear(false);
      setShowConfetti(false);
    }
  }, [isNewYear, target]);

  useEffect(() => {
    const interval = setInterval(checkNewYear, 1000);
    return () => clearInterval(interval);
  }, [checkNewYear]);

  const themes = {
    default: "from-gray-900 via-black to-purple-900",
    neon: "from-gray-900 via-black to-indigo-900",
    pastel: "from-pink-900 via-purple-900 to-blue-900",
    monochrome: "from-gray-800 via-gray-900 to-black"
  };

  const themeGradients = {
    default: "from-yellow-400 via-pink-500 to-cyan-400",
    neon: "from-green-400 via-cyan-500 to-blue-400",
    pastel: "from-pink-300 via-purple-300 to-blue-300",
    monochrome: "from-gray-300 via-gray-400 to-gray-500"
  };

  return (
    <div className={`relative w-screen h-screen bg-gradient-to-b ${themes[theme]} overflow-hidden transition-all duration-1000`}>
      <FireworksCanvas />
      <Countdown />
      {showConfetti && <Confetti />}
      
      {/* Theme Selector */}
      <div className="fixed top-6 left-6 flex flex-col gap-2 z-10">
        <div className="bg-black/60 backdrop-blur-lg rounded-xl p-3">
          <h3 className="text-white text-sm font-semibold mb-2">Theme</h3>
          <div className="flex gap-2">
            {(['default', 'neon', 'pastel', 'monochrome'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`w-8 h-8 rounded-full transition-all ${theme === t ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
                style={{
                  background: t === 'default' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
                               t === 'neon' ? 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)' :
                               t === 'pastel' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' :
                               'linear-gradient(135deg, #868f96 0%, #596164 100%)'
                }}
                title={t.charAt(0).toUpperCase() + t.slice(1)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="fixed top-24 left-6 text-white/70 text-sm max-w-xs z-10 backdrop-blur-lg bg-black/30 p-4 rounded-xl border border-white/10">
        <h3 className="font-bold text-white mb-2">🎆 How to Use</h3>
        <ul className="space-y-1">
          <li>✨ <strong>Click anywhere</strong> to launch fireworks</li>
          <li>✨ <strong>Select firework types</strong> from bottom panel</li>
          <li>✨ <strong>Use buttons</strong> for quick actions</li>
          <li>✨ <strong>Toggle settings</strong> in top-right</li>
          <li>✨ <strong>Sound:</strong> {audioEnabled ? "ON 🔊" : "OFF 🔇"}
            <button
              onClick={() => {
                const enabled = soundManager.toggle();
                setAudioEnabled(enabled);
              }}
              className="ml-2 text-white/70 hover:text-white"
            >
              {audioEnabled ? "🔇" : "🔊"}
            </button>
          </li>
        </ul>
      </div>

      {/* Celebration Overlay */}
      {isNewYear && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-9xl animate-bounce mb-4">🎉</div>
            <h1 className={`text-7xl font-bold bg-gradient-to-r ${themeGradients[theme]} bg-clip-text text-transparent animate-pulse`}>
              HAPPY NEW YEAR!
            </h1>
            <h2 className="text-5xl font-bold text-white/90 mt-4 animate-bounce">
              2026 🎊
            </h2>
            <p className="text-2xl text-white/70 mt-6">
              Wishing you a spectacular year ahead!
            </p>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-white/40 text-xs z-10">
        <p>Fireworks 2026 • Made with React + TypeScript + Canvas</p>
      </div>
    </div>
  );
}