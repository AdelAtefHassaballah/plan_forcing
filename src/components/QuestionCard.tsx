import React, { useState, useRef, useCallback } from 'react';
import type { QuizQuestion, QuizOption } from '../types/quiz';
import { playDodgeSound, playSuccessSound } from '../utils/audio';
import { launchQuestionConfetti } from '../utils/confetti';
import { Sparkles, HelpCircle, CheckCircle } from 'lucide-react';

interface QuestionCardProps {
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  soundEnabled: boolean;
  onSelectOption: (option: QuizOption) => void;
}

interface ButtonPosition {
  x: number;
  y: number;
  hasMoved: boolean;
}

const EVASION_MESSAGES = [
  'Too slow!',
  'Nice try!',
  'Not that one!',
  'Are you sure? Try again!',
  'That option has other plans!',
  'You almost got it!',
  'Whoosh! Missed me!',
  'Nope, think again!',
  'Option unavailable!',
];

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionIndex,
  totalQuestions,
  soundEnabled,
  onSelectOption,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const correctBtnRef = useRef<HTMLButtonElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Track absolute positions of runaway buttons
  const [positions, setPositions] = useState<Record<string, ButtonPosition>>({});
  
  // Track dodging animations per button
  const [dodgingId, setDodgingId] = useState<string | null>(null);

  // Playful feedback toast
  const [evasionToast, setEvasionToast] = useState<{ message: string; key: number } | null>(null);
  const [evasionCount, setEvasionCount] = useState<number>(0);

  // Success celebration state
  const [isCelebrating, setIsCelebrating] = useState<boolean>(false);
  const [selectedCorrectOption, setSelectedCorrectOption] = useState<QuizOption | null>(null);

  /**
   * Calculate a safe random position inside the container that doesn't overlap the correct answer
   * and is not directly under the pointer.
   */
  const calculateRunawayPosition = useCallback(
    (wrongOptionId: string, pointerX?: number, pointerY?: number) => {
      const container = containerRef.current;
      if (!container) return { x: 0, y: 0 };

      const containerRect = container.getBoundingClientRect();
      const btn = buttonRefs.current.get(wrongOptionId);

      const btnWidth = btn ? btn.offsetWidth : 180;
      const btnHeight = btn ? btn.offsetHeight : 52;
      const padding = 12;

      const maxX = Math.max(padding, containerRect.width - btnWidth - padding);
      const maxY = Math.max(padding, containerRect.height - btnHeight - padding);

      // Get correct button box relative to container
      let correctBox = { left: 0, top: 0, right: 0, bottom: 0 };
      if (correctBtnRef.current) {
        const correctRect = correctBtnRef.current.getBoundingClientRect();
        const relLeft = correctRect.left - containerRect.left;
        const relTop = correctRect.top - containerRect.top;
        const clearance = 26; // clearance around correct answer

        correctBox = {
          left: relLeft - clearance,
          top: relTop - clearance,
          right: relLeft + correctRect.width + clearance,
          bottom: relTop + correctRect.height + clearance,
        };
      }

      const currentPos = positions[wrongOptionId];
      let bestX = padding;
      let bestY = padding;
      let foundSafeSpot = false;

      // Try multiple random locations
      for (let attempt = 0; attempt < 30; attempt++) {
        const candidateX = Math.floor(Math.random() * (maxX - padding)) + padding;
        const candidateY = Math.floor(Math.random() * (maxY - padding)) + padding;

        const candidateRight = candidateX + btnWidth;
        const candidateBottom = candidateY + btnHeight;

        // Collision check against correct answer
        const overlapsCorrect =
          candidateX < correctBox.right &&
          candidateRight > correctBox.left &&
          candidateY < correctBox.bottom &&
          candidateBottom > correctBox.top;

        // Ensure movement is significant from previous position
        const distanceTooSmall =
          currentPos &&
          Math.hypot(candidateX - currentPos.x, candidateY - currentPos.y) < 80;

        // Ensure new spot is not right under the user's cursor / finger
        let tooCloseToPointer = false;
        if (pointerX !== undefined && pointerY !== undefined) {
          const centerCandidateX = candidateX + btnWidth / 2;
          const centerCandidateY = candidateY + btnHeight / 2;
          tooCloseToPointer = Math.hypot(centerCandidateX - pointerX, centerCandidateY - pointerY) < 100;
        }

        if (!overlapsCorrect && !distanceTooSmall && !tooCloseToPointer) {
          bestX = candidateX;
          bestY = candidateY;
          foundSafeSpot = true;
          break;
        }
      }

      // Fallback: push to opposite quadrant of correct answer
      if (!foundSafeSpot) {
        const isCorrectOnLeft = correctBox.left < containerRect.width / 2;
        const isCorrectOnTop = correctBox.top < containerRect.height / 2;
        bestX = isCorrectOnLeft ? maxX : padding;
        bestY = isCorrectOnTop ? maxY : padding;
      }

      return { x: bestX, y: bestY };
    },
    [positions]
  );

  /**
   * Trigger runaway dodge for an incorrect option
   */
  const handleWrongOptionDodge = useCallback(
    (optionId: string, pointerX?: number, pointerY?: number, e?: React.SyntheticEvent | Event) => {
      if (isCelebrating) return;

      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      playDodgeSound(soundEnabled);

      const newPos = calculateRunawayPosition(optionId, pointerX, pointerY);

      setPositions((prev) => ({
        ...prev,
        [optionId]: {
          x: newPos.x,
          y: newPos.y,
          hasMoved: true,
        },
      }));

      // Trigger wobble animation
      setDodgingId(optionId);
      setTimeout(() => setDodgingId(null), 250);

      // Display dynamic feedback message
      setEvasionCount((c) => {
        const nextCount = c + 1;
        let randomMsg = EVASION_MESSAGES[Math.floor(Math.random() * EVASION_MESSAGES.length)];

        if (nextCount === 4) {
          randomMsg = 'Are you determined? Still not that one!';
        } else if (nextCount === 7) {
          randomMsg = 'Nice effort, but look at the other choices!';
        } else if (nextCount > 10) {
          randomMsg = 'I can dodge all day! Try another option!';
        }

        setEvasionToast({
          message: randomMsg,
          key: Date.now(),
        });
        return nextCount;
      });
    },
    [isCelebrating, soundEnabled, calculateRunawayPosition]
  );

  /**
   * Proximity detection engine for PointerMove (Mouse & Touch/Stylus proximity)
   */
  const handleContainerPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isCelebrating) return;
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const pointerX = e.clientX - containerRect.left;
      const pointerY = e.clientY - containerRect.top;

      // Safety distance radius: 65px for mouse, 45px for touch/pen
      const safetyRadius = e.pointerType === 'touch' ? 45 : 65;

      // Check proximity to each wrong option
      question.options.forEach((opt) => {
        if (opt.id === question.correctOptionId) return;

        const btn = buttonRefs.current.get(opt.id);
        if (!btn) return;

        const pos = positions[opt.id];
        let btnLeft = 0;
        let btnTop = 0;
        let btnWidth = btn.offsetWidth;
        let btnHeight = btn.offsetHeight;

        if (pos?.hasMoved) {
          btnLeft = pos.x;
          btnTop = pos.y;
        } else {
          const btnRect = btn.getBoundingClientRect();
          btnLeft = btnRect.left - containerRect.left;
          btnTop = btnRect.top - containerRect.top;
          btnWidth = btnRect.width;
          btnHeight = btnRect.height;
        }

        // Calculate distance from pointer to closest point on button
        const closestX = Math.max(btnLeft, Math.min(pointerX, btnLeft + btnWidth));
        const closestY = Math.max(btnTop, Math.min(pointerY, btnTop + btnHeight));
        const dist = Math.hypot(pointerX - closestX, pointerY - closestY);

        if (dist < safetyRadius) {
          // Pointer breached safety radius! Dodge immediately!
          handleWrongOptionDodge(opt.id, pointerX, pointerY);
        }
      });
    },
    [isCelebrating, question.options, question.correctOptionId, positions, handleWrongOptionDodge]
  );

  /**
   * Handle selecting the correct answer
   */
  const handleSelectCorrect = useCallback(
    (option: QuizOption) => {
      if (isCelebrating) return;

      setIsCelebrating(true);
      setSelectedCorrectOption(option);
      playSuccessSound(soundEnabled);
      launchQuestionConfetti();

      setEvasionToast({
        message: 'Correct selection!',
        key: Date.now(),
      });

      // Transition smoothly after brief celebration
      setTimeout(() => {
        onSelectOption(option);
      }, 1050);
    },
    [isCelebrating, soundEnabled, onSelectOption]
  );

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 animate-pop-in relative z-10">
      <div className="quiz-card rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-200">
        {/* Soft background tint spots */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-100/50 rounded-full blur-2xl pointer-events-none" />

        {/* Question Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2 border border-indigo-200/60 shadow-xs">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            <span>Question {questionIndex} of {totalQuestions}</span>
          </div>

          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-800 tracking-tight leading-snug">
            {question.question}
          </h2>
        </div>

        {/* Evasion Text Feedback Toast */}
        <div className="h-8 flex items-center justify-center mb-3">
          {evasionToast && (
            <div
              key={evasionToast.key}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-sm animate-pop-in transition-all duration-200 ${
                isCelebrating
                  ? 'bg-emerald-600 text-white shadow-emerald-200'
                  : 'bg-indigo-600 text-white shadow-indigo-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{evasionToast.message}</span>
            </div>
          )}
        </div>

        {/* Interactive Answer Area with Proximity Detection */}
        <div
          ref={containerRef}
          onPointerMove={handleContainerPointerMove}
          className="relative w-full min-h-[380px] sm:min-h-[350px] bg-slate-50/80 rounded-2xl p-4 border border-slate-200 shadow-inner overflow-hidden select-none"
        >
          {/* Subtle grid layout for initial placement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full h-full">
            {question.options.map((option) => {
              const isCorrect = option.id === question.correctOptionId;
              const pos = positions[option.id];
              const hasMoved = pos?.hasMoved;
              const isDodging = dodgingId === option.id;
              const isSelected = selectedCorrectOption?.id === option.id;

              const baseBtnClasses = `
                flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-sm sm:text-base
                transition-all duration-200 select-none cursor-pointer outline-none
                ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-200 scale-[1.02] ring-4 ring-emerald-100'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300'
                }
              `;

              if (isCorrect) {
                // Correct answer: ALWAYS stationary, clickable, and registers immediately
                return (
                  <div key={option.id} className="relative z-10 flex">
                    <button
                      ref={correctBtnRef}
                      type="button"
                      id={`option-${option.id}`}
                      disabled={isCelebrating}
                      onClick={() => handleSelectCorrect(option)}
                      className={`${baseBtnClasses} w-full active:scale-95`}
                    >
                      <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                        {option.letter}
                      </span>
                      <span className="truncate text-left flex-1 font-medium">{option.text}</span>
                      {isSelected && <CheckCircle className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  </div>
                );
              }

              // Wrong answer: Runaway mechanic with proximity and touch interception
              return (
                <div key={option.id} className="relative flex">
                  {/* Placeholder if moved, keeping initial grid stable */}
                  {hasMoved && (
                    <div className="w-full h-[52px] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-100/50" />
                  )}

                  <button
                    ref={(el) => {
                      if (el) {
                        buttonRefs.current.set(option.id, el);
                      } else {
                        buttonRefs.current.delete(option.id);
                      }
                    }}
                    type="button"
                    id={`option-${option.id}`}
                    disabled={isCelebrating}
                    // Direct pointerdown, touchstart, or click intercepts immediately before selection
                    onPointerDown={(e) => handleWrongOptionDodge(option.id, e.clientX, e.clientY, e)}
                    onTouchStart={(e) => handleWrongOptionDodge(option.id, undefined, undefined, e)}
                    onClick={(e) => handleWrongOptionDodge(option.id, undefined, undefined, e)}
                    style={
                      hasMoved
                        ? {
                            position: 'absolute',
                            left: `${pos.x}px`,
                            top: `${pos.y}px`,
                            zIndex: 20,
                            maxWidth: '240px',
                          }
                        : {}
                    }
                    className={`
                      ${baseBtnClasses}
                      ${hasMoved ? 'runaway-btn shadow-lg border-indigo-200' : 'w-full'}
                      ${isDodging ? 'animate-dodge' : ''}
                    `}
                  >
                    <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs shrink-0">
                      {option.letter}
                    </span>
                    <span className="truncate text-left flex-1 font-medium">{option.text}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer feedback counter */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-400 font-medium">
            {evasionCount === 0 ? (
              <span>Move pointer or touch to select your answer</span>
            ) : (
              <span className="text-indigo-600 font-semibold">
                Dodges: {evasionCount}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
