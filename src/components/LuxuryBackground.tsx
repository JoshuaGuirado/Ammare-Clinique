import { useMemo } from 'react';

interface LuxuryBackgroundProps {
  showRays?: boolean;
  showParticles?: boolean;
}

export default function LuxuryBackground({ showRays = true, showParticles = true }: LuxuryBackgroundProps) {
  // Generate random particles configs once to avoid re-renders during state changes
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 15; i++) {
      const size = Math.random() * 4 + 2; // size between 2px and 6px
      const left = Math.random() * 100; // left position in percentage
      const delay = Math.random() * 18; // animation delay in seconds
      const duration = Math.random() * 12 + 12; // speed between 12s and 24s
      arr.push({ id: i, size, left, delay, duration });
    }
    return arr;
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 select-none">
      {/* Dynamic Gold Glow Orbs */}
      <div className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] max-w-[500px] rounded-full bg-[radial-gradient(circle,rgba(196,164,124,0.12)_0%,transparent_70%)] luxury-glow-orb-1" />
      <div className="absolute bottom-[20%] right-[10%] w-[50vw] h-[50vw] max-w-[600px] rounded-full bg-[radial-gradient(circle,rgba(196,164,124,0.08)_0%,transparent_70%)] luxury-glow-orb-2" />

      {/* Luxury Spotlight Rays */}
      {showRays && (
        <>
          <div className="absolute top-0 left-0 w-[150%] h-[120vh] max-h-[1000px] luxury-light-ray-1" />
          <div className="absolute bottom-0 right-0 w-[150%] h-[120vh] max-h-[1000px] luxury-light-ray-2" />
        </>
      )}

      {/* Floating Golden Dust Particles */}
      {showParticles && (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {particles.map((p) => (
            <div
              key={p.id}
              className="luxury-dust-particle"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                left: `${p.left}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
