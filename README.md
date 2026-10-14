# Choose Our Plan ❤️ - Funny Interactive Date Questionnaire

A playful, cute, and hilarious interactive web application designed to help someone choose a plan with you.

Whenever they attempt to hover over or click any option **except the secret intended choice**, that button immediately dodges and runs away across the screen while showing funny messages! The correct option stays stationary, clickable, and triggers romantic confetti and sound effects.

---

## ✨ Features

- **The Runaway Answer Mechanic**:
  - Wrong answers calculate collision-free boundaries and smoothly evade hover, clicks, and mobile touch events.
  - Safe bounds clamping ensures buttons never leave the visible area or overlap the correct choice.
  - Hilarious dynamic reactions: *"Too slow! 😂"*, *"Nope, not that one!"*, *"The universe says no ❤️"*, *"Are you really trying that hard? 👀"*.
- **The Correct Choice**:
  - Stays stationary, visible, and registers instantly on the first click.
  - Triggers celebratory confetti showers, cute chimes, and smooth transitions to the next question.
- **Aesthetic Romantic Theme**:
  - Dreamy pastel gradients (pink, cream, lavender, soft rose).
  - Ambient floating hearts and sparkles.
  - Glassmorphism cards with rounded corners and modern typography (Google Fonts *Outfit*, *Plus Jakarta Sans*, and *Caveat*).
- **Interactive Audio Effects**:
  - Web Audio API synthesizer for cartoon boings and romantic chimes (no external audio assets required; toggleable anytime in the header).
- **Final Celebration Screen**:
  - Displays *"IT'S A DATE! ❤️🎉"*.
  - Clean summary of all chosen answers (Activity, Date, Time, Decision).
  - *"Let's make it official ❤️"* button that locks in the date with confetti and seals it with *"Deal! It's officially a plan! 💌"*.
  - *"Copy Date Summary"* (1-click copy formatted for WhatsApp, iMessage, Instagram, or SMS).
  - *"Add to Calendar"* button for Google Calendar.

---

## 🛠️ How to Customize

All settings, questions, and secret answers are centralized in a single file:
👉 **[`src/config/planConfig.ts`](./src/config/planConfig.ts)**

### 1. Change the Secret Correct Answers
In `src/config/planConfig.ts`, each question has a list of `options` (`a`, `b`, `c`, `d`).
To make a choice the only clickable answer, set `correctOptionId` to that option's ID:

```ts
{
  id: 1,
  question: "What should we do?",
  subtitle: "Choose our activity for the day! ☕✨",
  options: [
    { id: "a", label: "A", text: "Go for a coffee", icon: "Coffee" },
    { id: "b", label: "B", text: "Go for a walk", icon: "Footprints" },
    { id: "c", label: "C", text: "Watch a movie", icon: "Film" },
    { id: "d", label: "D", text: "Let you decide ❤️", icon: "Sparkles" },
  ],
  correctOptionId: "d", // <-- Change this to 'a', 'b', 'c', or 'd'
  successFeedback: "Yay! The best decision! 🥰",
}
```

### 2. Personalize the Name and Intro
In `src/config/planConfig.ts`:
```ts
// Set their name (e.g., "Sarah"), or leave as "" for a general greeting
recipientName: "Sarah",

// Change the start screen title or description
startScreen: {
  badge: "Special Invitation 💌",
  title: "Sooo... let's make a plan! ❤️",
  subtitle: "I made a quick interactive questionnaire for us...",
  startButtonText: "Let's go! ✨",
}
```

### 3. Add or Edit Questions
You can add as many questions as you want by appending objects to the `questions` array.

---

## 🚀 Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:5173/`.

4. Build production bundle:
   ```bash
   npm run build
   ```

---

## 🌐 How to Deploy & Send a Public Link

Deploying takes under 2 minutes and provides a free public link (`https://your-name-date.vercel.app`):

### Option A: Vercel (Recommended - Fastest & Free)

1. Push this project folder to your GitHub repository (or upload it).
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New Project"** and import your repository.
4. Framework preset will automatically detect **Vite**.
5. Click **"Deploy"**.
6. You will get a live link like `https://our-date-plan.vercel.app` to copy and send!

*Alternatively using Vercel CLI:*
```bash
npm install -g vercel
vercel
```

### Option B: Netlify (Drag-and-Drop - No GitHub needed)

1. Build the production files:
   ```bash
   npm run build
   ```
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag and drop the `dist` folder into the Netlify drop zone.
4. Your site will be published instantly with a public link!

---

## 📱 Mobile & Desktop Compatibility

- **Desktop**: Mouse hovering over incorrect options causes them to immediately leap away.
- **Mobile Touchscreens**: Touch/pointer events are intercepted before selection is registered, instantly dodging under the finger so wrong options cannot be clicked.
- **Audio**: Web Audio synthesized sound effects work across all modern mobile and desktop browsers with zero latency.
