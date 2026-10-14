import React from 'react';

interface HeartItem {
  id: number;
  size: number;
  left: number;
  delay: number;
  duration: number;
  emoji: string;
  opacity: number;
}

// Precomputed static list of floating hearts with deterministic values (100% pure)
const EMOJIS = ['❤️', '💖', '✨', '🌸', '💕', '🥰', '🧁', '💌'];

const FLOATING_HEARTS: HeartItem[] = Array.from({ length: 22 }, (_, i) => {
  // Deterministic calculation based on index
  const pseudoSeed = (i * 37 + 17) % 100;
  const pseudoSeed2 = (i * 53 + 29) % 100;
  const pseudoSeed3 = (i * 71 + 41) % 100;

  return {
    id: i,
    size: 16 + (pseudoSeed % 18), // 16px to 34px
    left: 2 + (pseudoSeed2 % 94), // 2% to 96%
    delay: +((pseudoSeed3 % 100) / 10).toFixed(1), // 0s to 10s
    duration: +(9 + (pseudoSeed % 8)).toFixed(1), // 9s to 17s
    emoji: EMOJIS[i % EMOJIS.length],
    opacity: +(0.25 + (pseudoSeed2 % 40) / 100).toFixed(2), // 0.25 to 0.65
  };
});

export const FloatingHearts: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {FLOATING_HEARTS.map((h) => (
        <span
          key={h.id}
          className="floating-heart select-none"
          style={{
            left: `${h.left}%`,
            fontSize: `${h.size}px`,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
            opacity: h.opacity,
          }}
          aria-hidden="true"
        >
          {h.emoji}
        </span>
      ))}
    </div>
  );
};
