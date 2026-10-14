import confetti from 'canvas-confetti';

/**
 * Quick burst of confetti for answering a question correctly
 */
export function launchQuestionConfetti() {
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#f43f5e', '#ec4899', '#fb7185', '#fda4af', '#fef08a'],
      ticks: 180,
      disableForReducedMotion: true,
    });
  } catch {
    // Graceful fallback
  }
}

/**
 * Grand celebratory confetti shower for the final "IT'S A DATE!" screen
 */
export function launchGrandConfetti() {
  try {
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#f43f5e', '#ec4899', '#e11d48', '#d946ef', '#fbcfe8', '#fef08a'];

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  } catch {
    // Fallback
  }
}

/**
 * Big burst when making it officially confirmed
 */
export function launchOfficialConfetti() {
  try {
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#ff1493', '#ff69b4', '#ff4500', '#ffd700', '#ffffff'],
    });
  } catch {
    // Fallback
  }
}
