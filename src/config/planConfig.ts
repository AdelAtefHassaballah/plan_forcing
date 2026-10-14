import type { PlanConfig } from '../types/plan';

/**
 * ====================================================================
 * 💌 PLAN CONFIGURATION - PERSONALIZE YOUR INTERACTIVE EXPERIENCE HERE!
 * ====================================================================
 * 
 * You can easily customize this file to change:
 * 1. Recipient's name (optional)
 * 2. Questions, choices, and secret correct answers
 * 3. Funny evasion messages
 * 4. Final screen celebration text
 * 
 * HOW TO CHANGE THE SECRET CORRECT ANSWER:
 * For each question in `questions`, simply set `correctOptionId` to the `id`
 * of the choice you want them to pick (e.g. 'a', 'b', 'c', or 'd').
 * The wrong choices will automatically run away when they try to click them!
 */

export const planConfig: PlanConfig = {
  // Title shown in browser tab and hero badge
  title: "Choose Our Plan ❤️",

  // Optional: enter their name here (e.g., "Sarah"), or leave empty ""
  recipientName: "",

  // Start Screen Settings
  startScreen: {
    badge: "Special Invitation 💌",
    title: "Sooo... let's make a plan! ❤️",
    subtitle: "I made a quick interactive questionnaire for us. Just pick whatever option you want... if you can catch it! 😉",
    startButtonText: "Let's go! ✨",
    hintText: "Warning: Contains playful surprises and zero ability to cancel.",
  },

  // Funny messages that pop up when someone tries to hover/click a runaway button
  evasionMessages: [
    "Too slow! 😂",
    "Nope, not that one! 🙅‍♀️",
    "Are you really trying that hard? 👀",
    "Nice try! 😏",
    "The universe says no ❤️",
    "Error 404: Option unreachable! 🏃💨",
    "Can't touch this! 🕺",
    "Destiny says: look at the other one! ✨",
    "Almost had it! (Just kidding) 😜",
    "Wrong button bestie! 💅",
    "I see you trying! Still nope 🤭",
    "You really thought? 😂",
  ],

  // The Questionnaire Questions
  questions: [
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
      // Secret correct answer: Only option D can be clicked! Others run away.
      correctOptionId: "d",
      successFeedback: "Yay! The best decision! 🥰",
    },
    {
      id: 2,
      question: "When should we do it?",
      subtitle: "When are we making this happen? 📅",
      options: [
        { id: "a", label: "A", text: "Tomorrow", icon: "Sun" },
        { id: "b", label: "B", text: "This weekend ❤️", icon: "Calendar" },
        { id: "c", label: "C", text: "Next month", icon: "CalendarDays" },
        { id: "d", label: "D", text: "Whenever we are both free", icon: "Clock" },
      ],
      // Secret correct answer: Option B
      correctOptionId: "b",
      successFeedback: "This weekend it is! Perfect timing. ❤️",
    },
    {
      id: 3,
      question: "What time works best?",
      subtitle: "Pick the golden hour! ⏰",
      options: [
        { id: "a", label: "A", text: "Morning", icon: "Sunrise" },
        { id: "b", label: "B", text: "Afternoon", icon: "SunMedium" },
        { id: "c", label: "C", text: "Evening ❤️", icon: "Sunset" },
        { id: "d", label: "D", text: "Midnight 😂", icon: "Moon" },
      ],
      // Secret correct answer: Option C
      correctOptionId: "c",
      successFeedback: "Evening vibes are unmatched! ✨",
    },
    {
      id: 4,
      question: "One final question...",
      subtitle: "No pressure at all... 🤭",
      options: [
        { id: "a", label: "A", text: "Are you sure about this?", icon: "HelpCircle" },
        { id: "b", label: "B", text: "Can we cancel?", icon: "Ban" },
        { id: "c", label: "C", text: "YES! ❤️", icon: "HeartHandshake" },
        { id: "d", label: "D", text: "Let me think about it", icon: "Brain" },
      ],
      // Secret correct answer: Option C
      correctOptionId: "c",
      successFeedback: "WOOHOO! That's what I wanted to hear! 🎉",
    },
  ],

  // Final Celebration Screen
  finalScreen: {
    heading: "IT'S A DATE! ❤️🎉",
    subheading: "Congratulations! You've successfully chosen our plan. 😌❤️",
    summaryHeading: "Our Official Plan Details 📋",
    finalMessage: "Can't wait! See you soon. 🥰",
    officialButtonText: "Let's make it official ❤️",
    officialConfirmedMessage: "Deal! It's officially a plan! 💌",
    copyButtonText: "Copy Date Summary 📋",
    copySuccessText: "Copied! Send it to me on WhatsApp/iMessage! 💌",
    restartButtonText: "Play Again 🔄",
  },

  // Audio effects enabled by default (toggle available in header)
  soundEnabledDefault: true,
};
