export default function NewYearMessage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-20 pointer-events-none">
      <div className="text-center animate-fade-in">
        <h1 className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent animate-pulse mb-6">
          Happy New Year!
        </h1>
        <h2 className="text-5xl md:text-7xl font-bold text-white/90 animate-bounce">
          2026 🎉
        </h2>
        <p className="mt-8 text-xl text-white/70 animate-slide-up">
          Wishing you a spectacular year ahead!
        </p>
      </div>
    </div>
  );
}