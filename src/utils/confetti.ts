import confetti from 'canvas-confetti';

/**
 * Quick burst of confetti for answering a question correctly (neutral colorful palette)
 */
export function launchQuestionConfetti() {
  try {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#3b82f6', '#8b5cf6', '#eab308', '#06b6d4', '#10b981'],
      ticks: 180,
      disableForReducedMotion: true,
    });
  } catch {
    // Graceful fallback
  }
}

/**
 * Grand celebration confetti shower for questionnaire completion
 */
export function launchGrandConfetti() {
  try {
    const end = Date.now() + 2 * 1000;
    const colors = ['#3b82f6', '#8b5cf6', '#eab308', '#6366f1', '#14b8a6'];

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
