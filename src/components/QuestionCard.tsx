import React, { useState, useRef, useCallback } from 'react';
import type { QuestionItem, AnswerOption } from '../types/plan';
import { OptionIcon } from './OptionIcon';
import { playDodgeSound, playSuccessSound } from '../utils/audio';
import { launchQuestionConfetti } from '../utils/confetti';
import { Sparkles, MessageCircleQuestion } from 'lucide-react';

interface QuestionCardProps {
  question: QuestionItem;
  questionIndex: number;
  totalQuestions: number;
  evasionMessages: string[];
  soundEnabled: boolean;
  onSelectOption: (option: AnswerOption) => void;
}

interface ButtonPosition {
  x: number;
  y: number;
  hasMoved: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionIndex,
  totalQuestions,
  evasionMessages,
  soundEnabled,
  onSelectOption,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const correctBtnRef = useRef<HTMLButtonElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Track positions of runaway buttons
  const [positions, setPositions] = useState<Record<string, ButtonPosition>>({});
  
  // Track dodging animations per button
  const [dodgingId, setDodgingId] = useState<string | null>(null);

  // Playful feedback toast
  const [evasionToast, setEvasionToast] = useState<{ message: string; key: number } | null>(null);
  const [evasionCount, setEvasionCount] = useState<number>(0);

  // Success celebration state
  const [isCelebrating, setIsCelebrating] = useState<boolean>(false);
  const [selectedCorrectOption, setSelectedCorrectOption] = useState<AnswerOption | null>(null);

  /**
   * Calculate a safe random position inside the container that doesn't overlap the correct answer
   */
  const calculateRunawayPosition = useCallback(
    (wrongOptionId: string) => {
      const container = containerRef.current;
      if (!container) return { x: 0, y: 0 };

      const containerRect = container.getBoundingClientRect();
      const btn = buttonRefs.current.get(wrongOptionId);

      const btnWidth = btn ? btn.offsetWidth : 180;
      const btnHeight = btn ? btn.offsetHeight : 54;
      const padding = 14;

      // Available bounding space inside container
      const maxX = Math.max(padding, containerRect.width - btnWidth - padding);
      const maxY = Math.max(padding, containerRect.height - btnHeight - padding);

      // Get correct button's position relative to container
      let correctBox = { left: 0, top: 0, right: 0, bottom: 0 };
      if (correctBtnRef.current) {
        const correctRect = correctBtnRef.current.getBoundingClientRect();
        const relLeft = correctRect.left - containerRect.left;
        const relTop = correctRect.top - containerRect.top;
        const clearance = 24; // safety margin around correct answer

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

      // Try multiple random locations to find one that doesn't overlap correct button or sit in place
      for (let attempt = 0; attempt < 25; attempt++) {
        const candidateX = Math.floor(Math.random() * (maxX - padding)) + padding;
        const candidateY = Math.floor(Math.random() * (maxY - padding)) + padding;

        const candidateRight = candidateX + btnWidth;
        const candidateBottom = candidateY + btnHeight;

        // Check collision with correct button
        const overlapsCorrect =
          candidateX < correctBox.right &&
          candidateRight > correctBox.left &&
          candidateY < correctBox.bottom &&
          candidateBottom > correctBox.top;

        // Check that it actually moves a meaningful distance from current spot
        const distanceTooSmall =
          currentPos &&
          Math.hypot(candidateX - currentPos.x, candidateY - currentPos.y) < 80;

        if (!overlapsCorrect && !distanceTooSmall) {
          bestX = candidateX;
          bestY = candidateY;
          foundSafeSpot = true;
          break;
        }
      }

      // Fallback: If no spot found by random chance, push to opposite quadrant of correct answer
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
  const handleWrongOptionInteraction = useCallback(
    (optionId: string, e?: React.SyntheticEvent | Event) => {
      if (isCelebrating) return;

      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      // Audio feedback
      playDodgeSound(soundEnabled);

      // Compute new coordinates
      const newPos = calculateRunawayPosition(optionId);

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
      setTimeout(() => setDodgingId(null), 300);

      // Pick funny message
      setEvasionCount((c) => {
        const nextCount = c + 1;
        let randomMsg = evasionMessages[Math.floor(Math.random() * evasionMessages.length)];
        
        // Add cheeky counter comment if they keep trying
        if (nextCount === 4) {
          randomMsg = "4 attempts? You really don't want the right answer huh? 😂";
        } else if (nextCount === 7) {
          randomMsg = "7 tries! Respect the hustle, but it's still NO ❤️";
        } else if (nextCount > 10) {
          randomMsg = "Still clicking? I can do this all day! 🏃💨";
        }

        setEvasionToast({
          message: randomMsg,
          key: Date.now(),
        });
        return nextCount;
      });
    },
    [isCelebrating, soundEnabled, calculateRunawayPosition, evasionMessages]
  );

  /**
   * Handle clicking the correct answer
   */
  const handleSelectCorrect = useCallback(
    (option: AnswerOption) => {
      if (isCelebrating) return;

      setIsCelebrating(true);
      setSelectedCorrectOption(option);
      playSuccessSound(soundEnabled);
      launchQuestionConfetti();

      // Show confirmation toast
      setEvasionToast({
        message: question.successFeedback || 'Good choice! 🥰',
        key: Date.now(),
      });

      // Advance after a sweet moment of celebration
      setTimeout(() => {
        onSelectOption(option);
      }, 1250);
    },
    [isCelebrating, soundEnabled, question.successFeedback, onSelectOption]
  );

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 animate-pop-in relative z-10">
      <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl shadow-rose-200/40">
        {/* Decorative blur spots */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-300/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-300/30 rounded-full blur-2xl pointer-events-none" />

        {/* Question Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold uppercase tracking-wider mb-2 border border-rose-200/60 shadow-xs">
            <MessageCircleQuestion className="w-3.5 h-3.5 text-rose-500" />
            <span>Question {questionIndex} of {totalQuestions}</span>
          </div>

          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-800 tracking-tight leading-snug">
            {question.question}
          </h2>

          {question.subtitle && (
            <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
              {question.subtitle}
            </p>
          )}
        </div>

        {/* Evasion Funny Toast Message */}
        <div className="h-9 flex items-center justify-center mb-3">
          {evasionToast && (
            <div
              key={evasionToast.key}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-md animate-pop-in transition-all duration-200 ${
                isCelebrating
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-200/60'
                  : 'bg-rose-500 text-white shadow-rose-300/60 animate-bounce'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{evasionToast.message}</span>
            </div>
          )}
        </div>

        {/* Interactive Answer Area */}
        <div
          ref={containerRef}
          className="relative w-full min-h-[380px] sm:min-h-[350px] bg-white/60 rounded-2xl p-4 border border-rose-100/80 shadow-inner overflow-hidden select-none"
        >
          {/* Subtle watermark instructions */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
            <span className="font-handwritten text-2xl text-rose-400 font-bold rotate-[-4deg]">
              pick your favorite option ❤️
            </span>
          </div>

          {/* Grid layout for initial placement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full h-full">
            {question.options.map((option) => {
              const isCorrect = option.id === question.correctOptionId;
              const pos = positions[option.id];
              const hasMoved = pos?.hasMoved;
              const isDodging = dodgingId === option.id;
              const isSelected = selectedCorrectOption?.id === option.id;

              // Shared button class styles
              const baseBtnClasses = `
                flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-sm sm:text-base
                transition-all duration-200 select-none cursor-pointer outline-none
                ${
                  isSelected
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-400/50 scale-[1.03] ring-4 ring-rose-200'
                    : 'bg-white hover:bg-rose-50/80 text-slate-800 border-2 border-rose-100 shadow-sm hover:shadow-md hover:border-rose-300'
                }
              `;

              if (isCorrect) {
                // Correct answer: ALWAYS stationary, clickable, and responsive
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
                      <span className="w-7 h-7 rounded-xl bg-rose-100 text-rose-600 font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                        {option.label}
                      </span>
                      <OptionIcon name={option.icon} className="w-4 h-4 text-rose-500 shrink-0" />
                      <span className="truncate text-left flex-1 font-medium">{option.text}</span>
                    </button>
                  </div>
                );
              }

              // Wrong answer: Runaway mechanic!
              return (
                <div key={option.id} className="relative flex">
                  {/* Invisible placeholder if moved, keeping grid stable */}
                  {hasMoved && (
                    <div className="w-full h-[52px] rounded-2xl border-2 border-dashed border-rose-100/60 bg-rose-50/20" />
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
                    // Desktop hover triggers runaway
                    onMouseEnter={(e) => handleWrongOptionInteraction(option.id, e)}
                    onPointerEnter={(e) => {
                      if (e.pointerType === 'mouse') {
                        handleWrongOptionInteraction(option.id, e);
                      }
                    }}
                    // Click/touch attempts trigger runaway immediately before registering selection
                    onClick={(e) => handleWrongOptionInteraction(option.id, e)}
                    onMouseDown={(e) => handleWrongOptionInteraction(option.id, e)}
                    onPointerDown={(e) => handleWrongOptionInteraction(option.id, e)}
                    onTouchStart={(e) => handleWrongOptionInteraction(option.id, e)}
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
                      ${hasMoved ? 'runaway-btn shadow-lg' : 'w-full'}
                      ${isDodging ? 'animate-dodge' : ''}
                    `}
                  >
                    <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs shrink-0">
                      {option.label}
                    </span>
                    <OptionIcon name={option.icon} className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate text-left flex-1 font-medium">{option.text}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer playful tip */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            {evasionCount === 0 ? (
              <span>Tip: Some options might be a little shy... 🏃💨</span>
            ) : (
              <span className="text-rose-500 font-semibold">
                Dodges escaped so far: {evasionCount} 😜
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
