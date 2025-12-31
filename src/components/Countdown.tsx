import { useEffect, useState, useMemo, useCallback } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalMs: 0,
  });
  const [isNewYear, setIsNewYear] = useState(false);

  // Set your target date - January 1, 2026
  const TARGET_DATE = useMemo(() => new Date("2026-01-01T00:00:00").getTime(), []);

  const calculateTimeLeft = useCallback(() => {
    const now = Date.now();
    const difference = TARGET_DATE - now;

    if (difference <= 0) {
      setIsNewYear(true);
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalMs: 0,
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      totalMs: difference,
    };
  }, [TARGET_DATE]);

  useEffect(() => {
    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  // Initial update
  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
  }, [calculateTimeLeft]);

  // If it's New Year, show celebration message
  if (isNewYear) {
    return (
      <div className="fixed top-6 w-full text-center z-10">
        <div className="inline-block bg-gradient-to-r from-yellow-500 to-pink-500 text-white px-8 py-4 rounded-full animate-pulse shadow-2xl">
          <h2 className="text-3xl font-bold">🎉 HAPPY NEW YEAR 2026! 🎉</h2>
          <p className="text-lg mt-2">Let the celebrations begin!</p>
        </div>
      </div>
    );
  }

  // Format numbers to always show 2 digits
  const formatNumber = (num: number) => {
    return num < 10 ? `0${num}` : num.toString();
  };

  // Calculate progress percentage (for animation)
  const progress = Math.max(0, Math.min(100, 100 - (timeLeft.totalMs / (1000 * 60 * 60 * 24 * 365)) * 100));

  return (
    <div className="fixed top-6 w-full text-center z-10">
      <div className="inline-block bg-black/60 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-4">
          Countdown to 2026
        </h2>
        
        <div className="flex gap-4 justify-center mb-4">
          {/* Days */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-b from-purple-800 to-purple-900 text-white text-4xl font-bold w-20 h-20 rounded-xl flex items-center justify-center shadow-lg">
              {formatNumber(timeLeft.days)}
            </div>
            <span className="text-white/80 text-sm mt-2">DAYS</span>
          </div>

          {/* Hours */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-b from-blue-800 to-blue-900 text-white text-4xl font-bold w-20 h-20 rounded-xl flex items-center justify-center shadow-lg">
              {formatNumber(timeLeft.hours)}
            </div>
            <span className="text-white/80 text-sm mt-2">HOURS</span>
          </div>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-b from-green-800 to-green-900 text-white text-4xl font-bold w-20 h-20 rounded-xl flex items-center justify-center shadow-lg">
              {formatNumber(timeLeft.minutes)}
            </div>
            <span className="text-white/80 text-sm mt-2">MINUTES</span>
          </div>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-b from-red-800 to-red-900 text-white text-4xl font-bold w-20 h-20 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
              {formatNumber(timeLeft.seconds)}
            </div>
            <span className="text-white/80 text-sm mt-2">SECONDS</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="text-white/70 text-sm mb-2">
            Time until New Year: {Math.ceil(timeLeft.totalMs / (1000 * 60 * 60 * 24))} days
          </div>
          <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Next Year Info */}
        <div className="mt-4 text-white/60 text-sm">
          <p>Next Year: <span className="text-yellow-300 font-semibold">2026</span></p>
          <p className="text-xs mt-1">(Based on your device's local time)</p>
        </div>
      </div>
    </div>
  );
}